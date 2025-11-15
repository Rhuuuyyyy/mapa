"""
MAPA Processor V2 - Hierarchical Company+Product NFe processing for MAPA reports.

This module implements the hierarchical approach where:
1. Company names are extracted from XML <emit><xNome>
2. Product names are extracted from XML <prod><xProd>
3. Company MAPA registration is looked up from user's company registry
4. Product MAPA registration is looked up from company's product registry
5. Full registration = {company.mapa_registration}-{product.mapa_registration}
6. Products are classified as Import (UF=EX) or Domestic
7. Units are converted to Tonnes (KG÷1000, TN as-is) BEFORE aggregation
8. Quantities are aggregated by full MAPA registration number
9. Unregistered companies/products are reported as errors (not silently skipped)
10. All final output is in Tonnes
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from decimal import Decimal
from collections import defaultdict
from sqlalchemy.orm import Session

from app.models import Company, Product
from app.utils.nfe_processor import NFeData, NFeProduct


@dataclass
class UnregisteredEntry:
    """Company or product that was not found in user's registry"""
    error_type: str  # "company" or "product"
    company_name: str
    product_name: Optional[str]
    nfe_number: str
    quantity: Decimal
    unit: str


@dataclass
class MapaAggregatedRow:
    """
    Aggregated row for MAPA report output.

    Simpler structure focused on the new requirements:
    - MAPA Registration No. (full: company-product)
    - Product (Reference)
    - Unit
    - Quantity (Import)
    - Quantity (Other Entries / Domestic)
    """
    mapa_registration: str
    product_reference: str  # First product name encountered for this registration
    unit: str = "Tonelada"
    quantity_import: Decimal = Decimal("0")
    quantity_domestic: Decimal = Decimal("0")

    # Metadata
    source_nfes: List[str] = field(default_factory=list)


@dataclass
class ProcessingResult:
    """
    Result of NFe processing.

    Either successful (with aggregated rows) or with errors (unregistered companies/products).
    """
    success: bool
    aggregated_rows: List[MapaAggregatedRow] = field(default_factory=list)
    unregistered_entries: List[UnregisteredEntry] = field(default_factory=list)
    error_message: Optional[str] = None


class MAPAProcessorV2:
    """
    Hierarchical Company+Product processor for MAPA reports.

    Key features:
    1. NO automatic extraction of MAPA registration from XML
    2. User must register companies with partial MAPA registration (e.g., "PR-12345")
    3. User must register products within companies with partial registration (e.g., "6.000001")
    4. Full registration = company.mapa_registration + "-" + product.mapa_registration
    5. Clear error reporting for unregistered companies/products
    6. Simplified output format (just 5 columns)
    """

    def __init__(self, user_id: int, db_session: Session):
        """
        Initialize processor.

        Args:
            user_id: ID of current user (for company/product lookup)
            db_session: Database session for queries
        """
        self.user_id = user_id
        self.db_session = db_session
        self.company_cache: Dict[str, Company] = {}
        self.product_cache: Dict[Tuple[int, str], Product] = {}  # (company_id, product_name) -> Product
        self._load_registries()

    def _load_registries(self) -> None:
        """Load user's companies and products into memory for fast lookup"""
        # Load companies
        companies = self.db_session.query(Company).filter(
            Company.user_id == self.user_id
        ).all()

        self.company_cache = {
            company.company_name: company
            for company in companies
        }

        # Load all products for all companies
        for company in companies:
            for product in company.products:
                key = (company.id, product.product_name)
                self.product_cache[key] = product

    def process_nfes(self, nfe_list: List[NFeData]) -> ProcessingResult:
        """
        Process list of NFe data using hierarchical Company+Product approach.

        Args:
            nfe_list: List of NFeData objects from XML files

        Returns:
            ProcessingResult with either aggregated rows or error list
        """
        unregistered_entries = []
        aggregated_data: Dict[str, MapaAggregatedRow] = {}

        for nfe_data in nfe_list:
            # Extract company name from emitter
            company_name = nfe_data.emitente.razao_social.strip() if nfe_data.emitente.razao_social else ""

            # Step 1: Look up company in registry
            company = self.company_cache.get(company_name)

            if not company:
                # Company NOT found - add to error list for ALL products in this NFe
                for product in nfe_data.produtos:
                    unregistered_entries.append(UnregisteredEntry(
                        error_type="company",
                        company_name=company_name,
                        product_name=product.descricao.strip(),
                        nfe_number=nfe_data.numero_nota or "N/A",
                        quantity=product.quantidade,
                        unit=product.unidade
                    ))
                continue  # Skip this entire NFe

            # Process each product in the NFe
            for product in nfe_data.produtos:
                # Step 2: Extract product name
                product_name = product.descricao.strip()

                # Step 3: Look up product in company's registry
                product_key = (company.id, product_name)
                product_entry = self.product_cache.get(product_key)

                if not product_entry:
                    # Product NOT found in this company - add to error list
                    unregistered_entries.append(UnregisteredEntry(
                        error_type="product",
                        company_name=company_name,
                        product_name=product_name,
                        nfe_number=nfe_data.numero_nota or "N/A",
                        quantity=product.quantidade,
                        unit=product.unidade
                    ))
                    continue  # Skip this product

                # Step 4: Build full MAPA registration
                # Format: {company.mapa_registration}-{product.mapa_registration}
                full_mapa_registration = f"{company.mapa_registration}-{product_entry.mapa_registration}"

                # Step 5: Extract quantity and unit
                quantity = product.quantidade
                unit = product.unidade

                # Step 6: Convert to tonnes BEFORE aggregation (CRITICAL)
                quantity_in_tonnes = self._convert_to_tonnes(quantity, unit)

                # Step 7: Classify entry (Import vs Domestic)
                is_import = self._is_import(nfe_data)

                # Step 8: Aggregate by full MAPA registration
                if full_mapa_registration not in aggregated_data:
                    # Use product reference if available, otherwise product name
                    reference = product_entry.product_reference if product_entry.product_reference else product_name

                    aggregated_data[full_mapa_registration] = MapaAggregatedRow(
                        mapa_registration=full_mapa_registration,
                        product_reference=reference,
                        unit="Tonelada"  # Always Tonelada in final output
                    )

                row = aggregated_data[full_mapa_registration]

                # Add converted quantities
                if is_import:
                    row.quantity_import += quantity_in_tonnes
                else:
                    row.quantity_domestic += quantity_in_tonnes

                # Track source NFe
                if nfe_data.numero_nota and nfe_data.numero_nota not in row.source_nfes:
                    row.source_nfes.append(nfe_data.numero_nota)

        # Check if there are unregistered entries
        if unregistered_entries:
            company_errors = sum(1 for e in unregistered_entries if e.error_type == "company")
            product_errors = sum(1 for e in unregistered_entries if e.error_type == "product")

            error_msg = f"Encontrados erros: {company_errors} empresa(s) não cadastrada(s), {product_errors} produto(s) não cadastrado(s)."

            return ProcessingResult(
                success=False,
                unregistered_entries=unregistered_entries,
                error_message=error_msg
            )

        # Convert aggregated dict to list
        aggregated_rows = list(aggregated_data.values())

        return ProcessingResult(
            success=True,
            aggregated_rows=aggregated_rows
        )

    def _is_import(self, nfe_data: NFeData) -> bool:
        """
        Determine if NFe represents an import.

        Args:
            nfe_data: NFe data to check

        Returns:
            True if import (UF = EX), False otherwise
        """
        emitente_uf = nfe_data.emitente.endereco.uf.upper() if nfe_data.emitente.endereco.uf else ""
        return emitente_uf == "EX"

    def _convert_to_tonnes(self, quantity: Decimal, unit: str) -> Decimal:
        """
        Convert quantity to Tonnes based on unit.

        Args:
            quantity: Quantity value from NFe
            unit: Unit from NFe (TON, TN, KG, etc.)

        Returns:
            Quantity converted to Tonnes
        """
        if not unit:
            # No unit specified - assume KG and convert
            return quantity / Decimal("1000")

        unit_upper = unit.upper().strip()

        # Check if already in tonnes
        if unit_upper in ["TON", "TONELADA", "TONELADAS", "TN", "T"]:
            return quantity  # Already in tonnes

        # Convert KG to tonnes
        elif unit_upper in ["KG", "QUILOGRAMA", "QUILOGRAMAS"]:
            return quantity / Decimal("1000")

        # Unknown unit - log warning and assume KG
        else:
            print(f"Warning: Unknown unit '{unit}'. Assuming KG and converting to tonnes.")
            return quantity / Decimal("1000")

    def _normalize_unit(self, unit: str) -> str:
        """
        Normalize unit to standard format.

        Args:
            unit: Unit from NFe

        Returns:
            Normalized unit (default: "Tonelada")
        """
        if not unit:
            return "Tonelada"

        unit_upper = unit.upper().strip()

        # Common unit mappings
        if unit_upper in ["TON", "TONELADA", "TONELADAS", "T"]:
            return "Tonelada"
        elif unit_upper in ["KG", "QUILOGRAMA", "QUILOGRAMAS"]:
            return "Quilograma"

        return "Tonelada"  # Default

    def get_catalog_coverage_stats(self) -> Dict[str, int]:
        """
        Get statistics about catalog coverage.

        Returns:
            Dict with statistics (total_companies, total_products)
        """
        return {
            "total_companies": len(self.company_cache),
            "total_products": len(self.product_cache)
        }

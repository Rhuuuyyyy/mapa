"""
MAPA Processor V2 - Catalog-based NFe processing for MAPA reports.

This module implements the new catalog-based approach where:
1. Product names are extracted from XML <xProd>
2. MAPA registration numbers are looked up from user's catalog (not auto-extracted)
3. Products are classified as Import (UF=EX) or Domestic
4. Units are converted to Tonnes (KG÷1000, TN as-is) BEFORE aggregation
5. Quantities are aggregated by MAPA registration number
6. Unregistered products are reported as errors (not silently skipped)
7. All final output is in Tonnes
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from decimal import Decimal
from collections import defaultdict
from sqlalchemy.orm import Session

from app.models import RawMaterialCatalog
from app.utils.nfe_processor import NFeData, NFeProduct


@dataclass
class UnregisteredProduct:
    """Product that was not found in user's catalog"""
    product_name: str
    nfe_number: str
    quantity: Decimal
    unit: str


@dataclass
class MapaAggregatedRow:
    """
    Aggregated row for MAPA report output.

    Simpler structure focused on the new requirements:
    - MAPA Registration No.
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

    Either successful (with aggregated rows) or with errors (unregistered products).
    """
    success: bool
    aggregated_rows: List[MapaAggregatedRow] = field(default_factory=list)
    unregistered_products: List[UnregisteredProduct] = field(default_factory=list)
    error_message: Optional[str] = None


class MAPAProcessorV2:
    """
    New catalog-based processor for MAPA reports.

    Key differences from old approach:
    1. NO automatic extraction of MAPA registration from XML
    2. User must manually map product names to MAPA registrations in catalog
    3. Clear error reporting for unmapped products
    4. Simplified output format (just 5 columns)
    """

    def __init__(self, user_id: int, db_session: Session):
        """
        Initialize processor.

        Args:
            user_id: ID of current user (for catalog lookup)
            db_session: Database session for catalog queries
        """
        self.user_id = user_id
        self.db_session = db_session
        self.catalog_cache: Dict[str, RawMaterialCatalog] = {}
        self._load_catalog()

    def _load_catalog(self) -> None:
        """Load user's catalog into memory for fast lookup"""
        entries = self.db_session.query(RawMaterialCatalog).filter(
            RawMaterialCatalog.user_id == self.user_id
        ).all()

        self.catalog_cache = {
            entry.product_name: entry
            for entry in entries
        }

    def process_nfes(self, nfe_list: List[NFeData]) -> ProcessingResult:
        """
        Process list of NFe data using catalog-based approach.

        Args:
            nfe_list: List of NFeData objects from XML files

        Returns:
            ProcessingResult with either aggregated rows or error list
        """
        unregistered_products = []
        aggregated_data: Dict[str, MapaAggregatedRow] = {}

        for nfe_data in nfe_list:
            for product in nfe_data.produtos:
                # Step 1: Extract product name (key)
                product_name = product.descricao.strip()

                # Step 2: Look up in catalog
                catalog_entry = self.catalog_cache.get(product_name)

                if not catalog_entry:
                    # Product NOT found in catalog - add to error list
                    unregistered_products.append(UnregisteredProduct(
                        product_name=product_name,
                        nfe_number=nfe_data.numero_nota or "N/A",
                        quantity=product.quantidade,
                        unit=product.unidade
                    ))
                    continue  # Skip this product

                # Step 3: Extract data from NFe
                mapa_registration = catalog_entry.mapa_registration
                quantity = product.quantidade
                unit = product.unidade

                # Step 4: Convert to tonnes BEFORE aggregation (CRITICAL)
                quantity_in_tonnes = self._convert_to_tonnes(quantity, unit)

                # Step 5: Classify entry (Import vs Domestic)
                is_import = self._is_import(nfe_data)

                # Step 6: Aggregate by MAPA registration
                if mapa_registration not in aggregated_data:
                    aggregated_data[mapa_registration] = MapaAggregatedRow(
                        mapa_registration=mapa_registration,
                        product_reference=product_name,  # First occurrence
                        unit="Tonelada"  # Always Tonelada in final output
                    )

                row = aggregated_data[mapa_registration]

                # Add converted quantities
                if is_import:
                    row.quantity_import += quantity_in_tonnes
                else:
                    row.quantity_domestic += quantity_in_tonnes

                # Track source NFe
                if nfe_data.numero_nota and nfe_data.numero_nota not in row.source_nfes:
                    row.source_nfes.append(nfe_data.numero_nota)

        # Check if there are unregistered products
        if unregistered_products:
            return ProcessingResult(
                success=False,
                unregistered_products=unregistered_products,
                error_message="Existem produtos não cadastrados no catálogo. Adicione-os ao catálogo e processe novamente."
            )

        # Success - return aggregated data
        return ProcessingResult(
            success=True,
            aggregated_rows=list(aggregated_data.values())
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
            Dictionary with total_entries count
        """
        return {
            'total_entries': len(self.catalog_cache)
        }

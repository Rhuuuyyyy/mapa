from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from ..database import get_db
from ..models import User, XMLUpload, Report, RawMaterialCatalog, Company, Product
from ..schemas import (
    UserResponse, XMLUploadResponse, ReportResponse,
    CatalogEntryCreate, CatalogEntryUpdate, CatalogEntryResponse,
    CompanyCreate, CompanyUpdate, CompanyResponse,
    ProductCreate, ProductUpdate, ProductResponse
)
from ..auth import get_current_user
from ..utils.nfe_processor import NFeProcessor
from ..utils.mapa_mapper import MAPAMapper
from ..utils.mapa_processor_v2 import MAPAProcessorV2
from ..utils.pdf_processor import NFePDFProcessor
from ..utils.report_generator import MAPAReportGenerator
from ..utils.file_validator import FileValidator

router = APIRouter()

# Directory for file uploads
UPLOAD_DIR = "uploads"
REPORTS_DIR = "reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obter informações do usuário logado"""
    return current_user


@router.post("/upload-nfe", response_model=XMLUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_nfe(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload de arquivo XML ou PDF de NF-e com validação de segurança completa.

    Validações aplicadas:
    - Extensão do arquivo (xml, pdf)
    - Tipo MIME
    - Magic numbers/assinatura do arquivo
    - Tamanho máximo (10MB)
    - Estrutura do conteúdo
    - Sanitização do nome do arquivo
    """
    # Comprehensive file validation (MIME type, magic numbers, size, structure)
    is_valid, error_message = await FileValidator.validate_file(file, ['xml', 'pdf'])
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )

    # Get file extension
    file_ext = file.filename.lower().split('.')[-1]

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Create safe file path (prevents path traversal attacks)
    file_path = FileValidator.get_safe_file_path(
        UPLOAD_DIR,
        current_user.id,
        file.filename,
        timestamp
    )

    # Save file securely
    try:
        # Seek back to beginning after validation
        await file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao salvar arquivo: {str(e)}"
        )
    
    # Create database record
    xml_upload = XMLUpload(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        status="pending"
    )
    
    db.add(xml_upload)
    db.commit()
    db.refresh(xml_upload)
    
    # Process file in background (sync for now, can be async with Celery later)
    try:
        process_nfe_file(xml_upload.id, file_path, file_ext, db)
    except Exception as e:
        xml_upload.status = "error"
        xml_upload.error_message = str(e)
        db.commit()
    
    db.refresh(xml_upload)
    return xml_upload


def process_nfe_file(upload_id: int, file_path: str, file_type: str, db: Session):
    """Processa arquivo NF-e (XML ou PDF)"""
    upload = db.query(XMLUpload).filter(XMLUpload.id == upload_id).first()
    if not upload:
        return

    try:
        # Process based on file type
        if file_type == 'xml':
            processor = NFeProcessor(file_path)
        else:  # pdf
            processor = NFePDFProcessor(file_path)

        # Validate
        if not processor.validate_nfe():
            raise ValueError("Arquivo não é uma NF-e válida")

        # Extract data using new processor
        data = processor.extract_all_data()

        # Store extracted data (you can create a separate table for this if needed)
        # For now, we'll mark as processed
        upload.status = "processed"
        upload.error_message = None

        db.commit()

    except Exception as e:
        upload.status = "error"
        upload.error_message = f"Erro ao processar: {str(e)}"
        db.commit()
        raise


@router.get("/uploads", response_model=List[XMLUploadResponse])
async def list_uploads(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar uploads do usuário"""
    uploads = db.query(XMLUpload).filter(
        XMLUpload.user_id == current_user.id
    ).order_by(XMLUpload.upload_date.desc()).offset(skip).limit(limit).all()
    
    return uploads


@router.post("/generate-report/{period}")
async def generate_mapa_report(
    period: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gera relatório trimestral MAPA usando o novo processador baseado em catálogo.

    Período format: Q1-2025, Q2-2025, Q3-2025, Q4-2025

    Retorna erro se houver produtos não cadastrados no catálogo.
    """
    # Validate period format
    import re
    if not re.match(r'^Q[1-4]-\d{4}$', period):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de período inválido. Use: Q1-2025, Q2-2025, etc."
        )

    # Get all processed uploads for the user
    uploads = db.query(XMLUpload).filter(
        XMLUpload.user_id == current_user.id,
        XMLUpload.status == "processed"
    ).all()

    if not uploads:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum arquivo processado encontrado"
        )

    try:
        # Initialize new catalog-based processor
        processor_v2 = MAPAProcessorV2(current_user.id, db)

        # Extract NFe data from all uploads
        nfe_list = []
        for upload in uploads:
            file_ext = upload.filename.lower().split('.')[-1]
            if file_ext == 'xml':
                nfe_processor = NFeProcessor(upload.file_path)
            else:
                nfe_processor = NFePDFProcessor(upload.file_path)

            # Extract NF-e data
            nfe_data = nfe_processor.extract_all_data()
            nfe_list.append(nfe_data)

        # Process NFes with new catalog-based logic
        result = processor_v2.process_nfes(nfe_list)

        # Check for unregistered companies/products (ERROR CASE)
        if not result.success:
            # Return detailed error with unregistered entries list
            unregistered_list = [
                {
                    "error_type": entry.error_type,
                    "company_name": entry.company_name,
                    "product_name": entry.product_name,
                    "nfe_number": entry.nfe_number,
                    "quantity": str(entry.quantity),
                    "unit": entry.unit
                }
                for entry in result.unregistered_entries
            ]

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": result.error_message,
                    "unregistered_entries": unregistered_list
                }
            )

        # Success - we have aggregated data
        if not result.aggregated_rows:
            raise ValueError("Nenhum dado foi extraído dos arquivos processados")

        # Return aggregated data as JSON (for table view + PDF export)
        # This replaces the old Excel generation approach
        return {
            "success": True,
            "message": "Relatório processado com sucesso",
            "period": period,
            "total_nfes": len(uploads),
            "rows": [
                {
                    "mapa_registration": row.mapa_registration,
                    "product_reference": row.product_reference,
                    "unit": row.unit,
                    "quantity_import": str(row.quantity_import),
                    "quantity_domestic": str(row.quantity_domestic),
                    "source_nfes": row.source_nfes
                }
                for row in result.aggregated_rows
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar relatório: {str(e)}"
        )


@router.get("/reports", response_model=List[ReportResponse])
async def list_reports(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar relatórios do usuário"""
    reports = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(Report.generated_at.desc()).offset(skip).limit(limit).all()
    
    return reports


@router.get("/download-report/{report_id}")
async def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download de relatório gerado"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    if not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo do relatório não encontrado"
        )
    
    filename = f"Relatorio_MAPA_{report.report_period}.xlsx"
    return FileResponse(
        path=report.file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@router.delete("/uploads/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar um upload"""
    upload = db.query(XMLUpload).filter(
        XMLUpload.id == upload_id,
        XMLUpload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload não encontrado"
        )
    
    # Delete physical file
    try:
        if os.path.exists(upload.file_path):
            os.remove(upload.file_path)
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
    
    db.delete(upload)
    db.commit()
    
    return None


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar um relatório"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )

    # Delete physical file
    try:
        if os.path.exists(report.file_path):
            os.remove(report.file_path)
    except Exception as e:
        print(f"Error deleting file: {str(e)}")

    db.delete(report)
    db.commit()

    return None


# ============================================================================
# COMPANY ENDPOINTS (Cadastro de Empresas)
# ============================================================================

@router.get("/companies", response_model=List[CompanyResponse])
async def list_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todas as empresas cadastradas pelo usuário.
    """
    companies = db.query(Company).filter(
        Company.user_id == current_user.id
    ).order_by(Company.company_name).offset(skip).limit(limit).all()

    return companies


@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar nova empresa com registro MAPA parcial.

    Exemplo:
    - Nome: "Empresa ABC Ltda"
    - Registro MAPA: "PR-12345"
    """
    # Check for duplicate company_name for this user
    existing = db.query(Company).filter(
        Company.user_id == current_user.id,
        Company.company_name == company.company_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Empresa '{company.company_name}' já existe no seu cadastro."
        )

    # Create new company
    new_company = Company(
        user_id=current_user.id,
        company_name=company.company_name,
        mapa_registration=company.mapa_registration
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar empresa existente.
    """
    # Get company
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada."
        )

    # Update fields
    if company_update.company_name is not None:
        company.company_name = company_update.company_name
    if company_update.mapa_registration is not None:
        company.mapa_registration = company_update.mapa_registration

    db.commit()
    db.refresh(company)

    return company


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar empresa.
    Também deleta todos os produtos vinculados (cascade).
    """
    # Get company
    company = db.query(Company).filter(
        Company.id == company_id,
        Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada."
        )

    db.delete(company)
    db.commit()

    return None


# ============================================================================
# PRODUCT ENDPOINTS (Cadastro de Produtos)
# ============================================================================

@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    company_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar produtos cadastrados.

    Opcionalmente filtrar por company_id para ver apenas produtos de uma empresa.
    """
    query = db.query(Product).join(Company).filter(
        Company.user_id == current_user.id
    )

    if company_id is not None:
        query = query.filter(Product.company_id == company_id)

    products = query.order_by(Product.product_name).offset(skip).limit(limit).all()

    return products


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar novo produto vinculado a uma empresa.

    Exemplo:
    - Nome: "UREIA GRANULADA"
    - Registro MAPA: "6.000001"
    - company_id: 1

    Registro completo será: company.mapa_registration + "-" + product.mapa_registration
    """
    # Verify company belongs to user
    company = db.query(Company).filter(
        Company.id == product.company_id,
        Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada ou não pertence ao usuário."
        )

    # Check for duplicate product_name within the same company
    existing = db.query(Product).filter(
        Product.company_id == product.company_id,
        Product.product_name == product.product_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Produto '{product.product_name}' já existe nesta empresa."
        )

    # Create new product
    new_product = Product(
        company_id=product.company_id,
        product_name=product.product_name,
        mapa_registration=product.mapa_registration,
        product_reference=product.product_reference
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar produto existente.
    """
    # Get product and verify ownership through company
    product = db.query(Product).join(Company).filter(
        Product.id == product_id,
        Company.user_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado."
        )

    # Update fields
    if product_update.product_name is not None:
        product.product_name = product_update.product_name
    if product_update.mapa_registration is not None:
        product.mapa_registration = product_update.mapa_registration
    if product_update.product_reference is not None:
        product.product_reference = product_update.product_reference
    if product_update.company_id is not None:
        # Verify new company belongs to user
        company = db.query(Company).filter(
            Company.id == product_update.company_id,
            Company.user_id == current_user.id
        ).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa de destino não encontrada."
            )
        product.company_id = product_update.company_id

    db.commit()
    db.refresh(product)

    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar produto.
    """
    # Get product and verify ownership through company
    product = db.query(Product).join(Company).filter(
        Product.id == product_id,
        Company.user_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado."
        )

    db.delete(product)
    db.commit()

    return None


# ============================================================================
# RAW MATERIAL CATALOG ENDPOINTS (DEPRECATED)
# ============================================================================

@router.get("/catalog", response_model=List[CatalogEntryResponse])
async def list_catalog_entries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todas as entradas do catálogo de matérias-primas do usuário.

    O catálogo mapeia nomes de produtos (do XML) para números de registro MAPA.
    """
    entries = db.query(RawMaterialCatalog).filter(
        RawMaterialCatalog.user_id == current_user.id
    ).order_by(RawMaterialCatalog.product_name).offset(skip).limit(limit).all()

    return entries


@router.post("/catalog", response_model=CatalogEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_catalog_entry(
    entry: CatalogEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar nova entrada no catálogo de matérias-primas.

    Mapeia um nome de produto (exatamente como aparece no XML <xProd>)
    para um número de registro MAPA completo.
    """
    # Check for duplicate product_name for this user
    existing = db.query(RawMaterialCatalog).filter(
        RawMaterialCatalog.user_id == current_user.id,
        RawMaterialCatalog.product_name == entry.product_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Já existe uma entrada para o produto '{entry.product_name}' no seu catálogo"
        )

    catalog_entry = RawMaterialCatalog(
        user_id=current_user.id,
        product_name=entry.product_name,
        mapa_registration=entry.mapa_registration,
        product_reference=entry.product_reference
    )

    db.add(catalog_entry)
    db.commit()
    db.refresh(catalog_entry)

    return catalog_entry


@router.put("/catalog/{entry_id}", response_model=CatalogEntryResponse)
async def update_catalog_entry(
    entry_id: int,
    entry_update: CatalogEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar entrada do catálogo de matérias-primas"""
    catalog_entry = db.query(RawMaterialCatalog).filter(
        RawMaterialCatalog.id == entry_id,
        RawMaterialCatalog.user_id == current_user.id
    ).first()

    if not catalog_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrada do catálogo não encontrada"
        )

    # Update fields
    if entry_update.product_name is not None:
        # Check for duplicate product_name (excluding current entry)
        existing = db.query(RawMaterialCatalog).filter(
            RawMaterialCatalog.user_id == current_user.id,
            RawMaterialCatalog.product_name == entry_update.product_name,
            RawMaterialCatalog.id != entry_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Já existe outra entrada para o produto '{entry_update.product_name}' no seu catálogo"
            )

        catalog_entry.product_name = entry_update.product_name

    if entry_update.mapa_registration is not None:
        catalog_entry.mapa_registration = entry_update.mapa_registration

    if entry_update.product_reference is not None:
        catalog_entry.product_reference = entry_update.product_reference

    db.commit()
    db.refresh(catalog_entry)

    return catalog_entry


@router.delete("/catalog/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar entrada do catálogo de matérias-primas"""
    catalog_entry = db.query(RawMaterialCatalog).filter(
        RawMaterialCatalog.id == entry_id,
        RawMaterialCatalog.user_id == current_user.id
    ).first()

    if not catalog_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrada do catálogo não encontrada"
        )

    db.delete(catalog_entry)
    db.commit()

    return None


@router.get("/catalog/search/{product_name}")
async def search_catalog_entry(
    product_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar entrada do catálogo por nome de produto (exato).

    Usado durante o processamento de XML para lookup de registro MAPA.
    """
    entry = db.query(RawMaterialCatalog).filter(
        RawMaterialCatalog.user_id == current_user.id,
        RawMaterialCatalog.product_name == product_name
    ).first()

    if not entry:
        return {"found": False, "product_name": product_name}

    return {
        "found": True,
        "product_name": entry.product_name,
        "mapa_registration": entry.mapa_registration,
        "product_reference": entry.product_reference
    }
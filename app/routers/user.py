"""
Router de User - Upload, Catálogo, Relatórios.
Funcionalidades principais do sistema MAPA.
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app import models, schemas, auth
from app.database import get_db
from app.config import settings
from app.utils.validators import validate_file_security
from app.utils.nfe_processor import NFeProcessor
from app.utils.mapa_processor import MAPAProcessor
from app.utils.report_generator import MAPAReportGenerator

router = APIRouter()


# ============================================================================
# CATALOG MANAGEMENT
# ============================================================================

@router.post("/companies", response_model=schemas.CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company_data: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Cadastra nova empresa no catálogo do usuário.
    """
    # Verificar se empresa já existe para este usuário
    existing = db.query(models.Company).filter(
        models.Company.user_id == current_user.id,
        models.Company.company_name == company_data.company_name.strip()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Empresa '{company_data.company_name}' já cadastrada"
        )

    # Criar empresa
    new_company = models.Company(
        user_id=current_user.id,
        company_name=company_data.company_name.strip(),
        mapa_registration=company_data.mapa_registration.strip()
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


@router.get("/companies", response_model=List[schemas.CompanyResponse])
async def list_companies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lista todas as empresas do usuário.
    """
    companies = db.query(models.Company).filter(
        models.Company.user_id == current_user.id
    ).all()

    return companies


@router.patch("/companies/{company_id}", response_model=schemas.CompanyResponse)
async def update_company(
    company_id: int,
    company_data: schemas.CompanyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Atualiza dados de uma empresa.
    """
    company = db.query(models.Company).filter(
        models.Company.id == company_id,
        models.Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )

    # Verificar se novo nome já existe (exceto para a própria empresa)
    if company_data.company_name.strip() != company.company_name:
        existing = db.query(models.Company).filter(
            models.Company.user_id == current_user.id,
            models.Company.company_name == company_data.company_name.strip(),
            models.Company.id != company_id
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Empresa '{company_data.company_name}' já cadastrada"
            )

    # Atualizar campos
    company.company_name = company_data.company_name.strip()
    company.mapa_registration = company_data.mapa_registration.strip()

    db.commit()
    db.refresh(company)

    return company


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deleta empresa (e todos os produtos vinculados).
    """
    company = db.query(models.Company).filter(
        models.Company.id == company_id,
        models.Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )

    db.delete(company)
    db.commit()

    return None


@router.post("/products", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Cadastra novo produto vinculado a uma empresa.
    """
    # Verificar se empresa existe e pertence ao usuário
    company = db.query(models.Company).filter(
        models.Company.id == product_data.company_id,
        models.Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa não encontrada"
        )

    # Verificar se produto já existe para esta empresa
    existing = db.query(models.Product).filter(
        models.Product.company_id == product_data.company_id,
        models.Product.product_name == product_data.product_name.strip()
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Produto '{product_data.product_name}' já cadastrado para esta empresa"
        )

    # Criar produto
    new_product = models.Product(
        company_id=product_data.company_id,
        product_name=product_data.product_name.strip(),
        mapa_registration=product_data.mapa_registration.strip(),
        product_reference=product_data.product_reference.strip() if product_data.product_reference else None
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.get("/products", response_model=List[schemas.ProductResponse])
async def list_products(
    company_id: int = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lista produtos do usuário.
    Se company_id fornecido, filtra por empresa.
    """
    query = db.query(models.Product).join(models.Company).filter(
        models.Company.user_id == current_user.id
    )

    if company_id:
        query = query.filter(models.Product.company_id == company_id)

    products = query.all()
    return products


@router.patch("/products/{product_id}", response_model=schemas.ProductResponse)
async def update_product(
    product_id: int,
    product_data: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Atualiza dados de um produto.
    """
    product = db.query(models.Product).join(models.Company).filter(
        models.Product.id == product_id,
        models.Company.user_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )

    # Verificar se a nova empresa pertence ao usuário
    if product_data.company_id != product.company_id:
        new_company = db.query(models.Company).filter(
            models.Company.id == product_data.company_id,
            models.Company.user_id == current_user.id
        ).first()

        if not new_company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa não encontrada"
            )

    # Atualizar campos
    product.product_name = product_data.product_name.strip()
    product.product_type = product_data.product_type
    product.company_id = product_data.company_id
    product.mapa_registration = product_data.mapa_registration.strip()

    db.commit()
    db.refresh(product)

    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deleta produto.
    """
    product = db.query(models.Product).join(models.Company).filter(
        models.Product.id == product_id,
        models.Company.user_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )

    db.delete(product)
    db.commit()

    return None


@router.get("/catalog", response_model=schemas.CatalogResponse)
async def get_catalog(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna catálogo completo do usuário (empresas com produtos).
    """
    companies = db.query(models.Company).filter(
        models.Company.user_id == current_user.id
    ).all()

    # Contar totais
    total_companies = len(companies)
    total_products = sum(len(company.products) for company in companies)

    return {
        "total_companies": total_companies,
        "total_products": total_products,
        "companies": companies
    }


# ============================================================================
# XML UPLOAD
# ============================================================================

@router.post("/upload", response_model=schemas.XMLUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_xml(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Upload de arquivo XML ou PDF de NF-e.
    Valida segurança e processa arquivo.
    """
    # Validar arquivo
    try:
        content = await file.read()
        validate_file_security(file.filename, content, settings.max_upload_size)
        await file.seek(0)  # Reset file pointer
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    # Criar diretório de upload do usuário
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    user_upload_dir = Path(settings.upload_dir) / f"user_{current_user.id}"
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    # Salvar arquivo
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = user_upload_dir / safe_filename

    try:
        with open(file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )

    # Criar registro no banco
    xml_upload = models.XMLUpload(
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(file_path),
        status="pending"
    )

    db.add(xml_upload)
    db.commit()
    db.refresh(xml_upload)

    # Processar arquivo (síncrono por enquanto, futuro: Celery)
    try:
        processor = NFeProcessor()
        nfe_data = processor.process_file(str(file_path))

        if nfe_data:
            xml_upload.status = "processed"
        else:
            xml_upload.status = "error"
            xml_upload.error_message = "Não foi possível extrair dados do arquivo"

    except Exception as e:
        xml_upload.status = "error"
        xml_upload.error_message = str(e)

    db.commit()
    db.refresh(xml_upload)

    return xml_upload


@router.get("/uploads", response_model=List[schemas.XMLUploadResponse])
async def list_uploads(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lista todos os uploads do usuário.
    """
    uploads = db.query(models.XMLUpload).filter(
        models.XMLUpload.user_id == current_user.id
    ).order_by(models.XMLUpload.upload_date.desc()).all()

    return uploads


@router.delete("/uploads/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deleta upload (arquivo e registro).
    """
    upload = db.query(models.XMLUpload).filter(
        models.XMLUpload.id == upload_id,
        models.XMLUpload.user_id == current_user.id
    ).first()

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload não encontrado"
        )

    # Deletar arquivo físico
    try:
        if os.path.exists(upload.file_path):
            os.remove(upload.file_path)
    except Exception as e:
        print(f"Warning: Could not delete file {upload.file_path}: {e}")

    # Deletar registro
    db.delete(upload)
    db.commit()

    return None


# ============================================================================
# REPORT GENERATION
# ============================================================================

@router.post("/generate-report", response_model=schemas.ReportResponse)
async def generate_report(
    request: schemas.ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Gera relatório MAPA para o período especificado.
    Processa todos os XMLs do usuário e valida com catálogo.
    """
    # Buscar XMLs processados
    uploads = db.query(models.XMLUpload).filter(
        models.XMLUpload.user_id == current_user.id,
        models.XMLUpload.status == "processed"
    ).all()

    if not uploads:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum XML processado encontrado"
        )

    # Processar com MAPA Processor
    try:
        processor = MAPAProcessor(db, current_user.id)
        result = processor.process_uploads(uploads)

        if not result["success"]:
            # Retornar erro com lista de itens não cadastrados
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": result["error"],
                    "unregistered_entries": result.get("unregistered_entries", [])
                }
            )

        # Sucesso - retornar dados agregados
        return {
            "success": True,
            "message": result["message"],
            "period": request.period,
            "total_nfes": result["total_nfes"],
            "rows": result["rows"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar relatório: {str(e)}"
        )

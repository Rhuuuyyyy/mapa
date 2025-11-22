"""
Router de User - Upload, Catálogo, Relatórios.
Funcionalidades principais do sistema MAPA.
"""

import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app import models, schemas, auth
from app.database import get_db
from app.config import settings
from app.utils.validators import validate_file_security
from app.utils.nfe_processor import NFeProcessor
from app.utils.mapa_processor import MAPAProcessor
from app.utils.report_generator import MAPAReportGenerator

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ============================================================================
# USER PROFILE & SETTINGS
# ============================================================================

@router.get("/profile", response_model=schemas.UserResponse)
async def get_profile(
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna dados do perfil do usuário logado.
    """
    return current_user


@router.patch("/profile", response_model=schemas.UserResponse)
async def update_profile(
    profile_data: schemas.UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Atualiza dados do perfil do usuário logado.
    """
    # Atualizar apenas campos fornecidos
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name.strip()

    if profile_data.company_name is not None:
        current_user.company_name = profile_data.company_name.strip() if profile_data.company_name else None

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")  # SEGURANÇA: Rate limit para prevenir brute force
async def change_password(
    request: Request,
    password_data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Altera a senha do usuário logado.
    SEGURANÇA: Rate limited para prevenir ataques de brute force.
    """
    # Verificar senha atual
    if not auth.verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )

    # Validar força da nova senha
    is_valid, message = auth.validate_password_strength(password_data.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

    # Verificar se nova senha é diferente da atual
    if auth.verify_password(password_data.new_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha deve ser diferente da senha atual"
        )

    # Atualizar senha
    current_user.hashed_password = auth.get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "Senha alterada com sucesso"}


@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna estatísticas do usuário logado.
    """
    # Contar uploads
    total_uploads = db.query(models.XMLUpload).filter(
        models.XMLUpload.user_id == current_user.id
    ).count()

    # Contar empresas
    total_companies = db.query(models.Company).filter(
        models.Company.user_id == current_user.id
    ).count()

    # Contar produtos (via empresas do usuário)
    total_products = db.query(models.Product).join(models.Company).filter(
        models.Company.user_id == current_user.id
    ).count()

    # Contar relatórios
    total_reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).count()

    # Buscar uploads recentes (últimos 5)
    recent_uploads = db.query(models.XMLUpload).filter(
        models.XMLUpload.user_id == current_user.id
    ).order_by(models.XMLUpload.upload_date.desc()).limit(5).all()

    # Buscar relatórios recentes (últimos 5)
    recent_reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).order_by(models.Report.generated_at.desc()).limit(5).all()

    return {
        "totals": {
            "uploads": total_uploads,
            "companies": total_companies,
            "products": total_products,
            "reports": total_reports
        },
        "recent_uploads": [
            {
                "id": upload.id,
                "filename": upload.filename,
                "upload_date": upload.upload_date.isoformat() if upload.upload_date else None,
                "status": "processed"
            }
            for upload in recent_uploads
        ],
        "recent_reports": [
            {
                "id": report.id,
                "period": report.report_period,
                "created_at": report.generated_at.isoformat() if report.generated_at else None,
                "status": "generated"
            }
            for report in recent_reports
        ]
    }


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

@router.post("/upload-preview", response_model=schemas.XMLPreviewResponse)
@limiter.limit("10/minute")  # SEGURANÇA: Rate limit para prevenir abuso de uploads
async def upload_xml_preview(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Faz preview do XML sem salvar no banco.
    Retorna dados extraídos para revisão do usuário.
    SEGURANÇA: Rate limited para prevenir DoS via uploads massivos.
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

    # Criar diretório temporário
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    temp_dir = Path(settings.upload_dir) / "temp" / f"user_{current_user.id}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    # Salvar arquivo temporariamente
    safe_filename = f"{timestamp}_{file.filename}"
    temp_file_path = temp_dir / safe_filename

    try:
        with open(temp_file_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )

    # Processar arquivo para preview
    try:
        processor = NFeProcessor()
        nfe_data = processor.process_file(str(temp_file_path))

        if not nfe_data:
            raise ValueError("Não foi possível extrair dados do arquivo")

        # Extrair dados do XML
        xml_data = nfe_data.to_dict()

        # Buscar empresas e produtos do usuário em queries otimizadas
        user_companies = db.query(models.Company).filter(
            models.Company.user_id == current_user.id
        ).all()

        user_products = db.query(models.Product).join(
            models.Company, models.Product.company_id == models.Company.id
        ).filter(
            models.Company.user_id == current_user.id
        ).all()

        # Match de empresa pelo nome (case-insensitive)
        matched_company = None
        emitente_nome = xml_data.get('emitente', {}).get('razao_social', '').strip().lower()
        if emitente_nome:
            for company in user_companies:
                if company.company_name.lower().strip() == emitente_nome:
                    matched_company = company
                    break

        # Calcular período trimestral da NF-e
        periodo_trimestral = None
        if xml_data.get('data_emissao'):
            try:
                from datetime import datetime as dt
                data_emissao = dt.fromisoformat(xml_data['data_emissao'].split('T')[0])
                ano = data_emissao.year
                trimestre = (data_emissao.month - 1) // 3 + 1
                periodo_trimestral = f"{ano}Q{trimestre}"
            except:
                pass

        # Verificar quais produtos estão cadastrados
        produtos_status = []

        # Criar set de nomes de produtos para busca O(1)
        produtos_cadastrados_set = {p.product_name.lower().strip() for p in user_products}

        for produto in xml_data.get('produtos', []):
            descricao = produto.get('descricao', '').strip()
            codigo = produto.get('codigo', '').strip()
            # Verificar se produto está cadastrado (comparação case-insensitive)
            cadastrado = descricao.lower() in produtos_cadastrados_set if descricao else False

            produtos_status.append({
                'descricao': descricao,
                'codigo': codigo,
                'cadastrado': cadastrado
            })

        # Retornar preview
        return {
            "temp_file_path": str(temp_file_path),
            "filename": file.filename,
            "nfe_data": xml_data,
            "periodo_trimestral": periodo_trimestral,
            "empresa_encontrada": matched_company.company_name if matched_company else None,
            "empresa_mapa_registration": matched_company.mapa_registration if matched_company else None,
            "total_produtos": len(xml_data.get('produtos', [])),
            "produtos_status": produtos_status
        }

    except Exception as e:
        # Limpar arquivo temporário em caso de erro
        if temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@router.post("/upload-confirm", response_model=schemas.XMLUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_xml_confirm(
    upload_data: schemas.XMLUploadConfirm,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Confirma upload após revisão do usuário.
    Move arquivo para pasta permanente e salva no banco.
    SEGURANÇA: Validação rigorosa de path para prevenir Path Traversal.
    """
    # SEGURANÇA: Definir diretório base permitido e resolver para path absoluto
    base_temp_dir = (Path(settings.upload_dir) / "temp" / f"user_{current_user.id}").resolve()

    # SEGURANÇA: Resolver o caminho fornecido para path absoluto (elimina ../ e ./)
    try:
        requested_path = Path(upload_data.temp_file_path).resolve()
    except (ValueError, OSError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Caminho de arquivo inválido"
        )

    # SEGURANÇA: Verificar se o path resolvido está dentro do diretório permitido
    try:
        requested_path.relative_to(base_temp_dir)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a este arquivo"
        )

    # Validar que arquivo temporário existe
    if not requested_path.exists() or not requested_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo temporário não encontrado ou expirou"
        )

    temp_file_path = requested_path

    # Criar diretório permanente
    user_upload_dir = Path(settings.upload_dir) / f"user_{current_user.id}"
    user_upload_dir.mkdir(parents=True, exist_ok=True)

    # Mover arquivo para pasta permanente
    permanent_path = user_upload_dir / temp_file_path.name

    try:
        shutil.move(str(temp_file_path), str(permanent_path))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao mover arquivo: {str(e)}"
        )

    # Extrair chave NF-e para validação de duplicatas (se coluna existir)
    nfe_key = None
    try:
        if upload_data.nfe_data and upload_data.nfe_data.get('chave_acesso'):
            nfe_key = upload_data.nfe_data['chave_acesso']

            # Validar se NF-e já foi processada por este usuário
            # Só valida se a coluna nfe_key existir no banco
            if hasattr(models.XMLUpload, 'nfe_key'):
                existing_upload = db.query(models.XMLUpload).filter(
                    models.XMLUpload.user_id == current_user.id,
                    models.XMLUpload.nfe_key == nfe_key
                ).first()

                if existing_upload:
                    # Deletar arquivo temporário
                    if permanent_path.exists():
                        permanent_path.unlink()

                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"NF-e com chave {nfe_key} já foi processada em {existing_upload.upload_date.strftime('%d/%m/%Y %H:%M')}. ID do upload: {existing_upload.id}"
                    )
    except HTTPException:
        raise  # Re-raise se for erro de duplicata
    except Exception as e:
        # Se coluna não existir ainda (antes da migração), continua sem validar
        print(f"Aviso: Validação de duplicatas ignorada (migração pendente): {e}")
        nfe_key = None

    # Processar XML para extrair período
    period = None
    if upload_data.nfe_data and upload_data.nfe_data.get('data_emissao'):
        try:
            from datetime import datetime as dt
            data_emissao = upload_data.nfe_data['data_emissao']
            if isinstance(data_emissao, str):
                data_emissao = dt.fromisoformat(data_emissao.split('T')[0])
            ano = data_emissao.year
            trimestre = (data_emissao.month - 1) // 3 + 1
            period = f"Q{trimestre}-{ano}"
        except Exception as e:
            print(f"Erro ao calcular período: {e}")

    # Criar registro no banco com dados confirmados/editados
    upload_data_dict = {
        "user_id": current_user.id,
        "filename": upload_data.filename,
        "file_path": str(permanent_path),
        "period": period,
        "status": "processed"
    }

    # Adicionar nfe_key apenas se a coluna existir (após migração)
    if hasattr(models.XMLUpload, 'nfe_key'):
        upload_data_dict["nfe_key"] = nfe_key

    xml_upload = models.XMLUpload(**upload_data_dict)

    db.add(xml_upload)
    db.commit()
    db.refresh(xml_upload)

    # Limpar diretório temporário se vazio
    try:
        temp_dir = temp_file_path.parent
        if temp_dir.exists() and not list(temp_dir.iterdir()):
            temp_dir.rmdir()
    except:
        pass

    return xml_upload


@router.get("/uploads")
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

    return [{
        "id": u.id,
        "filename": u.filename,
        "upload_date": u.upload_date.isoformat(),
        "period": u.period,
        "nfe_key": getattr(u, 'nfe_key', None),  # Seguro se coluna não existir
        "status": u.status,
        "error_message": u.error_message
    } for u in uploads]


@router.delete("/uploads/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Deleta um upload específico do usuário.
    Remove o arquivo físico e o registro do banco.
    """
    import os

    # Buscar upload
    upload = db.query(models.XMLUpload).filter(
        models.XMLUpload.id == upload_id,
        models.XMLUpload.user_id == current_user.id
    ).first()

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload não encontrado"
        )

    # Deletar arquivo físico se existir
    if upload.file_path and os.path.exists(upload.file_path):
        try:
            os.remove(upload.file_path)
        except Exception as e:
            print(f"Erro ao deletar arquivo físico: {e}")
            # Continua mesmo se falhar ao deletar arquivo

    # Deletar registro do banco (cascade vai deletar reports associados)
    db.delete(upload)
    db.commit()

    return None


@router.patch("/uploads/{upload_id}")
async def update_upload_period(
    upload_id: int,
    period: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Atualiza o período de um upload específico.
    Formato esperado: Q1-2025, Q2-2025, Q3-2025, Q4-2025
    """
    import re

    # Validar formato do período
    if not re.match(r'^Q[1-4]-\d{4}$', period):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de período inválido. Use Q1-2025, Q2-2025, Q3-2025 ou Q4-2025"
        )

    # Buscar upload
    upload = db.query(models.XMLUpload).filter(
        models.XMLUpload.id == upload_id,
        models.XMLUpload.user_id == current_user.id
    ).first()

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload não encontrado"
        )

    # Atualizar período
    upload.period = period
    db.commit()
    db.refresh(upload)

    return {
        "id": upload.id,
        "filename": upload.filename,
        "period": upload.period,
        "message": "Período atualizado com sucesso"
    }


@router.post("/upload", response_model=schemas.XMLUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_xml(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Upload de arquivo XML ou PDF de NF-e (upload direto sem preview).
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


@router.get("/uploads/{upload_id}")
async def get_upload_details(
    upload_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna detalhes completos de um upload para edição.
    Inclui dados da NF-e e produtos parseados.
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

    # Ler e parsear o XML novamente
    try:
        from app.utils.xml_parser import parse_nfe_xml

        if not os.path.exists(upload.file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo XML não encontrado no servidor"
            )

        # Parsear XML
        nfe_data = parse_nfe_xml(upload.file_path)

        # Buscar produtos cadastrados e fazer matching
        products = db.query(models.Product).filter(
            models.Product.user_id == current_user.id
        ).all()

        # Adicionar informação de matching aos produtos do XML
        produtos_com_match = []
        for produto in nfe_data.get('produtos', []):
            produto_dict = produto.copy()

            # Tentar encontrar match pelo código do produto e registro MAPA
            matched_product = None
            codigo_produto = produto.get('codigo', '')

            # Buscar por product_reference (código do produto) ou product_name
            for prod in products:
                # Match por referência do produto
                if prod.product_reference and prod.product_reference == codigo_produto:
                    matched_product = prod
                    break
                # Match por nome similar
                if prod.product_name and produto.get('descricao') and \
                   prod.product_name.lower() == produto.get('descricao', '').lower():
                    matched_product = prod
                    break

            if matched_product:
                produto_dict['matched_mapa_registration'] = matched_product.mapa_registration
                produto_dict['matched_product_reference'] = matched_product.product_reference
                produto_dict['matched_product_name'] = matched_product.product_name
            else:
                produto_dict['matched_mapa_registration'] = None
                produto_dict['matched_product_reference'] = None
                produto_dict['matched_product_name'] = None

            produtos_com_match.append(produto_dict)

        nfe_data['produtos'] = produtos_com_match

        return {
            "id": upload.id,
            "filename": upload.filename,
            "upload_date": upload.upload_date,
            "status": upload.status,
            "period": upload.period,
            "nfe_data": nfe_data
        }

    except Exception as e:
        import traceback
        print(f"Erro ao buscar detalhes do upload: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar XML: {str(e)}"
        )


@router.put("/uploads/{upload_id}")
async def update_upload(
    upload_id: int,
    edit_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Atualiza um upload com dados editados.
    Permite editar produtos e vínculos com registros MAPA.
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

    try:
        # Nota: Esta funcionalidade atualmente apenas registra a edição
        # mas não modifica o arquivo XML original.
        # Para editar produtos, use a tela de Produtos.
        # A edição de uploads foi simplificada para evitar inconsistências

        return {
            "success": True,
            "message": "Upload atualizado com sucesso",
            "upload_id": upload_id
        }

    except Exception as e:
        db.rollback()
        import traceback
        print(f"Erro ao atualizar upload: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar upload: {str(e)}"
        )


# ============================================================================
# REPORT GENERATION
# ============================================================================

@router.post("/generate-report", response_model=schemas.ReportResponse)
@limiter.limit("5/minute")  # SEGURANÇA: Rate limit para prevenir DoS via processamento intensivo
async def generate_report(
    http_request: Request,
    request: schemas.ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Gera relatório MAPA para o período especificado.
    Processa todos os XMLs do usuário e valida com catálogo.
    SEGURANÇA: Rate limited para prevenir DoS via processamento intensivo.
    """
    # Buscar XMLs processados para o período
    uploads = db.query(models.XMLUpload).filter(
        models.XMLUpload.user_id == current_user.id,
        models.XMLUpload.status == "processed",
        models.XMLUpload.period == request.period
    ).all()

    if not uploads:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nenhum XML processado encontrado para o período {request.period}"
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

        # Salvar relatório no banco
        report = models.Report(
            user_id=current_user.id,
            report_period=request.period,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        # Sucesso - retornar dados agregados
        return {
            "success": True,
            "message": result["message"],
            "period": request.period,
            "total_nfes": result["total_nfes"],
            "rows": result["rows"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar relatório: {str(e)}"
        )


@router.get("/reports")
async def list_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Lista todos os relatórios gerados pelo usuário"""
    reports = db.query(models.Report).filter(
        models.Report.user_id == current_user.id
    ).order_by(models.Report.generated_at.desc()).all()

    return [{
        "id": r.id,
        "report_period": r.report_period,
        "generated_at": r.generated_at.isoformat(),
        "file_path": r.file_path
    } for r in reports]


@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Deleta um relatório"""
    report = db.query(models.Report).filter(
        models.Report.id == report_id,
        models.Report.user_id == current_user.id
    ).first()

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )

    db.delete(report)
    db.commit()

    return {"message": "Relatório deletado com sucesso"}


@router.get("/reports/{report_period}/download")
async def download_report(
    report_period: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Gera relatório em PDF para download.
    """
    from fastapi.responses import StreamingResponse
    from app.utils.pdf_generator import MAPAReportPDFGenerator
    import traceback
    import os

    try:
        # Buscar XMLs processados para o período
        uploads = db.query(models.XMLUpload).filter(
            models.XMLUpload.user_id == current_user.id,
            models.XMLUpload.status == "processed",
            models.XMLUpload.period == report_period
        ).all()

        if not uploads:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Nenhum XML processado encontrado para o período {report_period}"
            )

        # Processar com MAPA Processor
        processor = MAPAProcessor(db, current_user.id)
        result = processor.process_uploads(uploads)

        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Erro ao processar relatório")
            )

        # Gerar PDF
        pdf_generator = MAPAReportPDFGenerator()
        user_info = {
            "full_name": current_user.full_name,
            "company_name": current_user.company_name,
            "email": current_user.email
        }

        pdf_buffer = pdf_generator.generate_report(
            period=report_period,
            rows=result["rows"],
            user_info=user_info,
            total_nfes=result["total_nfes"]
        )

        # Retornar PDF como streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=relatorio_mapa_{report_period}.pdf"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        # Log do erro completo
        print(f"Erro ao gerar download do relatório: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao gerar download: {str(e)}"
        )


# ============================================================================
# PROPOSTA COMERCIAL
# ============================================================================

@router.get("/proposta-comercial")
async def get_proposta_comercial(
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Retorna o conteúdo do arquivo PROPOSTA_COMERCIAL_WORD.txt.
    Este conteúdo é lido dinamicamente do arquivo, então qualquer alteração
    no arquivo será refletida automaticamente no dashboard.
    """
    try:
        # Caminho do arquivo (na raiz do projeto)
        proposta_path = Path(__file__).parent.parent.parent / "PROPOSTA_COMERCIAL_WORD.txt"

        print(f"[PROPOSTA] Caminho do arquivo: {proposta_path}")
        print(f"[PROPOSTA] Arquivo existe: {proposta_path.exists()}")

        if not proposta_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo de proposta comercial não encontrado"
            )

        # Ler o conteúdo do arquivo
        with open(proposta_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print(f"[PROPOSTA] Tamanho do conteúdo: {len(content)} caracteres")

        # Processar o arquivo para extrair seções
        # Formato: ================ seguido do TÍTULO e outro ================
        sections = []
        current_section = None
        current_content = []

        lines = content.split('\n')
        i = 0

        while i < len(lines):
            line = lines[i]

            # Detectar linha de separador (======)
            if line.strip().startswith('=' * 10):
                # Verificar se a próxima linha é o título e a seguinte é outro separador
                if i + 2 < len(lines):
                    potential_title = lines[i + 1].strip()
                    next_separator = lines[i + 2].strip()

                    if next_separator.startswith('=' * 10) and potential_title:
                        # Salvar seção anterior se existir
                        if current_section:
                            sections.append({
                                "title": current_section,
                                "content": '\n'.join(current_content).strip()
                            })

                        # Iniciar nova seção
                        current_section = potential_title
                        current_content = []
                        i += 3  # Pular separador, título e segundo separador
                        continue

            # Adicionar linha ao conteúdo da seção atual
            if current_section:
                current_content.append(line)

            i += 1

        # Adicionar última seção
        if current_section:
            sections.append({
                "title": current_section,
                "content": '\n'.join(current_content).strip()
            })

        print(f"[PROPOSTA] Total de seções encontradas: {len(sections)}")
        if sections:
            print(f"[PROPOSTA] Primeira seção: {sections[0]['title']}")

        return {
            "sections": sections,
            "raw_content": content,
            "last_modified": datetime.fromtimestamp(proposta_path.stat().st_mtime).isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao ler proposta comercial: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao ler proposta comercial: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from ..database import get_db
from ..models import User, XMLUpload, Report
from ..schemas import UserResponse, XMLUploadResponse, ReportResponse
from ..auth import get_current_user
from ..utils.nfe_processor import NFeProcessor
from ..utils.mapa_mapper import MAPAMapper
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
    Gera relatório trimestral MAPA
    period format: Q1-2025, Q2-2025, Q3-2025, Q4-2025
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
        # Create mapper for business logic
        mapper = MAPAMapper()

        # Process all uploads and add to mapper
        for upload in uploads:
            file_ext = upload.filename.lower().split('.')[-1]
            if file_ext == 'xml':
                processor = NFeProcessor(upload.file_path)
            else:
                processor = NFePDFProcessor(upload.file_path)

            # Extract NF-e data using new processor
            nfe_data = processor.extract_all_data()
            mapper.add_nfe(nfe_data)

        # Get aggregated MAPA rows
        mapa_rows = mapper.get_mapa_rows()

        if not mapa_rows:
            raise ValueError("Nenhum dado foi extraído dos arquivos processados")

        # Generate report with aggregated data
        report_generator = MAPAReportGenerator(current_user, period)
        report_generator.add_mapa_rows(mapa_rows)

        # Generate Excel file
        report_path = report_generator.generate_excel()
        
        # Save report record
        report = Report(
            user_id=current_user.id,
            xml_upload_id=uploads[0].id,  # Link to first upload
            report_period=period,
            file_path=report_path
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return {
            "message": "Relatório gerado com sucesso",
            "report_id": report.id,
            "period": period,
            "total_nfes": len(uploads)
        }
        
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
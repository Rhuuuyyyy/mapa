from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime
from ..database import get_db
from ..models import User, XMLUpload, Report
from ..schemas import UserResponse, XMLUploadResponse, ReportResponse
from ..auth import get_current_user

router = APIRouter()

# Directory for file uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obter informações do usuário logado"""
    return current_user


@router.post("/upload-xml", response_model=XMLUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_xml(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload de arquivo XML de NF-e"""
    # Validate file extension
    if not file.filename.endswith('.xml'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only XML files are allowed"
        )
    
    # Create user-specific directory
    user_upload_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_upload_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(user_upload_dir, safe_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
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
    
    return xml_upload


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
            detail="Upload not found"
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
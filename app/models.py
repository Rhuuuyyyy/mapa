from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    xml_uploads = relationship("XMLUpload", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")


class XMLUpload(Base):
    __tablename__ = "xml_uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), default="pending")  # pending, processed, error
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="xml_uploads")
    report = relationship("Report", back_populates="xml_upload", uselist=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    xml_upload_id = Column(Integer, ForeignKey("xml_uploads.id", ondelete="CASCADE"), nullable=False)
    report_period = Column(String(50))  # Ex: "Q1-2024"
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    file_path = Column(String(500), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reports")
    xml_upload = relationship("XMLUpload", back_populates="report")


class RawMaterialCatalog(Base):
    """
    Catálogo Mestre de Matérias-Primas (Raw Material Master Catalog).

    Maps product names (from XML <xProd>) to MAPA registration numbers.
    User-defined mappings to avoid unreliable automatic registration extraction.
    """
    __tablename__ = "raw_material_catalog"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(500), nullable=False, index=True)  # Key from XML <xProd>
    mapa_registration = Column(String(100), nullable=False)  # Value: Full MAPA registration (e.g., RS-003295-9.000007)
    product_reference = Column(String(500))  # Optional reference/notes for user
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="catalog_entries")
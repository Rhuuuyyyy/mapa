"""
Modelos SQLAlchemy para o banco de dados.
Arquitetura hierárquica: User -> Company -> Product
"""

from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Usuário do sistema (Admin ou User regular).
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)

    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    xml_uploads = relationship("XMLUpload", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    companies = relationship("Company", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


class Company(Base):
    """
    Empresa cadastrada no catálogo do usuário.
    Contém registro MAPA parcial (ex: "PR-12345").
    """
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    company_name = Column(String(500), nullable=False, index=True)
    mapa_registration = Column(String(100), nullable=False)  # Ex: "PR-12345"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    user = relationship("User", back_populates="companies")
    products = relationship("Product", back_populates="company", cascade="all, delete-orphan")

    # Índice composto para busca rápida
    __table_args__ = (
        Index("ix_company_user_name", "user_id", "company_name"),
    )

    def __repr__(self):
        return f"<Company {self.company_name}>"


class Product(Base):
    """
    Produto vinculado a uma empresa.
    Contém registro MAPA parcial (ex: "6.000001").
    Registro completo = Company.mapa_registration + "-" + Product.mapa_registration
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)

    product_name = Column(String(500), nullable=False, index=True)
    mapa_registration = Column(String(100), nullable=False)  # Ex: "6.000001"
    product_reference = Column(String(500), nullable=True)  # Descrição amigável

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    company = relationship("Company", back_populates="products")

    # Índice composto para busca rápida
    __table_args__ = (
        Index("ix_product_company_name", "company_id", "product_name"),
    )

    def __repr__(self):
        return f"<Product {self.product_name}>"


class XMLUpload(Base):
    """
    Registro de upload de arquivo XML/PDF de NF-e.
    """
    __tablename__ = "xml_uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    period = Column(String(20), nullable=True)  # Ex: "Q1-2025", "2024Q3"
    nfe_key = Column(String(44), nullable=True, index=True)  # Chave de acesso da NF-e (44 dígitos)

    status = Column(String(50), default="pending")  # pending, processed, error
    error_message = Column(Text, nullable=True)

    # Relacionamentos
    user = relationship("User", back_populates="xml_uploads")
    report = relationship("Report", back_populates="xml_upload", uselist=False)

    # Índice composto para validação de duplicatas
    __table_args__ = (
        Index("ix_user_nfe_key", "user_id", "nfe_key"),
    )

    def __repr__(self):
        return f"<XMLUpload {self.filename} - {self.status}>"


class Report(Base):
    """
    Relatório MAPA gerado a partir de XMLs processados.
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    xml_upload_id = Column(Integer, ForeignKey("xml_uploads.id", ondelete="CASCADE"), nullable=True)

    report_period = Column(String(20), nullable=False)  # Ex: "Q1-2025"
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    file_path = Column(String(1000), nullable=True)

    # Relacionamentos
    user = relationship("User", back_populates="reports")
    xml_upload = relationship("XMLUpload", back_populates="report")

    def __repr__(self):
        return f"<Report {self.report_period}>"

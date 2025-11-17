"""
Schemas Pydantic para validação de requests/responses.
Separados por entidade para melhor organização.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    """Schema base para User"""
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    """Schema para criar usuário"""
    password: str = Field(..., min_length=12)
    is_admin: bool = False


class UserUpdate(BaseModel):
    """Schema para atualizar usuário"""
    full_name: Optional[str] = Field(None, min_length=3, max_length=255)
    company_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=12)


class UserResponse(UserBase):
    """Schema de resposta de User"""
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# AUTH SCHEMAS
# ============================================================================

class LoginRequest(BaseModel):
    """Schema para login"""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema de resposta com token JWT"""
    access_token: str
    token_type: str = "bearer"


# ============================================================================
# COMPANY SCHEMAS
# ============================================================================

class CompanyBase(BaseModel):
    """Schema base para Company"""
    company_name: str = Field(..., min_length=1, max_length=500)
    mapa_registration: str = Field(..., min_length=1, max_length=100)


class CompanyCreate(CompanyBase):
    """Schema para criar empresa"""
    pass


class CompanyUpdate(BaseModel):
    """Schema para atualizar empresa"""
    company_name: Optional[str] = Field(None, min_length=1, max_length=500)
    mapa_registration: Optional[str] = Field(None, min_length=1, max_length=100)


class CompanyResponse(CompanyBase):
    """Schema de resposta de Company"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================================
# PRODUCT SCHEMAS
# ============================================================================

class ProductBase(BaseModel):
    """Schema base para Product"""
    product_name: str = Field(..., min_length=1, max_length=500)
    mapa_registration: str = Field(..., min_length=1, max_length=100)
    product_reference: Optional[str] = Field(None, max_length=500)


class ProductCreate(ProductBase):
    """Schema para criar produto"""
    company_id: int


class ProductUpdate(BaseModel):
    """Schema para atualizar produto"""
    product_name: Optional[str] = Field(None, min_length=1, max_length=500)
    mapa_registration: Optional[str] = Field(None, min_length=1, max_length=100)
    product_reference: Optional[str] = Field(None, max_length=500)


class ProductResponse(ProductBase):
    """Schema de resposta de Product"""
    id: int
    company_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================================
# XML UPLOAD SCHEMAS
# ============================================================================

class XMLUploadResponse(BaseModel):
    """Schema de resposta de XMLUpload"""
    id: int
    user_id: int
    filename: str
    upload_date: datetime
    status: str
    error_message: Optional[str]

    class Config:
        from_attributes = True


class XMLPreviewResponse(BaseModel):
    """Schema de resposta de preview de XML"""
    temp_file_path: str
    filename: str
    nfe_data: dict
    periodo_trimestral: Optional[str]
    empresa_encontrada: Optional[str]
    empresa_mapa_registration: Optional[str]
    total_produtos: int
    produtos_status: list  # Lista com {descricao, codigo, cadastrado: bool}


class XMLUploadConfirm(BaseModel):
    """Schema para confirmar upload após preview"""
    temp_file_path: str
    filename: str
    nfe_data: Optional[dict] = None  # Dados editados pelo usuário


# ============================================================================
# REPORT SCHEMAS
# ============================================================================

class ReportGenerateRequest(BaseModel):
    """Schema para solicitar geração de relatório"""
    period: str = Field(..., pattern=r"^Q[1-4]-\d{4}$")

    @field_validator("period")
    @classmethod
    def validate_period(cls, v):
        """Valida formato do período (Q1-2025, Q2-2025, etc.)"""
        if not v:
            raise ValueError("Período é obrigatório")
        return v


class ReportRow(BaseModel):
    """Schema para uma linha do relatório"""
    mapa_registration: str
    product_name: str
    product_reference: Optional[str]
    unit: str = "Tonelada"
    quantity_import: str
    quantity_domestic: str
    source_nfes: List[str]


class ReportResponse(BaseModel):
    """Schema de resposta de relatório gerado"""
    success: bool
    message: str
    period: str
    total_nfes: int
    rows: List[ReportRow]


class ReportError(BaseModel):
    """Schema de erro ao gerar relatório"""
    error: str
    unregistered_entries: List[dict]


# ============================================================================
# CATALOG SCHEMAS
# ============================================================================

class CompanyWithProducts(CompanyResponse):
    """Schema de Company com lista de Products"""
    products: List[ProductResponse] = []

    class Config:
        from_attributes = True


class CatalogResponse(BaseModel):
    """Schema de resposta do catálogo completo do usuário"""
    total_companies: int
    total_products: int
    companies: List[CompanyWithProducts]

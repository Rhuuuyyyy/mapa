from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=12, max_length=128)
    is_admin: bool = False

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate password strength:
        - Minimum 12 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(v) < 12:
            raise ValueError('A senha deve ter no mínimo 12 caracteres')

        if not re.search(r'[A-Z]', v):
            raise ValueError('A senha deve conter pelo menos uma letra maiúscula')

        if not re.search(r'[a-z]', v):
            raise ValueError('A senha deve conter pelo menos uma letra minúscula')

        if not re.search(r'\d', v):
            raise ValueError('A senha deve conter pelo menos um número')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]', v):
            raise ValueError('A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>_-+=[]\\\/;~`)')

        return v


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=12, max_length=128)

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate password strength when password is being updated:
        - Minimum 12 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if v is None:
            return v

        if len(v) < 12:
            raise ValueError('A senha deve ter no mínimo 12 caracteres')

        if not re.search(r'[A-Z]', v):
            raise ValueError('A senha deve conter pelo menos uma letra maiúscula')

        if not re.search(r'[a-z]', v):
            raise ValueError('A senha deve conter pelo menos uma letra minúscula')

        if not re.search(r'\d', v):
            raise ValueError('A senha deve conter pelo menos um número')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;~`]', v):
            raise ValueError('A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>_-+=[]\\\/;~`)')

        return v


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# XML Upload Schemas
class XMLUploadResponse(BaseModel):
    id: int
    filename: str
    upload_date: datetime
    status: str
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True


# Report Schemas
class ReportResponse(BaseModel):
    id: int
    report_period: Optional[str]
    generated_at: datetime
    file_path: str

    class Config:
        from_attributes = True


# Company Schemas
class CompanyBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=500, description="Nome da empresa conforme aparece no XML <emit><xNome>")
    mapa_registration: str = Field(..., min_length=1, max_length=100, description="Registro MAPA parcial da empresa (ex: PR-12345)")


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=500)
    mapa_registration: Optional[str] = Field(None, min_length=1, max_length=100)


class CompanyResponse(CompanyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=500, description="Nome do produto conforme aparece no XML <prod><xProd>")
    mapa_registration: str = Field(..., min_length=1, max_length=100, description="Registro MAPA parcial do produto (ex: 6.000001)")
    product_reference: Optional[str] = Field(None, max_length=500, description="Referência ou nota opcional")


class ProductCreate(ProductBase):
    company_id: int = Field(..., description="ID da empresa à qual o produto pertence")


class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=500)
    mapa_registration: Optional[str] = Field(None, min_length=1, max_length=100)
    product_reference: Optional[str] = Field(None, max_length=500)
    company_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    company_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Raw Material Catalog Schemas (DEPRECATED - use Company/Product instead)
class CatalogEntryBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=500, description="Nome exato do produto conforme aparece no XML <xProd>")
    mapa_registration: str = Field(..., min_length=1, max_length=100, description="Número de Registro MAPA completo (ex: RS-003295-9.000007)")
    product_reference: Optional[str] = Field(None, max_length=500, description="Referência ou nota opcional para o usuário")


class CatalogEntryCreate(CatalogEntryBase):
    pass


class CatalogEntryUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=500)
    mapa_registration: Optional[str] = Field(None, min_length=1, max_length=100)
    product_reference: Optional[str] = Field(None, max_length=500)


class CatalogEntryResponse(CatalogEntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
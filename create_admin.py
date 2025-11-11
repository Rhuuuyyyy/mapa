"""
Script para criar o primeiro usuário administrador.
Execute este script após configurar o banco de dados.

Uso: python create_admin.py
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User
from app.auth import get_password_hash
import sys

def create_admin_user():
    """Cria o primeiro usuário administrador"""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.is_admin == True).first()
        if existing_admin:
            print("❌ Já existe um usuário administrador no sistema.")
            print(f"   E-mail: {existing_admin.email}")
            return
        
        # Get admin details
        print("🔧 Criando usuário administrador inicial")
        print("-" * 50)
        
        full_name = input("Nome completo: ").strip()
        email = input("E-mail: ").strip()
        password = input("Senha (mínimo 6 caracteres): ").strip()
        
        if not full_name or not email or not password:
            print("❌ Todos os campos são obrigatórios!")
            return
        
        if len(password) < 6:
            print("❌ A senha deve ter pelo menos 6 caracteres!")
            return
        
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ Já existe um usuário com o e-mail: {email}")
            return
        
        # Create admin user
        admin_user = User(
            email=email,
            full_name=full_name,
            hashed_password=get_password_hash(password),
            is_admin=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\n✅ Usuário administrador criado com sucesso!")
        print(f"   ID: {admin_user.id}")
        print(f"   Nome: {admin_user.full_name}")
        print(f"   E-mail: {admin_user.email}")
        print("\n🚀 Você já pode fazer login no sistema!")
        
    except Exception as e:
        print(f"\n❌ Erro ao criar administrador: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    try:
        create_admin_user()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário")
        sys.exit(0)
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
import getpass


def create_admin_user():
    """Cria o primeiro usuário administrador"""
    
    # Create tables if they don't exist
    print("📊 Verificando estrutura do banco de dados...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Estrutura do banco de dados OK")
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return
    
    db: Session = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.is_admin == True).first()
        if existing_admin:
            print("\n❌ Já existe um usuário administrador no sistema.")
            print(f"   E-mail: {existing_admin.email}")
            print(f"   Nome: {existing_admin.full_name}")
            
            # Opção de reset de senha
            reset = input("\n🔄 Deseja resetar a senha deste admin? (s/N): ").strip().lower()
            if reset == 's':
                print("\n🔐 Defina a nova senha:")
                while True:
                    password = getpass.getpass("Nova senha (mínimo 6 caracteres): ").strip()
                    if len(password) < 6:
                        print("❌ A senha deve ter pelo menos 6 caracteres!")
                        continue
                    
                    password_confirm = getpass.getpass("Confirme a senha: ").strip()
                    if password != password_confirm:
                        print("❌ As senhas não coincidem!")
                        continue
                    
                    break
                
                try:
                    existing_admin.hashed_password = get_password_hash(password)
                    db.commit()
                    print("\n✅ Senha do administrador atualizada com sucesso!")
                except Exception as e:
                    print(f"\n❌ Erro ao atualizar senha: {str(e)}")
                    db.rollback()
            
            return
        
        # Get admin details
        print("\n🔧 Criando usuário administrador inicial")
        print("-" * 50)
        
        # Nome completo
        while True:
            full_name = input("Nome completo: ").strip()
            if full_name:
                break
            print("❌ Nome não pode ser vazio!")
        
        # Email
        while True:
            email = input("E-mail: ").strip().lower()
            if email and '@' in email:
                # Verifica se email já existe
                existing_user = db.query(User).filter(User.email == email).first()
                if existing_user:
                    print(f"❌ Já existe um usuário com o e-mail: {email}")
                    continue
                break
            print("❌ E-mail inválido!")
        
        # Senha
        print("\n🔐 Defina a senha (use getpass para ocultar):")
        while True:
            password = getpass.getpass("Senha (mínimo 6 caracteres): ").strip()
            
            if len(password) < 6:
                print("❌ A senha deve ter pelo menos 6 caracteres!")
                continue
            
            password_confirm = getpass.getpass("Confirme a senha: ").strip()
            
            if password != password_confirm:
                print("❌ As senhas não coincidem!")
                continue
            
            break
        
        # Create admin user
        print("\n⏳ Criando usuário...")
        try:
            hashed_password = get_password_hash(password)
        except Exception as e:
            print(f"\n❌ Erro ao processar senha: {str(e)}")
            print("\n🔧 Diagnóstico:")
            print(f"   - Tamanho da senha: {len(password)} caracteres")
            print(f"   - Tamanho em bytes: {len(password.encode('utf-8'))} bytes")
            
            # Tenta com senha truncada
            if len(password.encode('utf-8')) > 72:
                print("\n⚠️  Senha muito longa (>72 bytes), truncando...")
                password = password[:72]
                try:
                    hashed_password = get_password_hash(password)
                    print("✅ Senha processada após truncamento")
                except Exception as e2:
                    print(f"❌ Erro persistiu: {str(e2)}")
                    return
            else:
                return
        
        admin_user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            is_admin=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\n" + "=" * 50)
        print("✅ Usuário administrador criado com sucesso!")
        print("=" * 50)
        print(f"   ID: {admin_user.id}")
        print(f"   Nome: {admin_user.full_name}")
        print(f"   E-mail: {admin_user.email}")
        print("=" * 50)
        print("\n🚀 Você já pode fazer login no sistema!")
        print(f"   Acesse: http://localhost:8000")
        print(f"   Use: {admin_user.email}")
        print("=" * 50)
        
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário")
        db.rollback()
    except Exception as e:
        print(f"\n❌ Erro ao criar administrador: {str(e)}")
        print("\n🔍 Informações de debug:")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    try:
        create_admin_user()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário")
        sys.exit(0)
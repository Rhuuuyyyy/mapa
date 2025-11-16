#!/usr/bin/env python3
"""
Script para criar o primeiro usuário admin no MAPA SaaS.
Execute este script UMA VEZ para criar o administrador inicial.

Usage:
    python scripts/create_first_admin.py
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash, validate_password_strength

def create_admin():
    """Cria o primeiro usuário admin."""

    print("=" * 70)
    print("  CRIAR PRIMEIRO USUÁRIO ADMIN - MAPA SaaS v2.0.0")
    print("=" * 70)
    print()
    print("⚠️  IMPORTANTE:")
    print("   - A senha deve ter no mínimo 12 caracteres")
    print("   - Deve conter: maiúsculas, minúsculas, números e símbolos")
    print("   - Execute este script apenas UMA VEZ")
    print()

    # Dados do admin
    email = input("📧 Email do admin: ").strip()
    password = input("🔑 Senha (mínimo 12 caracteres): ").strip()
    full_name = input("👤 Nome completo: ").strip()
    company_name = input("🏢 Nome da empresa: ").strip()

    # Validar dados básicos
    if not email or '@' not in email:
        print("\n❌ Email inválido!")
        return

    if not full_name:
        print("\n❌ Nome completo é obrigatório!")
        return

    # Validar força da senha
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        print(f"\n❌ {message}")
        return

    # Conectar ao banco
    print("\n🔄 Conectando ao banco de dados...")
    db = SessionLocal()

    try:
        # Verificar se já existe admin
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"\n❌ Usuário com email '{email}' já existe!")
            db.close()
            return

        # Verificar se já existe algum admin
        any_admin = db.query(User).filter(User.is_admin == True).first()
        if any_admin:
            print(f"\n⚠️  Já existe um admin no sistema: {any_admin.email}")
            confirm = input("   Deseja criar outro admin mesmo assim? (s/N): ").strip().lower()
            if confirm != 's':
                print("\n❌ Operação cancelada.")
                db.close()
                return

        # Criar admin
        print("\n🔄 Criando usuário administrador...")
        admin = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            company_name=company_name,
            is_active=True,
            is_admin=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\n" + "=" * 70)
        print("✅ ADMIN CRIADO COM SUCESSO!")
        print("=" * 70)
        print(f"   🆔 ID: {admin.id}")
        print(f"   📧 Email: {admin.email}")
        print(f"   👤 Nome: {admin.full_name}")
        print(f"   🏢 Empresa: {admin.company_name}")
        print(f"   👑 Admin: {admin.is_admin}")
        print(f"   ✅ Ativo: {admin.is_active}")
        print(f"   📅 Criado em: {admin.created_at}")
        print("=" * 70)
        print()
        print("🔑 Use estas credenciais para fazer login:")
        print(f"   Email: {admin.email}")
        print(f"   Senha: (a que você digitou)")
        print()
        print("🌐 URL da API: https://mapa-app-clean-8270.azurewebsites.net")
        print("📚 Documentação: https://mapa-app-clean-8270.azurewebsites.net/docs")
        print()

        # Exemplo de curl
        print("📋 Exemplo de login via curl:")
        print(f'   curl -X POST https://mapa-app-clean-8270.azurewebsites.net/admin/auth/login \\')
        print(f'     -H "Content-Type: application/x-www-form-urlencoded" \\')
        print(f'     -d "username={admin.email}&password=SUA_SENHA"')
        print()

    except Exception as e:
        print(f"\n❌ Erro ao criar admin: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    try:
        create_admin()
    except KeyboardInterrupt:
        print("\n\n❌ Operação cancelada pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

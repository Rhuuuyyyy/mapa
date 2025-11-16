#!/usr/bin/env python3
"""
Teste de imports para verificar se há algum problema no código.
"""

import os
import sys

# Simular variáveis de ambiente do Azure
os.environ['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/testdb'
os.environ['SECRET_KEY'] = 'test-secret-key-1234567890123456789012345678901234567890'
os.environ['ALLOWED_ORIGINS'] = '*'
os.environ['DEBUG'] = 'False'

print("=" * 70)
print("🧪 Testando imports do MAPA SaaS")
print("=" * 70)
print()

# Teste 1: Config
print("[1/6] Testando app.config...")
try:
    from app.config import settings
    print(f"  ✓ Config importado com sucesso")
    print(f"  - ALLOWED_ORIGINS type: {type(settings.allowed_origins)}")
    print(f"  - ALLOWED_ORIGINS value: {settings.allowed_origins}")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 2: Database
print()
print("[2/6] Testando app.database...")
try:
    from app.database import engine, SessionLocal
    print(f"  ✓ Database importado com sucesso")
    print(f"  - Engine: {engine}")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 3: Models
print()
print("[3/6] Testando app.models...")
try:
    from app.models import User, Company, Product
    print(f"  ✓ Models importados com sucesso")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 4: Validators
print()
print("[4/6] Testando app.utils.validators...")
try:
    from app.utils.validators import validate_file_security, MAGIC_AVAILABLE
    print(f"  ✓ Validators importados com sucesso")
    print(f"  - python-magic disponível: {MAGIC_AVAILABLE}")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 5: Routers
print()
print("[5/6] Testando app.routers...")
try:
    from app.routers import admin, user
    print(f"  ✓ Routers importados com sucesso")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste 6: Main app
print()
print("[6/6] Testando app.main (FastAPI app)...")
try:
    from app.main import app
    print(f"  ✓ FastAPI app importado com sucesso")
    print(f"  - App title: {app.title}")
    print(f"  - App version: {app.version}")
except Exception as e:
    print(f"  ❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 70)
print("✅ TODOS OS IMPORTS FUNCIONARAM!")
print("=" * 70)
print()
print("Conclusão: O código está importando corretamente.")
print("Se a app não inicia no Azure, o problema pode ser:")
print("  1. Dependências faltando (requirements.txt)")
print("  2. Configuração do startup command no Azure")
print("  3. Porta incorreta")
print("  4. Timeout de startup muito curto")

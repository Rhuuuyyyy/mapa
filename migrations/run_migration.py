"""
Script para rodar migração do banco de dados.
Adiciona campo nfe_key à tabela xml_uploads.
"""

import os
import sys
from pathlib import Path

# Adicionar diretório pai ao path para importar app
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import text


def run_migration():
    """
    Executa migração SQL para adicionar campo nfe_key.
    """
    migration_file = Path(__file__).parent / "add_nfe_key_to_uploads.sql"

    print("=" * 60)
    print("MIGRAÇÃO: Adicionar campo nfe_key à tabela xml_uploads")
    print("=" * 60)
    print()

    # Ler arquivo SQL
    with open(migration_file, 'r') as f:
        sql = f.read()

    # Executar migração
    with engine.connect() as conn:
        print("Conectando ao banco de dados...")
        print()

        # Split por statement (separado por ';')
        statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]

        for idx, statement in enumerate(statements, 1):
            # Pular comentários
            if statement.startswith('--') or statement.startswith('/*'):
                continue

            print(f"[{idx}/{len(statements)}] Executando: {statement[:100]}...")

            try:
                conn.execute(text(statement))
                conn.commit()
                print("✓ Sucesso")
            except Exception as e:
                print(f"✗ Erro: {e}")
                print("Continuando...")

            print()

    print("=" * 60)
    print("MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)
    print()
    print("Próximos passos:")
    print("1. Reinicie a aplicação")
    print("2. Teste o upload de NF-e")
    print("3. Verifique se duplicatas são detectadas")
    print()


if __name__ == "__main__":
    run_migration()

#!/usr/bin/env python3
"""
Simple migration runner - executes the migration remotely via HTTP
Uses Azure's Kudu API to run the migration script
"""
import requests
import json
import sys
import getpass

APP_NAME = "mapa-app-clean-8270"

print("=" * 60)
print("🔄 MAPA SaaS - Database Migration Runner")
print("=" * 60)
print()
print("Este script vai adicionar o campo 'period' na tabela xml_uploads")
print()
print("⚠️  IMPORTANTE: A migração é necessária para corrigir os erros 500")
print()
print("-" * 60)
print("OPÇÃO MAIS FÁCIL: Via Azure Portal")
print("-" * 60)
print("1. Acesse: https://portal.azure.com")
print("2. Vá em: App Services > mapa-app-clean-8270")
print("3. Menu: Development Tools > SSH > Go")
print("4. Execute:")
print("   cd /home/site/wwwroot")
print("   python migrations/add_period_to_xml_uploads.py")
print()
print("-" * 60)
print()

choice = input("Deseja executar via este script Python? (s/N): ").strip().lower()

if choice not in ['s', 'y', 'sim', 'yes']:
    print()
    print("👍 Por favor, execute via Azure Portal conforme instruções acima.")
    print()
    sys.exit(0)

print()
print("Para usar este script, você precisa das credenciais do Azure:")
print()
print("Como obter:")
print("  1. Azure Portal > App Services > mapa-app-clean-8270")
print("  2. Menu: Deployment > Deployment Center")
print("  3. Clique em 'Local Git/FTPS credentials'")
print("  4. Copie o Username e Password")
print()

username = input("Digite o USERNAME (ex: $mapa-app-clean-8270): ").strip()
password = getpass.getpass("Digite o PASSWORD: ")

if not username or not password:
    print("\n❌ Credenciais não fornecidas!")
    sys.exit(1)

print()
print("🔄 Executando migração via Kudu API...")
print()

# Kudu command API endpoint
kudu_url = f"https://{APP_NAME}.scm.azurewebsites.net/api/command"

# Command to execute
command_data = {
    "command": "python migrations/add_period_to_xml_uploads.py",
    "dir": "/home/site/wwwroot"
}

try:
    response = requests.post(
        kudu_url,
        auth=(username, password),
        json=command_data,
        timeout=60
    )

    print(f"Status Code: {response.status_code}")
    print()

    if response.status_code == 200:
        result = response.json()
        print("✅ Migração executada com sucesso!")
        print()
        print("Output:")
        print("-" * 60)
        print(result.get('Output', 'No output'))
        print("-" * 60)

        if result.get('Error'):
            print()
            print("Errors:")
            print(result.get('Error'))

        print()
        print("=" * 60)
        print("✅ MIGRAÇÃO CONCLUÍDA!")
        print("=" * 60)
        print()
        print("Próximos passos:")
        print(f"  1. Acesse: https://{APP_NAME}.azurewebsites.net")
        print("  2. Teste fazer upload de XML")
        print("  3. Gere um relatório - os erros 500 devem ter sumido!")
        print()

    elif response.status_code == 401:
        print("❌ Erro de autenticação!")
        print("   Verifique se o username e password estão corretos.")
        print()
        print("   Username deve ser algo como: $mapa-app-clean-8270")
        sys.exit(1)
    else:
        print(f"❌ Erro HTTP {response.status_code}")
        print()
        print("Response:")
        print(response.text)
        print()
        print("⚠️  Tente executar via Azure Portal conforme instruções acima.")
        sys.exit(1)

except requests.exceptions.RequestException as e:
    print(f"❌ Erro de conexão: {e}")
    print()
    print("⚠️  Tente executar via Azure Portal conforme instruções acima.")
    sys.exit(1)

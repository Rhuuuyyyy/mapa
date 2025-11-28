#!/usr/bin/env python3
"""
Script de Limpeza de Diretório - MAPA SaaS
==========================================
Move arquivos de documentação técnica para pasta _archive
SEGURO: Não deleta nada, apenas move para backup

Uso:
    python cleanup_project.py [--dry-run]

    --dry-run: Mostra o que seria movido sem executar
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

# Configurações
ARCHIVE_FOLDER = "_archive"
ROOT_DIR = Path(__file__).parent

# Arquivos que devem PERMANECER no root
KEEP_IN_ROOT = {
    "README.md",              # Documentação principal do projeto
    "LICENSE",                # Licença
    ".gitignore",            # Git config
    ".env.example",          # Exemplo de variáveis de ambiente
    "requirements.txt",      # Dependências Python
    "cleanup_project.py",    # Este script
    "APRESENTACAO.md",       # Apresentação final
}

# Padrões de arquivos para MOVER para _archive
PATTERNS_TO_ARCHIVE = [
    "*.md",                  # Todos os .md exceto os em KEEP_IN_ROOT
    "*.log",                 # Logs
    "*.tmp",                 # Temporários
    "*_BACKUP.*",            # Backups
    "*_OLD.*",               # Arquivos antigos
]

# Pastas que devem ser MOVIDAS completamente
FOLDERS_TO_ARCHIVE = [
    "EXEMPLO-DO-PROJETO",    # Pasta de exemplos antigos
]


def create_archive_folder():
    """Cria pasta _archive com timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archive_path = ROOT_DIR / ARCHIVE_FOLDER

    if not archive_path.exists():
        archive_path.mkdir(exist_ok=True)
        print(f"✓ Pasta {ARCHIVE_FOLDER}/ criada")
    else:
        print(f"✓ Pasta {ARCHIVE_FOLDER}/ já existe")

    return archive_path


def should_keep_file(file_path: Path) -> bool:
    """Verifica se arquivo deve permanecer no root"""
    return file_path.name in KEEP_IN_ROOT


def get_files_to_archive():
    """Retorna lista de arquivos para arquivar"""
    files_to_move = []

    # 1. Buscar arquivos .md no root (exceto os protegidos)
    for md_file in ROOT_DIR.glob("*.md"):
        if not should_keep_file(md_file):
            files_to_move.append(md_file)

    # 2. Buscar outros padrões
    for pattern in PATTERNS_TO_ARCHIVE:
        if pattern == "*.md":
            continue  # Já processado acima
        for file in ROOT_DIR.glob(pattern):
            if file.is_file() and not should_keep_file(file):
                files_to_move.append(file)

    return files_to_move


def get_folders_to_archive():
    """Retorna lista de pastas para arquivar"""
    folders_to_move = []

    for folder_name in FOLDERS_TO_ARCHIVE:
        folder_path = ROOT_DIR / folder_name
        if folder_path.exists() and folder_path.is_dir():
            folders_to_move.append(folder_path)

    return folders_to_move


def move_file_safely(src: Path, archive_path: Path):
    """Move arquivo para _archive de forma segura"""
    dest = archive_path / src.name

    # Se já existe no destino, adiciona sufixo numérico
    if dest.exists():
        counter = 1
        stem = src.stem
        suffix = src.suffix
        while dest.exists():
            dest = archive_path / f"{stem}_{counter}{suffix}"
            counter += 1

    shutil.move(str(src), str(dest))
    return dest


def move_folder_safely(src: Path, archive_path: Path):
    """Move pasta para _archive de forma segura"""
    dest = archive_path / src.name

    # Se já existe no destino, adiciona sufixo numérico
    if dest.exists():
        counter = 1
        while dest.exists():
            dest = archive_path / f"{src.name}_{counter}"
            counter += 1

    shutil.move(str(src), str(dest))
    return dest


def main(dry_run=False):
    """Executa limpeza do diretório"""
    print("=" * 60)
    print("🧹 LIMPEZA DE DIRETÓRIO - MAPA SaaS")
    print("=" * 60)
    print()

    if dry_run:
        print("⚠️  MODO DRY-RUN: Nenhum arquivo será movido")
        print()

    # Criar pasta _archive
    archive_path = create_archive_folder()
    print()

    # Obter arquivos para arquivar
    files_to_move = get_files_to_archive()
    folders_to_move = get_folders_to_archive()

    if not files_to_move and not folders_to_move:
        print("✓ Nenhum arquivo ou pasta para arquivar. Diretório já limpo!")
        return

    # Mostrar o que será movido
    print(f"📦 Arquivos a serem movidos ({len(files_to_move)}):")
    for file in sorted(files_to_move):
        print(f"   • {file.name}")
    print()

    if folders_to_move:
        print(f"📁 Pastas a serem movidas ({len(folders_to_move)}):")
        for folder in sorted(folders_to_move):
            print(f"   • {folder.name}/")
        print()

    # Arquivos que permanecerão
    print(f"✅ Arquivos mantidos no root:")
    for keep_file in sorted(KEEP_IN_ROOT):
        if (ROOT_DIR / keep_file).exists():
            print(f"   • {keep_file}")
    print()

    # Executar movimentação
    if not dry_run:
        # Confirmar com usuário
        response = input("Deseja continuar? (s/N): ").strip().lower()
        if response != 's':
            print("❌ Operação cancelada pelo usuário")
            return

        print()
        print("🔄 Movendo arquivos...")

        # Mover arquivos
        moved_count = 0
        for file in files_to_move:
            try:
                dest = move_file_safely(file, archive_path)
                print(f"   ✓ {file.name} → {dest.relative_to(ROOT_DIR)}")
                moved_count += 1
            except Exception as e:
                print(f"   ✗ Erro ao mover {file.name}: {e}")

        # Mover pastas
        for folder in folders_to_move:
            try:
                dest = move_folder_safely(folder, archive_path)
                print(f"   ✓ {folder.name}/ → {dest.relative_to(ROOT_DIR)}/")
                moved_count += 1
            except Exception as e:
                print(f"   ✗ Erro ao mover {folder.name}/: {e}")

        print()
        print(f"✓ Concluído! {moved_count} itens movidos para {ARCHIVE_FOLDER}/")
    else:
        print("ℹ️  Modo dry-run: Execute sem --dry-run para mover os arquivos")

    print()
    print("=" * 60)


if __name__ == "__main__":
    import sys

    dry_run = "--dry-run" in sys.argv
    main(dry_run=dry_run)

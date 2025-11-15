#!/bin/bash

# ==========================================
# MAPA SaaS - Create Deployment ZIP Manually
# ==========================================

set -e

ZIP_FILE="deploy.zip"

echo "🗑️  Removing old ZIP..."
rm -f $ZIP_FILE

echo "📦 Creating deployment ZIP with explicit file list..."

# Create a temporary list of files to include
echo "📝 Files to include:"

# Core Python files
find app -type f -name "*.py" | sort
find app -type f -name "*.py" | wc -l | xargs echo "  - app/*.py files:"

# Templates and static
find templates -type f | sort
find static -type f | sort

# Configuration files
ls -1 requirements.txt runtime.txt .deployment startup-minimal.sh startup-azure-ultra-simple.sh startup-azure-simple.sh startup-azure.sh create_admin.py Makefile 2>/dev/null || true

echo ""
echo "📦 Creating ZIP archive..."

# Create ZIP with explicit includes
zip -r $ZIP_FILE \
  app \
  templates \
  static \
  requirements.txt \
  runtime.txt \
  .deployment \
  startup-minimal.sh \
  startup-azure-ultra-simple.sh \
  startup-azure-simple.sh \
  startup-azure.sh \
  create_admin.py \
  Makefile \
  -x "*.pyc" \
  -x "*__pycache__*" \
  -x "*.pyo" \
  -x "*/.DS_Store" \
  2>&1 | grep -v "adding:" || true

echo ""
echo "✅ ZIP created: $(du -h $ZIP_FILE | cut -f1)"

echo ""
echo "🔍 Verifying ZIP contents..."
echo "Critical files:"
unzip -l $ZIP_FILE | grep -E "(requirements.txt|startup-azure-simple.sh|app/main.py|runtime.txt)" || echo "⚠️ Missing critical files!"

echo ""
echo "📊 ZIP statistics:"
unzip -l $ZIP_FILE | tail -1

echo ""
echo "✅ ZIP file ready: $ZIP_FILE"

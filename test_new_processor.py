"""
Test script for new NFeProcessor, MAPAMapper, and MAPAReportGenerator.
"""

import sys
import os
from dataclasses import asdict

# Add app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.nfe_processor import NFeProcessor
from app.utils.mapa_mapper import MAPAMapper
from app.utils.report_generator import MAPAReportGenerator


class MockUser:
    """Mock user for testing"""
    def __init__(self):
        self.id = 1
        self.email = "test@example.com"
        self.company_name = "SOLO VIVO INDUSTRIA E COMERCIO DE FERTILIZANTES LTDA"
        self.full_name = "Test User"


def test_nfe_processor():
    """Test NFeProcessor with example XML"""
    print("=" * 80)
    print("TESTING NFeProcessor")
    print("=" * 80)

    xml_path = "examples/Exemplo_xml_nfe.xml"

    if not os.path.exists(xml_path):
        print(f"ERROR: Example XML not found at {xml_path}")
        return None

    try:
        # Create processor
        processor = NFeProcessor(xml_path)

        # Validate
        is_valid = processor.validate_nfe()
        print(f"[OK] NF-e is valid: {is_valid}")

        # Extract all data
        nfe_data = processor.extract_all_data()

        # Display basic info
        print(f"\n--- Basic Information ---")
        print(f"Chave de Acesso: {nfe_data.chave_acesso}")
        print(f"Número da Nota: {nfe_data.numero_nota}")
        print(f"Série: {nfe_data.serie}")
        print(f"Data de Emissão: {nfe_data.data_emissao}")

        # Display parties
        print(f"\n--- Emitente ---")
        print(f"CNPJ: {nfe_data.emitente.cnpj_cpf}")
        print(f"Razão Social: {nfe_data.emitente.razao_social}")
        print(f"UF: {nfe_data.emitente.endereco.uf}")

        print(f"\n--- Destinatário ---")
        print(f"CNPJ: {nfe_data.destinatario.cnpj_cpf}")
        print(f"Razão Social: {nfe_data.destinatario.razao_social}")

        # Display products
        print(f"\n--- Produtos ({len(nfe_data.produtos)}) ---")
        for idx, produto in enumerate(nfe_data.produtos, 1):
            print(f"\nProduto {idx}:")
            print(f"  Descrição: {produto.descricao}")
            print(f"  NCM: {produto.ncm}")
            print(f"  CFOP: {produto.cfop}")
            print(f"  Quantidade: {produto.quantidade} {produto.unidade}")
            print(f"  Registro MAPA: {produto.registro_mapa}")
            print(f"  Garantias: {produto.garantias}")

        print("\n[OK] NFeProcessor test PASSED\n")
        return nfe_data

    except Exception as e:
        print(f"\n[FAIL] NFeProcessor test FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_mapa_mapper(nfe_data):
    """Test MAPAMapper with NF-e data"""
    print("=" * 80)
    print("TESTING MAPAMapper")
    print("=" * 80)

    if not nfe_data:
        print("Skipping MAPAMapper test (no NF-e data)")
        return None

    try:
        # Create mapper
        mapper = MAPAMapper()

        # Add NF-e data
        mapper.add_nfe(nfe_data)

        # Get MAPA rows
        mapa_rows = mapper.get_mapa_rows()

        print(f"[OK] Generated {len(mapa_rows)} MAPA rows")

        # Display rows
        for idx, row in enumerate(mapa_rows, 1):
            print(f"\n--- MAPA Row {idx} ---")
            print(f"Material/Produto: {row.material_produto}")
            print(f"Registro: {row.registro_produto}")
            print(f"Garantias: N={row.n_total}, P2O5={row.p2o5_total}, K2O={row.k2o}")
            print(f"Unidade: {row.unidade}")
            print(f"Compras Nacional: {row.compras_nacional}")
            print(f"Compras Importado: {row.compras_importado}")
            print(f"Venda como Produto: {row.venda_como_produto}")

        # Get statistics
        stats = mapper.get_summary_statistics()
        print(f"\n--- Statistics ---")
        print(f"Total NF-es: {stats['total_nfes']}")
        print(f"Total Products: {stats['total_products']}")
        print(f"Total Rows: {stats['total_rows']}")

        # Validate data
        warnings = mapper.validate_data()
        if warnings:
            print(f"\n--- Warnings ({len(warnings)}) ---")
            for warning in warnings:
                print(f"  [WARN] {warning}")
        else:
            print(f"\n[OK] No validation warnings")

        print("\n[OK] MAPAMapper test PASSED\n")
        return mapa_rows

    except Exception as e:
        print(f"\n[FAIL] MAPAMapper test FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_report_generator(mapa_rows):
    """Test MAPAReportGenerator with MAPA rows"""
    print("=" * 80)
    print("TESTING MAPAReportGenerator")
    print("=" * 80)

    if not mapa_rows:
        print("Skipping MAPAReportGenerator test (no MAPA rows)")
        return False

    try:
        # Create mock user
        user = MockUser()

        # Company info
        company_info = {
            'registro_mapa': '001309-9',
            'uf': 'PR',
            'endereco': 'Rodovia do Xisto BR 476 Km 165, S/N  Bairro Guajuvira de Cima',
            'telefone': '(41)3614-3000',
            'responsavel': 'Test Responsible - CPF 000.000.000-00',
            'cidade': 'ARAUCÁRIA',
        }

        # Create generator
        generator = MAPAReportGenerator(user, "3º-2025", company_info)

        # Add rows
        generator.add_mapa_rows(mapa_rows)

        print(f"[OK] Added {generator.get_row_count()} rows to generator")

        # Generate Excel
        report_path = generator.generate_excel()

        print(f"[OK] Generated Excel report at: {report_path}")

        # Verify file exists
        if os.path.exists(report_path):
            file_size = os.path.getsize(report_path) / 1024  # KB
            print(f"[OK] File exists ({file_size:.2f} KB)")
        else:
            print(f"[FAIL] File not found at {report_path}")
            return False

        print("\n[OK] MAPAReportGenerator test PASSED\n")
        return True

    except Exception as e:
        print(f"\n[FAIL] MAPAReportGenerator test FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n")
    print("+" + "=" * 78 + "+")
    print("|" + " " * 20 + "NF-e PROCESSING TEST SUITE" + " " * 31 + "|")
    print("+" + "=" * 78 + "+")
    print("\n")

    # Test 1: NFeProcessor
    nfe_data = test_nfe_processor()

    # Test 2: MAPAMapper
    mapa_rows = test_mapa_mapper(nfe_data)

    # Test 3: MAPAReportGenerator
    success = test_report_generator(mapa_rows)

    # Final summary
    print("\n")
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    if nfe_data:
        print("[OK] NFeProcessor: PASSED")
    else:
        print("[FAIL] NFeProcessor: FAILED")

    if mapa_rows:
        print("[OK] MAPAMapper: PASSED")
    else:
        print("[FAIL] MAPAMapper: FAILED")

    if success:
        print("[OK] MAPAReportGenerator: PASSED")
    else:
        print("[FAIL] MAPAReportGenerator: FAILED")

    print("\n")

    if nfe_data and mapa_rows and success:
        print("[SUCCESS] ALL TESTS PASSED!")
        return 0
    else:
        print("[FAILED] SOME TESTS FAILED")
        return 1


if __name__ == "__main__":
    exit(main())

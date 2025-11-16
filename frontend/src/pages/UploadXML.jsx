import React, { useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Building2,
  Package,
  Calendar,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { xmlUploads as xmlUploadsAPI } from '../services/api';

const UploadXML = () => {
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'success'
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.name.toLowerCase().endsWith('.xml')
    );

    if (files.length > 0) {
      handleUploadPreview(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadPreview(e.target.files[0]);
    }
  };

  const handleUploadPreview = async (file) => {
    setError(null);
    setUploading(true);

    try {
      const preview = await xmlUploadsAPI.uploadPreview(file);
      setPreviewData(preview);
      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar arquivo XML');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setConfirming(true);

    try {
      await xmlUploadsAPI.uploadConfirm({
        temp_file_path: previewData.temp_file_path,
        filename: previewData.filename,
        nfe_data: previewData.nfe_data
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao confirmar upload');
    } finally {
      setConfirming(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setPreviewData(null);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatCNPJ = (cnpj) => {
    if (!cnpj) return 'N/A';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Etapa 1: Upload
  if (step === 'upload') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload de XML</h1>
          <p className="text-gray-600 mt-1">
            Envie arquivos XML de NF-e para processamento
          </p>
        </div>

        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Erro no Upload</h3>
                <p className="text-sm text-red-800 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div>
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Processando arquivo...
                </p>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto extraímos os dados do XML
                </p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Arraste e solte seu arquivo XML aqui
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  ou clique no botão abaixo para selecionar
                </p>
                <label className="btn-primary cursor-pointer">
                  <FileText className="w-5 h-5 mr-2" />
                  Selecionar Arquivo XML
                  <input
                    type="file"
                    className="hidden"
                    accept=".xml"
                    onChange={handleFileInput}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Sobre o Processamento
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• O arquivo será processado e você poderá revisar os dados antes de confirmar</p>
            <p>• Serão extraídos: informações da nota, emitente, destinatário e produtos</p>
            <p>• Você poderá verificar qual período trimestral será contabilizado</p>
            <p>• É possível editar os dados antes da confirmação final</p>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 2: Preview e Revisão
  if (step === 'preview' && previewData) {
    const nfe = previewData.nfe_data;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revisar Dados do XML</h1>
            <p className="text-gray-600 mt-1">
              Confira os dados extraídos antes de confirmar
            </p>
          </div>
          <button
            onClick={handleReset}
            className="btn-secondary"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
        </div>

        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Período Trimestral */}
          <div className="card bg-emerald-50 border-emerald-200">
            <div className="flex items-center space-x-3 mb-3">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-emerald-900">Período</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {previewData.periodo_trimestral || 'N/A'}
            </p>
            <p className="text-sm text-emerald-700 mt-1">
              Será contabilizado no relatório deste trimestre
            </p>
          </div>

          {/* Empresa */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Empresa</h3>
            </div>
            <p className="text-lg font-bold text-blue-900">
              {previewData.empresa_encontrada || 'Não encontrada'}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {previewData.empresa_encontrada
                ? 'Empresa cadastrada no sistema'
                : 'Você pode precisar cadastrar esta empresa'}
            </p>
          </div>

          {/* Produtos */}
          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <Package className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Produtos</h3>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {previewData.total_produtos}
            </p>
            <p className="text-sm text-purple-700 mt-1">
              {previewData.total_produtos === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>
        </div>

        {/* Informações da Nota */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-lg mb-4">Informações da Nota Fiscal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Número:</span>
              <span className="ml-2 font-medium text-gray-900">{nfe.numero_nota || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Série:</span>
              <span className="ml-2 font-medium text-gray-900">{nfe.serie || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">Data de Emissão:</span>
              <span className="ml-2 font-medium text-gray-900">{formatDate(nfe.data_emissao)}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Chave de Acesso:</span>
              <span className="ml-2 font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {nfe.chave_acesso || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Emitente */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-emerald-600" />
            Emitente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">CNPJ:</span>
              <span className="ml-2 font-medium text-gray-900">
                {formatCNPJ(nfe.emitente?.cnpj)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">UF:</span>
              <span className="ml-2 font-medium text-gray-900">{nfe.emitente?.uf || 'N/A'}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Razão Social:</span>
              <span className="ml-2 font-medium text-gray-900">
                {nfe.emitente?.razao_social || 'N/A'}
              </span>
            </div>
            {nfe.emitente?.nome_fantasia && (
              <div className="md:col-span-2">
                <span className="text-gray-600">Nome Fantasia:</span>
                <span className="ml-2 font-medium text-gray-900">{nfe.emitente.nome_fantasia}</span>
              </div>
            )}
          </div>
        </div>

        {/* Destinatário */}
        {nfe.destinatario && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-lg mb-4">Destinatário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">CNPJ:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatCNPJ(nfe.destinatario.cnpj)}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Razão Social:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {nfe.destinatario.razao_social || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Produtos */}
        {nfe.produtos && nfe.produtos.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-emerald-600" />
              Produtos ({nfe.produtos.length})
            </h3>
            <div className="space-y-3">
              {nfe.produtos.map((produto, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {produto.descricao || `Produto ${index + 1}`}
                      </p>
                      {produto.codigo && (
                        <p className="text-sm text-gray-600 mt-1">
                          Código: {produto.codigo}
                        </p>
                      )}
                      {produto.quantidade && (
                        <p className="text-sm text-gray-600">
                          Quantidade: {produto.quantidade} {produto.unidade || ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Confirmar Upload?</h3>
              <p className="text-sm text-gray-600">
                Os dados estão corretos? Ao confirmar, o arquivo será processado e contabilizado no relatório.
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn-primary"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Confirmando...
                </>
              ) : (
                <>
                  Confirmar e Processar
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 3: Sucesso
  if (step === 'success') {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Realizado com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            O arquivo XML foi processado e os dados foram salvos no sistema
          </p>

          <div className="flex items-center justify-center space-x-4">
            <button onClick={handleReset} className="btn-primary">
              <Upload className="w-5 h-5 mr-2" />
              Enviar Outro Arquivo
            </button>
            <a href="/reports" className="btn-secondary">
              <FileText className="w-5 h-5 mr-2" />
              Ver Relatórios
            </a>
          </div>
        </div>

        {previewData && (
          <div className="card bg-emerald-50 border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-3">Resumo do Processamento</h3>
            <div className="space-y-2 text-sm text-emerald-800">
              <p>✓ Período trimestral: <strong>{previewData.periodo_trimestral}</strong></p>
              <p>✓ Total de produtos: <strong>{previewData.total_produtos}</strong></p>
              <p>✓ Arquivo: <strong>{previewData.filename}</strong></p>
              <p className="mt-4 text-emerald-700">
                Os dados foram salvos e serão incluídos no relatório trimestral correspondente.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default UploadXML;

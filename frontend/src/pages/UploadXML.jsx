import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { xmlUploads as xmlUploadsAPI, companies as companiesAPI, products as productsAPI } from '../services/api';

const UploadXML = () => {
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'success'
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    company_name: '',
    mapa_registration: ''
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    product_name: '',
    mapa_registration: '',
    company_id: ''
  });
  const [savingProduct, setSavingProduct] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [editedProducts, setEditedProducts] = useState({});

  useEffect(() => {
    loadUploadHistory();
    loadUserCompanies();
  }, []);

  const loadUserCompanies = async () => {
    try {
      const companies = await companiesAPI.getAll();
      setUserCompanies(companies);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  const loadUploadHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await xmlUploadsAPI.getHistory();
      setUploadHistory(history);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

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

      // Pre-preencher formulário de empresa com dados do XML se não encontrada
      if (!preview.empresa_encontrada && preview.nfe_data?.emitente) {
        setCompanyFormData({
          company_name: preview.nfe_data.emitente.razao_social || '',
          mapa_registration: ''
        });
      }

      setStep('preview');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao processar arquivo XML');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenCompanyModal = () => {
    setShowCompanyModal(true);
  };

  const handleCloseCompanyModal = () => {
    setShowCompanyModal(false);
    setCompanyFormData({ company_name: '', mapa_registration: '' });
  };

  const handleSaveCompany = async () => {
    if (!companyFormData.company_name.trim() || !companyFormData.mapa_registration.trim()) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setSavingCompany(true);
      await companiesAPI.create(companyFormData);

      // Recarregar lista de empresas
      await loadUserCompanies();

      // Atualizar preview com empresa encontrada
      setPreviewData(prev => ({
        ...prev,
        empresa_encontrada: companyFormData.company_name
      }));

      handleCloseCompanyModal();
      alert('Empresa cadastrada com sucesso!');
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar empresa');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleOpenProductModal = (productIndex) => {
    const produto = previewData.produtos_status[productIndex];
    setSelectedProductIndex(productIndex);
    setProductFormData({
      product_name: produto.descricao || '',
      mapa_registration: produto.codigo || '',
      company_id: userCompanies.length > 0 ? userCompanies[0].id : ''
    });
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setProductFormData({ product_name: '', mapa_registration: '', company_id: '' });
    setSelectedProductIndex(null);
  };

  const handleSaveProduct = async () => {
    if (!productFormData.product_name.trim() || !productFormData.mapa_registration.trim()) {
      alert('Preencha o nome e código do produto');
      return;
    }

    if (!productFormData.company_id) {
      alert('Selecione uma empresa para vincular o produto');
      return;
    }

    try {
      setSavingProduct(true);
      const productData = {
        product_name: productFormData.product_name,
        mapa_registration: productFormData.mapa_registration,
        company_id: parseInt(productFormData.company_id)
      };
      await productsAPI.create(productData);

      // Atualizar status do produto no preview
      setPreviewData(prev => {
        const newProdutosStatus = [...prev.produtos_status];
        newProdutosStatus[selectedProductIndex] = {
          ...newProdutosStatus[selectedProductIndex],
          cadastrado: true
        };
        return {
          ...prev,
          produtos_status: newProdutosStatus
        };
      });

      handleCloseProductModal();
      alert('Produto cadastrado com sucesso!');
    } catch (err) {
      // Melhor formatação de erro
      let errorMsg = 'Erro ao cadastrar produto';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMsg = detail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join('\n');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        }
      }
      alert(errorMsg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEditProductField = (productIndex, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productIndex]: {
        ...(prev[productIndex] || {}),
        [field]: value
      }
    }));
  };

  const getProductData = (productIndex) => {
    const originalProduct = previewData.nfe_data.produtos[productIndex];
    const edits = editedProducts[productIndex] || {};

    return {
      descricao: edits.descricao !== undefined ? edits.descricao : originalProduct.descricao,
      codigo: edits.codigo !== undefined ? edits.codigo : originalProduct.codigo,
      unidade: edits.unidade !== undefined ? edits.unidade : originalProduct.unidade,
      quantidade: edits.quantidade !== undefined ? edits.quantidade : originalProduct.quantidade,
      registro_mapa: edits.registro_mapa !== undefined ? edits.registro_mapa : originalProduct.registro_mapa
    };
  };

  const handleConfirm = async () => {
    setError(null);
    setConfirming(true);

    try {
      // Aplicar edições aos dados do NFe antes de enviar
      const updatedNfeData = {
        ...previewData.nfe_data,
        produtos: previewData.nfe_data.produtos.map((produto, index) => {
          const edits = editedProducts[index];
          if (!edits) return produto;

          return {
            ...produto,
            ...(edits.descricao !== undefined && { descricao: edits.descricao }),
            ...(edits.codigo !== undefined && { codigo: edits.codigo }),
            ...(edits.unidade !== undefined && { unidade: edits.unidade }),
            ...(edits.quantidade !== undefined && { quantidade: edits.quantidade }),
            ...(edits.registro_mapa !== undefined && { registro_mapa: edits.registro_mapa })
          };
        })
      };

      await xmlUploadsAPI.uploadConfirm({
        temp_file_path: previewData.temp_file_path,
        filename: previewData.filename,
        nfe_data: updatedNfeData
      });
      setStep('success');
      loadUploadHistory(); // Recarregar histórico
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao confirmar upload');
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!window.confirm('Tem certeza que deseja excluir este upload?')) {
      return;
    }

    try {
      await xmlUploadsAPI.delete(uploadId);
      loadUploadHistory();
    } catch (err) {
      alert('Erro ao excluir upload');
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

  const groupHistoryByQuarter = () => {
    const grouped = {};

    uploadHistory.forEach(upload => {
      const date = new Date(upload.upload_date);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const key = `${year}Q${quarter}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(upload);
    });

    return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));
  };

  // Etapa 1: Upload
  if (step === 'upload') {
    const groupedHistory = groupHistoryByQuarter();

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
                <label className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg cursor-pointer transition-colors">
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
            <p>• É possível cadastrar empresa caso não esteja no sistema</p>
          </div>
        </div>

        {/* Histórico de Uploads */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Uploads</h2>

          {loadingHistory ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando histórico...</p>
            </div>
          ) : groupedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum upload realizado ainda</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedHistory.map(([quarter, uploads]) => (
                <div key={quarter}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">
                      {quarter.replace('Q', 'º Trimestre de ')}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({uploads.length} {uploads.length === 1 ? 'arquivo' : 'arquivos'})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {uploads.map(upload => (
                      <div
                        key={upload.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className={`w-5 h-5 flex-shrink-0 ${
                            upload.status === 'processed' ? 'text-emerald-600' :
                            upload.status === 'error' ? 'text-red-600' :
                            'text-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {upload.filename}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(upload.upload_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {upload.status === 'processed' && (
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                              Processado
                            </span>
                          )}
                          {upload.status === 'error' && (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                              Erro
                            </span>
                          )}
                          {upload.status === 'pending' && (
                            <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              Pendente
                            </span>
                          )}

                          <button
                            onClick={() => alert(`Visualização/edição de XML em desenvolvimento.\n\nArquivo: ${upload.filename}\nStatus: ${upload.status}\nPer\u00edodo: ${upload.period || 'N/A'}`)}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Visualizar"
                          >
                            <Edit2 className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteUpload(upload.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className={`card ${previewData.empresa_encontrada ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <Building2 className={`w-6 h-6 ${previewData.empresa_encontrada ? 'text-blue-600' : 'text-yellow-600'}`} />
              <h3 className={`font-semibold ${previewData.empresa_encontrada ? 'text-blue-900' : 'text-yellow-900'}`}>Empresa</h3>
            </div>
            <p className={`text-lg font-bold ${previewData.empresa_encontrada ? 'text-blue-900' : 'text-yellow-900'}`}>
              {previewData.empresa_encontrada || 'Não encontrada'}
            </p>
            {previewData.empresa_encontrada ? (
              <p className="text-sm text-blue-700 mt-1">
                Empresa cadastrada no sistema
              </p>
            ) : (
              <button
                onClick={handleOpenCompanyModal}
                className="mt-2 text-sm font-medium text-yellow-900 underline hover:text-yellow-700"
              >
                Cadastrar empresa agora
              </button>
            )}
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

        {/* Produtos - Detalhado e Editável */}
        {previewData.produtos_status && previewData.produtos_status.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                <Package className="w-5 h-5 mr-2 text-emerald-600" />
                Produtos ({previewData.produtos_status.length})
              </h3>
              <p className="text-sm text-gray-600">
                Revise e edite os dados antes de confirmar
              </p>
            </div>

            <div className="space-y-4">
              {previewData.produtos_status.map((produtoStatus, index) => {
                const produtoData = getProductData(index);
                const isEdited = editedProducts[index] && Object.keys(editedProducts[index]).length > 0;

                return (
                  <div
                    key={index}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      produtoStatus.cadastrado
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    } ${isEdited ? 'ring-2 ring-blue-400' : ''}`}
                  >
                    {/* Header com Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {produtoStatus.cadastrado ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`font-semibold text-lg ${produtoStatus.cadastrado ? 'text-emerald-900' : 'text-red-900'}`}>
                            Produto {index + 1}
                          </p>
                          <p className={`text-sm ${produtoStatus.cadastrado ? 'text-emerald-700' : 'text-red-700'}`}>
                            {produtoStatus.cadastrado ? 'Cadastrado no sistema' : 'Não cadastrado'}
                          </p>
                        </div>
                      </div>
                      {!produtoStatus.cadastrado && (
                        <button
                          onClick={() => handleOpenProductModal(index)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Cadastrar
                        </button>
                      )}
                      {isEdited && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center">
                          <Edit2 className="w-3 h-3 mr-1" />
                          Editado
                        </div>
                      )}
                    </div>

                    {/* Campos Editáveis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome do Produto */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Nome do Produto
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoData.descricao || ''}
                            onChange={(e) => handleEditProductField(index, 'descricao', e.target.value)}
                            className="input-field text-sm pr-10"
                            placeholder="Digite o nome do produto"
                          />
                          <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Código */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Código do Produto
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoData.codigo || ''}
                            onChange={(e) => handleEditProductField(index, 'codigo', e.target.value)}
                            className="input-field text-sm pr-10"
                            placeholder="Código"
                          />
                          <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Registro MAPA */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Registro MAPA
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoData.registro_mapa || ''}
                            onChange={(e) => handleEditProductField(index, 'registro_mapa', e.target.value)}
                            className="input-field text-sm pr-10"
                            placeholder="Ex: PR-12345-6.000001"
                          />
                          <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Quantidade */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Quantidade
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoData.quantidade || ''}
                            onChange={(e) => handleEditProductField(index, 'quantidade', e.target.value)}
                            className="input-field text-sm pr-10"
                            placeholder="0.00"
                          />
                          <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Unidade */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Unidade
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={produtoData.unidade || ''}
                            onChange={(e) => handleEditProductField(index, 'unidade', e.target.value)}
                            className="input-field text-sm pr-10"
                            placeholder="Ex: KG, TON"
                          />
                          <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviso sobre edições */}
            {Object.keys(editedProducts).length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">Produtos Editados</h4>
                    <p className="text-sm text-blue-800">
                      Você editou {Object.keys(editedProducts).length} {Object.keys(editedProducts).length === 1 ? 'produto' : 'produtos'}.
                      As alterações serão salvas ao confirmar o upload.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="card bg-gray-50">
          {(() => {
            const empresaNaoCadastrada = !previewData.empresa_encontrada;
            const produtosNaoCadastrados = previewData.produtos_status?.filter(p => !p.cadastrado) || [];
            const temPendencias = empresaNaoCadastrada || produtosNaoCadastrados.length > 0;

            return (
              <div>
                {temPendencias && (
                  <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">Pendências de Cadastro</h4>
                        <div className="space-y-1 text-sm text-yellow-800">
                          {empresaNaoCadastrada && (
                            <p>• A empresa emitente não está cadastrada no sistema</p>
                          )}
                          {produtosNaoCadastrados.length > 0 && (
                            <p>• {produtosNaoCadastrados.length} {produtosNaoCadastrados.length === 1 ? 'produto não está cadastrado' : 'produtos não estão cadastrados'}</p>
                          )}
                        </div>
                        <p className="text-sm text-yellow-700 mt-2 font-medium">
                          Cadastre todos os itens pendentes antes de confirmar o upload.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Confirmar Upload?</h3>
                    <p className="text-sm text-gray-600">
                      {temPendencias
                        ? 'Cadastre empresa e produtos pendentes para prosseguir.'
                        : 'Os dados estão corretos? Ao confirmar, o arquivo será processado e contabilizado no relatório.'}
                    </p>
                  </div>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming || temPendencias}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
            );
          })()}
        </div>

        {/* Modal de Cadastro de Empresa */}
        {showCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cadastrar Empresa</h3>
                <button
                  onClick={handleCloseCompanyModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={companyFormData.company_name}
                    onChange={(e) => setCompanyFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="input-field"
                    placeholder="Razão social da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registro MAPA *
                  </label>
                  <input
                    type="text"
                    value={companyFormData.mapa_registration}
                    onChange={(e) => setCompanyFormData(prev => ({ ...prev, mapa_registration: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: PR-12345-A"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCloseCompanyModal}
                    className="btn-secondary flex-1"
                    disabled={savingCompany}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCompany}
                    className="btn-primary flex-1"
                    disabled={savingCompany}
                  >
                    {savingCompany ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Cadastrar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cadastro de Produto */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cadastrar Produto</h3>
                <button
                  onClick={handleCloseProductModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {userCompanies.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Você precisa ter pelo menos uma empresa cadastrada para criar produtos.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    value={productFormData.company_id}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, company_id: e.target.value }))}
                    className="input-field"
                    disabled={userCompanies.length === 0}
                  >
                    <option value="">Selecione uma empresa</option>
                    {userCompanies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    value={productFormData.product_name}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    className="input-field"
                    placeholder="Nome/descrição do produto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registro MAPA *
                  </label>
                  <input
                    type="text"
                    value={productFormData.mapa_registration}
                    onChange={(e) => setProductFormData(prev => ({ ...prev, mapa_registration: e.target.value }))}
                    className="input-field"
                    placeholder="Ex: 6.000001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código parcial do produto (ex: 6.000001). O código completo será formado junto com o registro da empresa.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCloseProductModal}
                    className="btn-secondary flex-1"
                    disabled={savingProduct}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProduct}
                    className="btn-primary flex-1"
                    disabled={savingProduct}
                  >
                    {savingProduct ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Cadastrar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Building2,
  AlertCircle,
  Tag
} from 'lucide-react';
import { products as productsAPI, companies as companiesAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_type: 'A',
    company_id: '',
    mapa_registration: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, product: null });
  const [alertDialog, setAlertDialog] = useState({ show: false, title: '', message: '', type: 'info' });

  const productTypes = [
    { value: 'A', label: 'A - Alimentos' },
    { value: 'B', label: 'B - Bebidas' },
    { value: 'C', label: 'C - Carnes' },
    { value: 'D', label: 'D - Derivados' },
    { value: 'E', label: 'E - Especiais' },
    { value: 'F', label: 'F - Forragens' },
    { value: 'S', label: 'S - Suplementos' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, companiesData] = await Promise.all([
        productsAPI.getAll(),
        companiesAPI.getAll()
      ]);
      setProducts(productsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name,
        product_type: product.product_type,
        company_id: product.company_id,
        mapa_registration: product.mapa_registration
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '',
        product_type: 'A',
        company_id: companies.length > 0 ? companies[0].id : '',
        mapa_registration: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ product_name: '', product_type: 'A', company_id: '', mapa_registration: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Nome do produto é obrigatório';
    }
    if (!formData.product_type) {
      newErrors.product_type = 'Tipo do produto é obrigatório';
    }
    if (!formData.company_id) {
      newErrors.company_id = 'Empresa é obrigatória';
    }
    if (!formData.mapa_registration.trim()) {
      newErrors.mapa_registration = 'Registro MAPA é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, formData);
      } else {
        await productsAPI.create(formData);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setErrors({
        submit: error.response?.data?.detail || 'Erro ao salvar produto'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    setConfirmDelete({ show: true, product });
  };

  const confirmDeleteAction = async () => {
    const product = confirmDelete.product;
    setConfirmDelete({ show: false, product: null });

    try {
      await productsAPI.delete(product.id);
      await loadData();
      setAlertDialog({
        show: true,
        title: 'Produto excluído',
        message: `O produto "${product.product_name}" foi excluído com sucesso.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setAlertDialog({
        show: true,
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir o produto. Tente novamente.',
        type: 'error'
      });
    }
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.company_name : 'N/A';
  };

  const getProductTypeLabel = (type) => {
    const typeObj = productTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.mapa_registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(product.company_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os produtos cadastrados no sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary mt-4 sm:mt-0 flex items-center"
          disabled={companies.length === 0}
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Alerta se não há empresas */}
      {companies.length === 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Nenhuma empresa cadastrada</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Você precisa cadastrar pelo menos uma empresa antes de adicionar produtos.
              </p>
              <a href="/companies" className="text-sm text-yellow-900 underline mt-2 inline-block">
                Ir para Empresas
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, registro MAPA ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Tente buscar com outros termos' : 'Comece cadastrando seu primeiro produto'}
          </p>
          {!searchTerm && companies.length > 0 && (
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Primeiro Produto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-sky-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
                {product.product_name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{getCompanyName(product.company_id)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">{getProductTypeLabel(product.product_type)}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <span className="font-medium mr-2 flex-shrink-0">Registro:</span>
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs break-all">
                    {product.mapa_registration}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className={`input-field ${errors.product_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ex: Ração Premium para Bovinos"
                />
                {errors.product_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className={`input-field ${errors.company_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
                {errors.company_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo do Produto *
                </label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleInputChange}
                  className={`input-field ${errors.product_type ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.product_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.product_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registro MAPA Completo *
                </label>
                <input
                  type="text"
                  name="mapa_registration"
                  value={formData.mapa_registration}
                  onChange={handleInputChange}
                  className={`input-field ${errors.mapa_registration ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ex: PR-12345-A-000001"
                />
                {errors.mapa_registration && (
                  <p className="mt-1 text-sm text-red-600">{errors.mapa_registration}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Formato: UF-XXXXX-T-NNNNNN (ex: PR-12345-A-000001)
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    editingProduct ? 'Salvar Alterações' : 'Criar Produto'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modais customizados */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir o produto "${confirmDelete.product?.product_name}"?`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ show: false, product: null })}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <AlertDialog
        isOpen={alertDialog.show}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ show: false, title: '', message: '', type: 'info' })}
      />
    </div>
  );
};

export default Products;

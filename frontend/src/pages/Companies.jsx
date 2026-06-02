import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Package,
  AlertCircle
} from 'lucide-react';
import { companies as companiesAPI } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import AlertDialog from '../components/AlertDialog';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    mapa_registration: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, company: null });
  const [alertDialog, setAlertDialog] = useState({ show: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesAPI.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        company_name: company.company_name,
        mapa_registration: company.mapa_registration
      });
    } else {
      setEditingCompany(null);
      setFormData({
        company_name: '',
        mapa_registration: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setFormData({ company_name: '', mapa_registration: '' });
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
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório';
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

      if (editingCompany) {
        await companiesAPI.update(editingCompany.id, formData);
      } else {
        await companiesAPI.create(formData);
      }

      await loadCompanies();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setErrors({
        submit: error.response?.data?.detail || 'Erro ao salvar empresa'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (company) => {
    setConfirmDelete({ show: true, company });
  };

  const confirmDeleteAction = async () => {
    const company = confirmDelete.company;
    setConfirmDelete({ show: false, company: null });

    try {
      await companiesAPI.delete(company.id);
      await loadCompanies();
      setAlertDialog({
        show: true,
        title: 'Empresa excluída',
        message: `A empresa "${company.company_name}" foi excluída com sucesso.`,
        type: 'success'
      });
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      setAlertDialog({
        show: true,
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir a empresa. Tente novamente.',
        type: 'error'
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.mapa_registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as empresas cadastradas no sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary mt-4 sm:mt-0 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Empresa
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou registro MAPA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de Empresas */}
      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Tente buscar com outros termos' : 'Comece cadastrando sua primeira empresa'}
          </p>
          {!searchTerm && (
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Primeira Empresa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(company)}
                    className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-sky-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">
                {company.company_name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium mr-2">Registro:</span>
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {company.mapa_registration}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span>0 produtos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
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
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className={`input-field ${errors.company_name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ex: Empresa XYZ Ltda"
                />
                {errors.company_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registro MAPA *
                </label>
                <input
                  type="text"
                  name="mapa_registration"
                  value={formData.mapa_registration}
                  onChange={handleInputChange}
                  className={`input-field ${errors.mapa_registration ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Ex: PR-12345"
                />
                {errors.mapa_registration && (
                  <p className="mt-1 text-sm text-red-600">{errors.mapa_registration}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Registro parcial (ex: PR-12345, SP-67890)
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
                    editingCompany ? 'Salvar Alterações' : 'Criar Empresa'
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
        message={`Tem certeza que deseja excluir a empresa "${confirmDelete.company?.company_name}"?`}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ show: false, company: null })}
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

export default Companies;

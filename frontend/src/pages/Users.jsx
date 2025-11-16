import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Loader2,
  Mail,
  Shield,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { users as usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    is_admin: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        is_admin: user.is_admin
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        is_admin: false
      });
    }
    setErrors({});
    setShowPassword(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', password: '', is_admin: false });
    setErrors({});
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'Senha é obrigatória para novos usuários';
    } else if (formData.password && formData.password.length < 12) {
      newErrors.password = 'Senha deve ter pelo menos 12 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const userData = {
        email: formData.email,
        is_admin: formData.is_admin
      };

      // Incluir senha apenas se foi fornecida
      if (formData.password) {
        userData.password = formData.password;
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, userData);
      } else {
        await usersAPI.create(userData);
      }

      await loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);

      // Extrair mensagem de erro do backend
      let errorMessage = 'Erro ao salvar usuário';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          // Erros de validação do Pydantic
          errorMessage = detail.map(err => err.msg || err.message).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      }

      setErrors({
        submit: errorMessage
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      alert('Você não pode excluir sua própria conta');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${user.email}"?`)) {
      return;
    }

    try {
      await usersAPI.delete(user.id);
      await loadUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar se o usuário atual é admin
  if (!currentUser?.is_admin) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você precisa ser um administrador para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os usuários do sistema (Admin)
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Tente buscar com outros termos' : 'Comece cadastrando seu primeiro usuário'}
          </p>
          {!searchTerm && (
            <button onClick={() => handleOpenModal()} className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Cadastrar Primeiro Usuário
            </button>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Perfil</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Criado em</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.email}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-emerald-600 font-medium">(Você)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className={`w-4 h-4 ${user.id === currentUser?.id ? 'text-gray-300' : 'text-red-600'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
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
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="usuario@exemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha {editingUser && '(deixe em branco para não alterar)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder={editingUser ? 'Digite para alterar' : 'Mínimo 12 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input
                  type="checkbox"
                  id="is_admin"
                  name="is_admin"
                  checked={formData.is_admin}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_admin" className="flex-1 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-700" />
                    <span className="text-sm font-medium text-purple-900">
                      Administrador
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-1">
                    Terá acesso a todas as funcionalidades do sistema
                  </p>
                </label>
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
                    editingUser ? 'Salvar Alterações' : 'Criar Usuário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

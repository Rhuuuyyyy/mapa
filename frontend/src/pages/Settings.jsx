import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  User,
  Building,
  Lock,
  Save,
  X,
  Mail,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    full_name: '',
    company_name: '',
  });
  const [profileModified, setProfileModified] = useState(false);

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        company_name: user.company_name || '',
      });
    }
  }, [user]);

  // Handle profile changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setProfileModified(true);
    setSuccess('');
    setError('');
  };

  // Handle password changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordSuccess('');
    setPasswordError('');
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await api.patch('/user/profile', {
        full_name: profileData.full_name,
        company_name: profileData.company_name || null,
      });

      // Update user in context
      updateUser(response.data);

      setSuccess('Perfil atualizado com sucesso!');
      setProfileModified(false);

      // Clear success message after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Reset profile form
  const handleResetProfile = () => {
    setProfileData({
      full_name: user.full_name || '',
      company_name: user.company_name || '',
    });
    setProfileModified(false);
    setSuccess('');
    setError('');
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    // Validate
    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordError('Preencha todos os campos');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('As senhas não coincidem');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password.length < 12) {
      setPasswordError('Nova senha deve ter no mínimo 12 caracteres');
      setPasswordLoading(false);
      return;
    }

    try {
      await api.post('/user/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      // Clear success message after 3s
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>
                <p className="text-sm text-gray-600">Atualize seus dados pessoais</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  className="input-field"
                  required
                  minLength={3}
                />
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa (opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleProfileChange}
                    className="input-field pl-10"
                    placeholder="Nome da sua empresa"
                  />
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">{success}</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Buttons */}
              {profileModified && (
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Alterações</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    disabled={loading}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-violet-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
                <p className="text-sm text-gray-600">Altere sua senha de acesso</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha Atual *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                    minLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 12 caracteres, incluindo maiúscula, minúscula, número e caractere especial
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Success/Error Messages */}
              {passwordSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-800">{passwordSuccess}</p>
                </div>
              )}

              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{passwordError}</p>
                </div>
              )}

              {/* Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-cloud flex items-center space-x-2"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Alterando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Alterar Senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-gray-900">Informações da Conta</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Tipo de Conta</p>
                <p className="font-medium text-gray-900">
                  {user.is_admin ? (
                    <span className="badge-solo">Administrador</span>
                  ) : (
                    <span className="badge-cloud">Usuário</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-emerald-600">
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </p>
              </div>

              <div>
                <p className="text-gray-600 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Membro desde</span>
                </p>
                <p className="font-medium text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card bg-gradient-to-br from-emerald-50 to-sky-50 border-emerald-200">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              <span>Dicas de Segurança</span>
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Use uma senha forte e única</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sky-600 mt-1">•</span>
                <span>Altere sua senha regularmente</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-violet-600 mt-1">•</span>
                <span>Nunca compartilhe suas credenciais</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

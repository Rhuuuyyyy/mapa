import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userProfile } from '../services/api';
import {
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  Settings,
  Upload,
  FileText,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await userProfile.getStats();
      setStats(data);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card bg-gradient-to-br from-emerald-50 via-sky-50 to-violet-50 border-2 border-emerald-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-solocloud rounded-2xl flex items-center justify-center shadow-solocloud">
                <span className="text-3xl font-bold text-white">
                  {getInitials(user.full_name)}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.full_name}
              </h1>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {user.company_name && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">{user.company_name}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {user.is_admin ? (
                    <span className="badge-solo flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Administrador</span>
                    </span>
                  ) : (
                    <span className="badge-cloud flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>Usuário</span>
                    </span>
                  )}
                  <span className="badge-solo">
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <Link
            to="/settings"
            className="btn-primary flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Editar Perfil</span>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        </div>
      ) : error ? (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Uploads */}
            <div className="card card-hover bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-solo">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totals.uploads}
              </p>
              <p className="text-sm text-gray-600">XMLs Enviados</p>
            </div>

            {/* Companies */}
            <div className="card card-hover bg-gradient-to-br from-sky-50 to-white border-sky-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-cloud">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-sky-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totals.companies}
              </p>
              <p className="text-sm text-gray-600">Empresas Cadastradas</p>
            </div>

            {/* Products */}
            <div className="card card-hover bg-gradient-to-br from-violet-50 to-white border-violet-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totals.products}
              </p>
              <p className="text-sm text-gray-600">Produtos Registrados</p>
            </div>

            {/* Reports */}
            <div className="card card-hover bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats.totals.reports}
              </p>
              <p className="text-sm text-gray-600">Relatórios Gerados</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Uploads */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Uploads Recentes</h2>
                    <p className="text-sm text-gray-600">Últimos arquivos enviados</p>
                  </div>
                </div>
                <Link to="/upload" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                  <span>Ver todos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats.recent_uploads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum upload realizado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent_uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {upload.filename}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(upload.upload_date)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge-solo ml-2">Processado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reports */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-violet-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Relatórios Recentes</h2>
                    <p className="text-sm text-gray-600">Últimos relatórios gerados</p>
                  </div>
                </div>
                <Link to="/reports" className="text-sm text-sky-600 hover:text-sky-700 flex items-center space-x-1">
                  <span>Ver todos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {stats.recent_reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum relatório gerado ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent_reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-sky-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Relatório {report.period}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge-cloud ml-2">Gerado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Profile;

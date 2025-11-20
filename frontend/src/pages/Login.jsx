import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Cloud, FileText, TrendingUp, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Ilustração/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 to-violet-700 relative">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12 w-full">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">SoloCloud</h1>
            <p className="text-2xl text-sky-100 mb-2">
              Automação Inteligente
            </p>
            <p className="text-lg text-sky-200">
              Gestão de relatórios na nuvem
            </p>
          </div>

          <div className="space-y-6 text-white/90 mt-8">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white/20 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Processamento Automático</h3>
                <p className="text-sm text-sky-100">Upload e análise de XMLs de NF-e em segundos</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Relatórios Automatizados</h3>
                <p className="text-sm text-sky-100">Geração automática e inteligente de documentos</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-white/20 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Gestão em Nuvem</h3>
                <p className="text-sm text-sky-100">Organize e gerencie seus dados de qualquer lugar</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12">
            <div className="flex items-center space-x-2 text-sky-100 text-sm">
              <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
              <span>Plataforma 100% cloud e segura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-sky-600 rounded-xl flex items-center justify-center">
                <Cloud className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gradient">SoloCloud</h1>
            </div>
          </div>

          <div className="card shadow-cloud-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
              <p className="text-gray-600">Entre com suas credenciais para continuar</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="seu@email.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <button type="button" className="font-medium text-sky-600 hover:text-sky-500 transition-colors">
                    Esqueceu a senha?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Não tem uma conta?{' '}
                <button type="button" className="font-medium text-sky-600 hover:text-sky-500 transition-colors">
                  Entre em contato com o administrador
                </button>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            © 2025 SoloCloud. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

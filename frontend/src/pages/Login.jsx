import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Cloud, FileText, TrendingUp, CheckCircle, Sprout, ExternalLink } from 'lucide-react';

const ADMIN_EMAIL = 'rhyan.hdr@gmail.com';
const REMEMBER_EMAIL_KEY = 'solocloud_remember_email';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar email salvo ao iniciar
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Salvar ou remover email do localStorage
    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-sky-600 to-violet-700 relative">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center items-start px-16 py-12 w-full">
          <div className="mb-8">
            <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <Sprout className="w-6 h-6 text-emerald-200 absolute bottom-2 left-2" />
              <Cloud className="w-8 h-8 text-white absolute top-2 right-2" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">SoloCloud</h1>
            <p className="text-2xl text-emerald-100 mb-2">
              Da Terra à Nuvem
            </p>
            <p className="text-lg text-sky-200">
              Automação completa de relatórios
            </p>
          </div>

          <div className="space-y-6 text-white/90 mt-8">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm p-2 rounded-lg">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Base Sólida</h3>
                <p className="text-sm text-emerald-100">Upload e organização de dados estruturados</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-sky-500/30 to-violet-500/30 backdrop-blur-sm p-2 rounded-lg">
                <Cloud className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Processamento na Nuvem</h3>
                <p className="text-sm text-sky-100">Análise e geração automática em tempo real</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-emerald-500/30 to-violet-500/30 backdrop-blur-sm p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Relatórios Inteligentes</h3>
                <p className="text-sm text-violet-100">Documentos completos no formato oficial</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12">
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              <span>Solo + Cloud = Automação Total</span>
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
              <div className="relative w-12 h-12 bg-gradient-solocloud rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white absolute bottom-1 left-1" />
                <Cloud className="w-6 h-6 text-white absolute top-1 right-1" />
              </div>
              <h1 className="text-3xl font-bold text-gradient">SoloCloud</h1>
            </div>
          </div>

          <div className="card shadow-solocloud">
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
                    checked={rememberMe}
                    onChange={handleRememberChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href={`mailto:${ADMIN_EMAIL}?subject=Esqueci%20minha%20senha%20-%20SoloCloud&body=Olá,%20esqueci%20minha%20senha%20e%20preciso%20de%20ajuda%20para%20recuperá-la.%0A%0AMeu%20email%20de%20cadastro:%20`}
                    className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Esqueceu a senha?
                  </a>
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
                <a
                  href={`mailto:${ADMIN_EMAIL}?subject=Solicita%C3%A7%C3%A3o%20de%20Acesso%20-%20SoloCloud&body=Olá,%20gostaria%20de%20solicitar%20acesso%20à%20plataforma%20SoloCloud.%0A%0ANome:%20%0AEmpresa:%20%0ATelefone:%20`}
                  className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors inline-flex items-center space-x-1"
                >
                  <span>Entre em contato com o administrador</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Leaf } from 'lucide-react';

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-emerald relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <Leaf className="w-20 h-20 mb-4 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold mb-4">MAPA SaaS</h1>
          <p className="text-xl text-emerald-100 text-center max-w-md">
            Sistema de Automação de Relatórios MAPA
          </p>
          <div className="mt-12 text-emerald-100">
            <p className="text-sm">✓ Processamento automático de XMLs</p>
            <p className="text-sm mt-2">✓ Geração de relatórios trimestrais</p>
            <p className="text-sm mt-2">✓ Gestão de catálogo hierárquico</p>
          </div>
        </div>

        {/* Decoração de fundo */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-emerald-800 to-transparent"></div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <Leaf className="w-10 h-10 text-emerald-600" />
              <h1 className="text-3xl font-bold text-gradient">MAPA SaaS</h1>
            </div>
          </div>

          <div className="card shadow-emerald-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h2>
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
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
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
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                  Entre em contato com o administrador
                </a>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            © 2025 MAPA SaaS. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

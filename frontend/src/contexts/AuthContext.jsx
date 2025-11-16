import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth as authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar se há token salvo e buscar dados do usuário
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Validar token buscando dados atualizados
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { access_token } = await authService.login(email, password);

      localStorage.setItem('token', access_token);

      // Buscar dados do usuário
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  FileUp,
  FileBarChart,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Cloud,
  ChevronDown,
  User,
  Sprout
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Upload XML', icon: FileUp, path: '/upload' },
    { name: 'Empresas', icon: Building2, path: '/companies' },
    { name: 'Produtos', icon: Package, path: '/products' },
    { name: 'Relatórios', icon: FileBarChart, path: '/reports' },
    { name: 'Catálogo', icon: BookOpen, path: '/catalog' },
    ...(isAdmin ? [{ name: 'Usuários', icon: Users, path: '/users' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-solocloud rounded-lg flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white absolute bottom-1 left-1" />
                <Cloud className="w-5 h-5 text-white absolute top-1 right-1" />
              </div>
              <span className="text-xl font-bold text-gradient">SoloCloud</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                to="/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span>Configurações</span>
              </Link>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full flex items-center justify-center ring-2 ring-emerald-200">
                <span className="text-emerald-700 font-semibold">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-gray-900 lg:hidden">
                SoloCloud
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {user?.is_admin && (
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-800 ring-1 ring-emerald-200">
                  Administrador
                </span>
              )}

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-700" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Meu Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Configurações
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

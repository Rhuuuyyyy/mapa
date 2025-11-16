import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  FileUp,
  FileBarChart,
  TrendingUp,
  Activity
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-medium">{trend}</span>
              <span className="text-gray-500 ml-1">vs. último mês</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Olá, {user?.full_name || 'Usuário'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bem-vindo ao painel do MAPA SaaS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Empresas"
          value="12"
          icon={Building2}
          trend="+2 este mês"
          color="emerald"
        />
        <StatCard
          title="Produtos Cadastrados"
          value="48"
          icon={Package}
          trend="+8 este mês"
          color="blue"
        />
        <StatCard
          title="XMLs Processados"
          value="156"
          icon={FileUp}
          trend="+23 este mês"
          color="purple"
        />
        <StatCard
          title="Relatórios Gerados"
          value="8"
          icon={FileBarChart}
          trend="+2 este mês"
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-emerald-600" />
              Atividades Recentes
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Upload de XML processado', time: '5 minutos atrás', status: 'success' },
              { action: 'Novo produto cadastrado', time: '1 hora atrás', status: 'info' },
              { action: 'Relatório Q4-2024 gerado', time: '2 horas atrás', status: 'success' },
              { action: 'Empresa atualizada', time: '1 dia atrás', status: 'info' },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-all duration-200 text-left group">
              <FileUp className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Upload XML</p>
              <p className="text-xs text-gray-500 mt-1">Processar nova NF-e</p>
            </button>

            <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all duration-200 text-left group">
              <FileBarChart className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Gerar Relatório</p>
              <p className="text-xs text-gray-500 mt-1">Relatório trimestral</p>
            </button>

            <button className="p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all duration-200 text-left group">
              <Building2 className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Nova Empresa</p>
              <p className="text-xs text-gray-500 mt-1">Cadastrar empresa</p>
            </button>

            <button className="p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-all duration-200 text-left group">
              <Package className="w-8 h-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium text-gray-900">Novo Produto</p>
              <p className="text-xs text-gray-500 mt-1">Cadastrar produto</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

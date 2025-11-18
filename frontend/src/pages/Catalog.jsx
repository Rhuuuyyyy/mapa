import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Building2,
  Package,
  ChevronDown,
  ChevronRight,
  Search,
  Loader2,
  Tag,
  FileText,
  Download
} from 'lucide-react';
import { catalog as catalogAPI, companies as companiesAPI, products as productsAPI } from '../services/api';

const Catalog = () => {
  const [catalogData, setCatalogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [viewMode, setViewMode] = useState('hierarchical'); // 'hierarchical' or 'flat'

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);

      // Carregar empresas e produtos
      const [companies, products] = await Promise.all([
        companiesAPI.getAll(),
        productsAPI.getAll()
      ]);

      // Agrupar produtos por empresa
      const catalog = companies.map(company => ({
        ...company,
        products: products.filter(p => p.company_id === company.id)
      }));

      setCatalogData(catalog);

      // Expandir todas as empresas por padrão
      setExpandedCompanies(new Set(companies.map(c => c.id)));
    } catch (error) {
      console.error('Erro ao carregar catálogo:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompany = (companyId) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCompanies(new Set(catalogData.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCompanies(new Set());
  };

  const getProductTypeLabel = (type) => {
    const types = {
      'A': 'A - Alimentos',
      'B': 'B - Bebidas',
      'C': 'C - Carnes',
      'D': 'D - Derivados',
      'E': 'E - Especiais',
      'F': 'F - Forragens',
      'S': 'S - Suplementos'
    };
    return types[type] || type;
  };

  const exportCatalog = () => {
    // Criar conteúdo do catálogo em texto
    let content = 'CATÁLOGO DE PRODUTOS MAPA\n\n';
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`;
    content += '═'.repeat(80) + '\n\n';

    catalogData.forEach(company => {
      content += `EMPRESA: ${company.company_name}\n`;
      content += `Registro MAPA: ${company.mapa_registration}\n`;
      content += `Total de Produtos: ${company.products.length}\n\n`;

      if (company.products.length > 0) {
        content += 'PRODUTOS:\n';
        company.products.forEach((product, index) => {
          content += `  ${index + 1}. ${product.product_name}\n`;
          content += `     Tipo: ${getProductTypeLabel(product.product_type)}\n`;
          content += `     Registro: ${product.mapa_registration}\n\n`;
        });
      }

      content += '─'.repeat(80) + '\n\n';
    });

    // Criar e baixar arquivo
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogo_mapa_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Filtrar catálogo por busca
  const filteredCatalog = catalogData.map(company => {
    if (!searchTerm) return company;

    const companyMatches = company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.mapa_registration.toLowerCase().includes(searchTerm.toLowerCase());

    const filteredProducts = company.products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.mapa_registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductTypeLabel(product.product_type).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (companyMatches || filteredProducts.length > 0) {
      return {
        ...company,
        products: companyMatches ? company.products : filteredProducts
      };
    }

    return null;
  }).filter(Boolean);

  const totalCompanies = catalogData.length;
  const totalProducts = catalogData.reduce((sum, company) => sum + company.products.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Produtos</h1>
          <p className="text-gray-600 mt-1">
            Visualização hierárquica de empresas e produtos cadastrados
          </p>
        </div>
        <button
          onClick={exportCatalog}
          className="btn-primary mt-4 sm:mt-0 flex items-center"
          disabled={catalogData.length === 0}
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar Catálogo
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-700 font-medium">Total de Empresas</p>
              <p className="text-3xl font-bold text-emerald-900 mt-1">{totalCompanies}</p>
            </div>
            <Building2 className="w-12 h-12 text-emerald-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total de Produtos</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalProducts}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Média por Empresa</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {totalCompanies > 0 ? (totalProducts / totalCompanies).toFixed(1) : '0'}
              </p>
            </div>
            <FileText className="w-12 h-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresas ou produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Expandir Tudo
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando catálogo...</p>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'Nenhum resultado encontrado' : 'Catálogo vazio'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Tente buscar com outros termos'
              : 'Cadastre empresas e produtos para visualizar o catálogo'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCatalog.map((company) => (
            <div key={company.id} className="card">
              {/* Company Header */}
              <button
                onClick={() => toggleCompany(company.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-lg">{company.company_name}</h3>
                    <p className="text-sm text-gray-600">
                      Registro: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {company.mapa_registration}
                      </span>
                      <span className="ml-3 text-emerald-600 font-medium">
                        {company.products.length} produto(s)
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {expandedCompanies.has(company.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Products List */}
              {expandedCompanies.has(company.id) && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  {company.products.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Nenhum produto cadastrado para esta empresa</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {company.products.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 truncate">
                                {product.product_name}
                              </h4>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span>{getProductTypeLabel(product.product_type)}</span>
                                </div>
                                <div className="flex items-start">
                                  <span className="flex-shrink-0 mr-1">Registro:</span>
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded break-all">
                                    {product.mapa_registration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;

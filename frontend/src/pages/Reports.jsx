import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Building2,
  Package,
  Trash2,
  Eye
} from 'lucide-react';
import { reports as reportsAPI } from '../services/api';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadReportHistory();
  }, []);

  const loadReportHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await reportsAPI.getAll();
      setReportHistory(history);
    } catch (err) {
      console.error('Erro ao carregar histórico de relatórios:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Gerar períodos dos últimos 2 anos (8 trimestres)
  const generatePeriods = () => {
    const periods = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);

    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let quarter = 4; quarter >= 1; quarter--) {
        // Não incluir trimestres futuros
        if (year === currentYear && quarter > currentQuarter) {
          continue;
        }
        const periodValue = `Q${quarter}-${year}`;
        const periodLabel = `${quarter}º Trimestre de ${year}`;
        periods.push({ value: periodValue, label: periodLabel });
      }
    }

    return periods;
  };

  const periods = generatePeriods();

  const handleGenerate = async () => {
    if (!selectedPeriod) {
      setError('Por favor, selecione um período');
      return;
    }

    setError(null);
    setResult(null);
    setGenerating(true);

    try {
      const response = await reportsAPI.generate(selectedPeriod);
      setResult({
        type: 'success',
        message: 'Relatório gerado com sucesso!',
        data: response
      });
      // Recarregar histórico
      loadReportHistory();
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);

      // Extrair e formatar mensagem de erro do backend
      let errorMessage = 'Erro ao gerar relatório';
      let errorDetails = [];

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Erros de validação do Pydantic
          errorMessage = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;

          // Identificar erros específicos e fornecer mensagens mais claras
          if (detail.toLowerCase().includes('produto') && detail.toLowerCase().includes('não cadastrado')) {
            errorMessage = '⚠️ Produto não cadastrado encontrado';
            errorDetails.push('Um ou mais produtos das notas fiscais não estão cadastrados no sistema.');
            errorDetails.push('Por favor, cadastre todos os produtos antes de gerar o relatório.');
            errorDetails.push('Acesse "Produtos" no menu para cadastrar os produtos faltantes.');
          } else if (detail.toLowerCase().includes('empresa') && detail.toLowerCase().includes('não cadastrada')) {
            errorMessage = '⚠️ Empresa não cadastrada encontrada';
            errorDetails.push('Uma ou mais empresas das notas fiscais não estão cadastradas no sistema.');
            errorDetails.push('Por favor, cadastre todas as empresas antes de gerar o relatório.');
            errorDetails.push('Acesse "Empresas" no menu para cadastrar as empresas faltantes.');
          } else if (detail.toLowerCase().includes('nenhum dado encontrado')) {
            errorMessage = '📊 Nenhum dado para o período';
            errorDetails.push('Não foram encontradas notas fiscais para o período selecionado.');
            errorDetails.push('Faça upload de XMLs de NF-e para gerar relatórios.');
          }
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Combinar mensagem principal com detalhes
      if (errorDetails.length > 0) {
        errorMessage = errorMessage + '\n\n' + errorDetails.join('\n');
      }

      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedPeriod) {
      setError('Por favor, selecione um período');
      return;
    }

    setError(null);
    setDownloading(true);

    try {
      const blob = await reportsAPI.download(selectedPeriod);

      // Criar link temporário para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_mapa_${selectedPeriod}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setResult({
        type: 'success',
        message: 'Download realizado com sucesso!'
      });
    } catch (err) {
      console.error('Erro ao baixar relatório:', err);

      // Extrair e formatar mensagem de erro do backend
      let errorMessage = 'Erro ao baixar relatório';
      let errorDetails = [];

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          // Erros de validação do Pydantic
          errorMessage = detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
        } else if (typeof detail === 'string') {
          errorMessage = detail;

          // Identificar erros específicos e fornecer mensagens mais claras
          if (detail.toLowerCase().includes('produto') && detail.toLowerCase().includes('não cadastrado')) {
            errorMessage = '⚠️ Produto não cadastrado encontrado';
            errorDetails.push('Um ou mais produtos das notas fiscais não estão cadastrados no sistema.');
            errorDetails.push('Por favor, cadastre todos os produtos antes de baixar o relatório.');
            errorDetails.push('Acesse "Produtos" no menu para cadastrar os produtos faltantes.');
          } else if (detail.toLowerCase().includes('empresa') && detail.toLowerCase().includes('não cadastrada')) {
            errorMessage = '⚠️ Empresa não cadastrada encontrada';
            errorDetails.push('Uma ou mais empresas das notas fiscais não estão cadastradas no sistema.');
            errorDetails.push('Por favor, cadastre todas as empresas antes de baixar o relatório.');
            errorDetails.push('Acesse "Empresas" no menu para cadastrar as empresas faltantes.');
          } else if (detail.toLowerCase().includes('nenhum dado encontrado')) {
            errorMessage = '📊 Nenhum dado para o período';
            errorDetails.push('Não foram encontradas notas fiscais para o período selecionado.');
            errorDetails.push('Faça upload de XMLs de NF-e para gerar relatórios.');
          }
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Combinar mensagem principal com detalhes
      if (errorDetails.length > 0) {
        errorMessage = errorMessage + '\n\n' + errorDetails.join('\n');
      }

      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      await reportsAPI.delete(reportId);
      loadReportHistory();
    } catch (err) {
      alert('Erro ao excluir relatório');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getPeriodInfo = (periodValue) => {
    if (!periodValue) return null;

    const [year, quarter] = periodValue.split('Q');
    const startMonth = (parseInt(quarter) - 1) * 3 + 1;
    const endMonth = startMonth + 2;

    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return {
      year,
      quarter,
      startMonth: monthNames[startMonth - 1],
      endMonth: monthNames[endMonth - 1]
    };
  };

  const periodInfo = getPeriodInfo(selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios MAPA</h1>
        <p className="text-gray-600 mt-1">
          Gere relatórios trimestrais para envio ao MAPA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Geração */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-600" />
              Gerar Novo Relatório
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => {
                      setSelectedPeriod(e.target.value);
                      setError(null);
                      setResult(null);
                    }}
                    className="input-field pl-10"
                  >
                    <option value="">Selecione um período</option>
                    {periods.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {periodInfo && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900 mb-2">Período Selecionado</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-700 font-medium">Trimestre:</span>
                      <p className="text-emerald-900">{periodInfo.quarter}º de {periodInfo.year}</p>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium">Meses:</span>
                      <p className="text-emerald-900">{periodInfo.startMonth} - {periodInfo.endMonth}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                  </div>
                </div>
              )}

              {result && result.data && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-emerald-800 font-medium">{result.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-emerald-700">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          <span>{result.data.total_nfes} NF-es processadas</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{result.data.rows?.length || 0} produtos no relatório</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.data.rows && result.data.rows.length > 0 && (
                    <div className="card">
                      <h3 className="font-semibold text-gray-900 mb-4">Dados do Relatório</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registro MAPA</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd. Importação</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd. Nacional</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {result.data.rows.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900">{row.mapa_registration}</td>
                                <td className="px-4 py-3 text-gray-700">{row.product_name || '-'}</td>
                                <td className="px-4 py-3 text-gray-700">{row.unit}</td>
                                <td className="px-4 py-3 text-right text-gray-900 font-medium">{row.quantity_import}</td>
                                <td className="px-4 py-3 text-right text-gray-900 font-medium">{row.quantity_domestic}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedPeriod || generating}
                  className="btn-primary flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!selectedPeriod || downloading}
                  className="btn-secondary flex-1"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Baixar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Informações sobre o relatório */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Sobre os Relatórios MAPA
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                • Os relatórios são gerados trimestralmente com base nos produtos cadastrados
              </p>
              <p>
                • Incluem todas as empresas e produtos ativos no período selecionado
              </p>
              <p>
                • O arquivo gerado está no formato exigido pelo MAPA
              </p>
              <p>
                • Certifique-se de que todos os dados estão corretos antes de gerar
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar com estatísticas */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Estatísticas Rápidas</h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-emerald-700 font-medium">Empresas</span>
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-emerald-900">-</p>
                <p className="text-xs text-emerald-600 mt-1">Cadastradas no sistema</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-700 font-medium">Produtos</span>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-900">-</p>
                <p className="text-xs text-blue-600 mt-1">Cadastrados no sistema</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-700 font-medium">Relatórios</span>
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-900">-</p>
                <p className="text-xs text-purple-600 mt-1">Gerados este ano</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Prazos de Envio</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-xs">1º</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">1º Trimestre</p>
                  <p className="text-gray-600">Enviar até 30/04</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-xs">2º</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">2º Trimestre</p>
                  <p className="text-gray-600">Enviar até 31/07</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-xs">3º</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">3º Trimestre</p>
                  <p className="text-gray-600">Enviar até 31/10</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 font-bold text-xs">4º</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">4º Trimestre</p>
                  <p className="text-gray-600">Enviar até 31/01</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Relatórios */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Relatórios</h2>

        {loadingHistory ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Carregando histórico...</p>
          </div>
        ) : reportHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum relatório gerado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de Geração</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-gray-900">{report.report_period}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(report.generated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPeriod(report.report_period);
                            handleGenerate();
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

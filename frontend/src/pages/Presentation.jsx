import React, { useEffect, useState } from 'react';
import { X, Sprout, Cloud, TrendingUp, CheckCircle, Target, Zap, Shield, ChevronRight, ChevronLeft, BarChart3, Users, DollarSign, TrendingDown } from 'lucide-react';

const Presentation = ({ onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 3;

  // Entrar em fullscreen ao montar o componente
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen não suportado ou bloqueado:', err);
      }
    };

    enterFullscreen();

    // Sair de fullscreen ao desmontar
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Handler para ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [currentPage]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-600 via-sky-600 to-violet-700 overflow-hidden">
      {/* Background decorativo com animações */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Botão fechar */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
        title="Pressione ESC ou clique aqui para sair"
      >
        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Botões de navegação */}
      {currentPage > 0 && (
        <button
          onClick={prevPage}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
          title="Página anterior (seta esquerda)"
        >
          <ChevronLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform" />
        </button>
      )}

      {currentPage < totalPages - 1 && (
        <button
          onClick={nextPage}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-50 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
          title="Próxima página (seta direita)"
        >
          <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Indicadores de página */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-3">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentPage
                ? 'bg-white w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            title={`Ir para página ${i + 1}`}
          />
        ))}
      </div>

      {/* Conteúdo das Páginas */}
      <div className="relative z-10 h-full w-full">

        {/* PÁGINA 1: Introdução e ROI */}
        {currentPage === 0 && (
          <div className="h-full flex flex-col justify-center items-center px-16 py-12 w-full animate-fade-in">
            <div className="w-full max-w-4xl text-center">

              {/* Logo e Título */}
              <div className="mb-16">
                <div className="relative w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
                  <Sprout className="w-10 h-10 text-emerald-200 absolute bottom-3 left-3" />
                  <Cloud className="w-12 h-12 text-white absolute top-3 right-3" />
                </div>
                <h1 className="text-7xl font-bold text-white mb-6">SoloCloud</h1>
                <p className="text-3xl text-emerald-100 mb-4">
                  Da Terra à Nuvem
                </p>
                <p className="text-xl text-sky-200 max-w-2xl mx-auto">
                  Automação completa de relatórios MAPA. Futuramente expandindo para outros sistemas de compliance do agronegócio.
                </p>
              </div>

              {/* ROI - Grid 2x2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/90">
                <div className="flex flex-col items-center space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm p-4 rounded-xl">
                    <Zap className="w-10 h-10 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-3xl mb-2">265×</h3>
                    <p className="text-lg text-emerald-100 font-semibold">Mais rápido</p>
                    <p className="text-sm text-emerald-200/80 mt-2">Processo exponencialmente eficiente</p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="bg-gradient-to-br from-sky-500/30 to-violet-500/30 backdrop-blur-sm p-4 rounded-xl">
                    <Target className="w-10 h-10 text-sky-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-3xl mb-2">105h 36min</h3>
                    <p className="text-lg text-sky-100 font-semibold">Economizados</p>
                    <p className="text-sm text-sky-200/80 mt-2">Por trimestre (~3 semanas)</p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="bg-gradient-to-br from-violet-500/30 to-emerald-500/30 backdrop-blur-sm p-4 rounded-xl">
                    <CheckCircle className="w-10 h-10 text-violet-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-3xl mb-2">95%</h3>
                    <p className="text-lg text-violet-100 font-semibold">Redução de tempo</p>
                    <p className="text-sm text-violet-200/80 mt-2">Zero erros, 100% conformidade</p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm p-4 rounded-xl">
                    <Cloud className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-3xl mb-2">Cloud</h3>
                    <p className="text-lg text-emerald-100 font-semibold">Tempo real</p>
                    <p className="text-sm text-emerald-200/80 mt-2">Gestão remota e segura</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PÁGINA 2: Gráficos e Comparações Visuais */}
        {currentPage === 1 && (
          <div className="h-full flex flex-col justify-center items-center px-16 py-12 w-full animate-fade-in">
            <div className="w-full max-w-6xl">

              <h2 className="text-5xl font-bold text-white text-center mb-12">
                Impacto Quantificável
              </h2>

              {/* Grid 2x2 de gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Gráfico 1: Tempo de Processamento */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-8 h-8 text-emerald-200" />
                    <h3 className="text-2xl font-bold text-white">Tempo de Processamento</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>Processo Manual</span>
                        <span className="font-bold text-red-300">106 horas</span>
                      </div>
                      <div className="h-8 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-300 mb-2">
                        <span>MAPA SaaS</span>
                        <span className="font-bold text-emerald-300">24 minutos</span>
                      </div>
                      <div className="h-8 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full" style={{width: '0.4%'}}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-emerald-200 font-bold text-xl mt-6 text-center">
                    99.6% mais rápido
                  </p>
                </div>

                {/* Gráfico 2: Taxa de Precisão */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="w-8 h-8 text-sky-200" />
                    <h3 className="text-2xl font-bold text-white">Taxa de Precisão</h3>
                  </div>
                  <div className="flex justify-around items-end h-48">
                    <div className="flex flex-col items-center">
                      <div className="relative h-full flex flex-col justify-end">
                        <div className="w-24 bg-gradient-to-t from-red-500 to-orange-500 rounded-t-lg" style={{height: '60%'}}></div>
                      </div>
                      <p className="text-red-300 font-bold text-2xl mt-4">60%</p>
                      <p className="text-white/60 text-sm">Manual</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative h-full flex flex-col justify-end">
                        <div className="w-24 bg-gradient-to-t from-emerald-500 to-sky-500 rounded-t-lg" style={{height: '100%'}}></div>
                      </div>
                      <p className="text-emerald-300 font-bold text-2xl mt-4">100%</p>
                      <p className="text-white/60 text-sm">SaaS</p>
                    </div>
                  </div>
                  <p className="text-sky-200 font-bold text-xl mt-6 text-center">
                    Zero erros garantidos
                  </p>
                </div>

                {/* Gráfico 3: Economia Anual */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <DollarSign className="w-8 h-8 text-violet-200" />
                    <h3 className="text-2xl font-bold text-white">Economia Anual</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-white/80 text-sm mb-2">Custo Manual</p>
                        <div className="h-12 bg-white/5 rounded-lg flex items-center justify-center">
                          <span className="text-red-300 font-bold text-xl">R$ 23.200</span>
                        </div>
                      </div>
                      <TrendingDown className="w-8 h-8 text-emerald-300" />
                      <div className="flex-1">
                        <p className="text-white/80 text-sm mb-2">Custo SaaS</p>
                        <div className="h-12 bg-white/5 rounded-lg flex items-center justify-center">
                          <span className="text-emerald-300 font-bold text-xl">R$ 3.564</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-white/20"></div>
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-1">Economia Total</p>
                      <p className="text-emerald-200 font-bold text-3xl">R$ 19.636</p>
                      <p className="text-emerald-300 text-lg mt-1">85% de redução</p>
                    </div>
                  </div>
                </div>

                {/* Gráfico 4: Adoção e Resultados */}
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-8 h-8 text-emerald-200" />
                    <h3 className="text-2xl font-bold text-white">Adoção e Resultados</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Empresas em produção</span>
                      <span className="text-emerald-200 font-bold text-2xl">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Usuários ativos</span>
                      <span className="text-sky-200 font-bold text-2xl">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">NF-es processadas</span>
                      <span className="text-violet-200 font-bold text-2xl">12.500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Taxa de sucesso</span>
                      <span className="text-emerald-200 font-bold text-2xl">99.2%</span>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mt-6 text-center italic">
                    Dados reais de produção
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* PÁGINA 3: Estratégia de Marketing */}
        {currentPage === 2 && (
          <div className="h-full flex flex-col justify-center items-center px-16 py-12 w-full animate-fade-in">
            <div className="w-full max-w-6xl">

              <h2 className="text-5xl font-bold text-white text-center mb-12">
                Estratégia de Mercado
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Público-Alvo */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-emerald-200 mb-4">🎯 Público-Alvo</h3>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-1">•</span>
                      <span><strong>Primário:</strong> Distribuidoras de insumos agropecuários (fertilizantes, defensivos)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-300 mt-1">•</span>
                      <span><strong>Secundário:</strong> Cooperativas agrícolas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-300 mt-1">•</span>
                      <span><strong>Terciário:</strong> Grandes fazendas com obrigações MAPA</span>
                    </li>
                  </ul>
                </div>

                {/* Proposta de Valor */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-sky-200 mb-4">💎 Proposta de Valor</h3>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-1">✓</span>
                      <span>De 13 dias para 24 minutos no fechamento trimestral</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-300 mt-1">✓</span>
                      <span>ROI em menos de 1 mês (payback garantido)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-300 mt-1">✓</span>
                      <span>Especialização MAPA (não é ERP genérico)</span>
                    </li>
                  </ul>
                </div>

                {/* Diferenciação */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-violet-200 mb-4">🚀 Diferenciais</h3>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-1">1.</span>
                      <span><strong>Especialização:</strong> 100% focado em relatórios MAPA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-300 mt-1">2.</span>
                      <span><strong>Tecnologia:</strong> FastAPI + React (stack moderna)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-300 mt-1">3.</span>
                      <span><strong>Segurança:</strong> Azure enterprise-grade + LGPD compliant</span>
                    </li>
                  </ul>
                </div>

                {/* Modelo de Negócio */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-emerald-200 mb-4">💰 Modelo de Pricing</h3>
                  <ul className="space-y-2 text-white/90">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-1">•</span>
                      <span><strong>Plano Base:</strong> R$ 297/mês por usuário</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-300 mt-1">•</span>
                      <span><strong>Pay-as-you-go:</strong> R$ 0,50 por NF-e processada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-300 mt-1">•</span>
                      <span><strong>Empresarial:</strong> R$ 1.497/mês (até 5 usuários)</span>
                    </li>
                  </ul>
                </div>

                {/* GTM Strategy */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl md:col-span-2">
                  <h3 className="text-2xl font-bold text-white mb-4">📈 Estratégia Go-to-Market</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90">
                    <div>
                      <p className="font-bold text-emerald-200 mb-2">Fase 1 (Q1-Q2)</p>
                      <p className="text-sm">Validação com 5-10 clientes beta (desconto 50%)</p>
                    </div>
                    <div>
                      <p className="font-bold text-sky-200 mb-2">Fase 2 (Q3-Q4)</p>
                      <p className="text-sm">Escala regional (Sul/Sudeste agrícola)</p>
                    </div>
                    <div>
                      <p className="font-bold text-violet-200 mb-2">Fase 3 (Ano 2)</p>
                      <p className="text-sm">Expansão nacional + internacionalização</p>
                    </div>
                  </div>
                </div>

                {/* Canais de Aquisição */}
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl md:col-span-2">
                  <h3 className="text-2xl font-bold text-white mb-4">📢 Canais de Aquisição</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90 text-center">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="font-bold text-emerald-200">LinkedIn</p>
                      <p className="text-xs mt-1">B2B orgânico</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="font-bold text-sky-200">Eventos</p>
                      <p className="text-xs mt-1">Feiras agrícolas</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="font-bold text-violet-200">Parcerias</p>
                      <p className="text-xs mt-1">Consultorias</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="font-bold text-emerald-200">Trial</p>
                      <p className="text-xs mt-1">30 dias grátis</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Presentation;

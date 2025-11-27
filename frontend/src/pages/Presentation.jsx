import React, { useEffect, useState } from 'react';
import { X, Sprout, Cloud, TrendingUp, CheckCircle, Target, Zap, Shield } from 'lucide-react';

const Presentation = ({ onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-emerald-600 via-sky-600 to-violet-700">
      {/* Background decorativo com animações */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 left-20 w-[450px] h-[450px] bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Botão fechar */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
        title="Pressione ESC ou clique aqui para sair"
      >
        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Conteúdo Principal */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto text-center space-y-12 animate-fade-in">

          {/* Logo e Título */}
          <div className="space-y-6">
            <div className="relative w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <Sprout className="w-12 h-12 text-emerald-200 absolute bottom-6 left-6" />
              <Cloud className="w-16 h-16 text-white absolute top-6 right-6" />
            </div>

            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
              SoloCloud
            </h1>

            <p className="text-3xl text-emerald-100 font-semibold mb-4">
              Da Terra à Nuvem
            </p>

            <p className="text-xl text-sky-200 max-w-3xl mx-auto leading-relaxed">
              Sistema de automação completa de relatórios regulatórios para o setor agrícola.
              Atualmente focado em relatórios MAPA, com expansão futura para outros sistemas
              de compliance e gestão do agronegócio.
            </p>
          </div>

          {/* Divider */}
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>

          {/* ROI - Destaque Principal */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-4">
              <TrendingUp className="w-10 h-10 text-emerald-300" />
              Retorno Sobre o Investimento (ROI)
            </h2>

            <p className="text-xl text-emerald-100 mb-10 max-w-4xl mx-auto leading-relaxed">
              A implementação deste sistema representa uma mudança de paradigma na eficiência do setor:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {/* Velocidade */}
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm p-8 rounded-2xl border border-emerald-400/30">
                <Zap className="w-12 h-12 text-emerald-200 mb-4 mx-auto" />
                <h3 className="text-6xl font-bold text-white mb-3">265×</h3>
                <p className="text-lg text-emerald-100 font-semibold mb-2">Mais Rápido</p>
                <p className="text-sm text-emerald-200/80">Velocidade de processamento</p>
              </div>

              {/* Economia de Tempo */}
              <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/10 backdrop-blur-sm p-8 rounded-2xl border border-sky-400/30">
                <Target className="w-12 h-12 text-sky-200 mb-4 mx-auto" />
                <h3 className="text-5xl font-bold text-white mb-3">105h 36min</h3>
                <p className="text-lg text-sky-100 font-semibold mb-2">Economizados</p>
                <p className="text-sm text-sky-200/80">A cada trimestre</p>
              </div>

              {/* Impacto */}
              <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 backdrop-blur-sm p-8 rounded-2xl border border-violet-400/30">
                <CheckCircle className="w-12 h-12 text-violet-200 mb-4 mx-auto" />
                <h3 className="text-6xl font-bold text-white mb-3">~3</h3>
                <p className="text-lg text-violet-100 font-semibold mb-2">Semanas</p>
                <p className="text-sm text-violet-200/80">De trabalho realocado</p>
              </div>
            </div>

            <p className="text-lg text-white/90 max-w-4xl mx-auto leading-relaxed">
              <span className="font-bold text-emerald-200">Impacto Estratégico:</span> Essas 105 horas (quase 3 semanas de trabalho
              de um funcionário) são realocadas para atividades analíticas e estratégicas,
              em vez de digitação manual.
            </p>
          </div>

          {/* Benefícios - Grid */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-white/20">
            <h2 className="text-4xl font-bold text-white mb-8 flex items-center justify-center gap-4">
              <Shield className="w-10 h-10 text-sky-300" />
              Benefícios Projetados e Metas Técnicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Eficiência Operacional */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Eficiência Operacional</h3>
                    <p className="text-emerald-100">
                      <span className="font-bold text-2xl">95%</span> de redução no tempo de preparação
                      de relatórios trimestrais.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mitigação de Risco */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-500/20 p-3 rounded-lg">
                    <Shield className="w-6 h-6 text-sky-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Mitigação de Risco Humano</h3>
                    <p className="text-sky-100">
                      Garantia de <span className="font-bold text-2xl">ZERO</span> erros de digitação
                      ou cálculo, eliminando retrabalho.
                    </p>
                  </div>
                </div>
              </div>

              {/* Segurança Jurídica */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-violet-500/20 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-violet-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Segurança Jurídica</h3>
                    <p className="text-violet-100">
                      <span className="font-bold text-2xl">100%</span> de conformidade com o formato
                      oficial e exigências do Ministério da Agricultura (MAPA).
                    </p>
                  </div>
                </div>
              </div>

              {/* Auditoria e Controle */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Auditoria e Controle</h3>
                    <p className="text-emerald-100">
                      Rastreabilidade <span className="font-bold text-2xl">completa</span> de todas
                      as operações realizadas no sistema.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobilidade */}
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-500/20 p-3 rounded-lg">
                    <Cloud className="w-6 h-6 text-sky-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Mobilidade</h3>
                    <p className="text-sky-100">
                      Acesso em <span className="font-bold text-2xl">tempo real</span> via Cloud,
                      permitindo gestão remota e segura de qualquer lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8">
            <p className="text-white/60 text-sm">
              Pressione <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd> para sair da apresentação
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Presentation;

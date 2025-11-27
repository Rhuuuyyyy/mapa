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

      {/* Conteúdo Principal - SEM SCROLL */}
      <div className="relative z-10 h-full flex flex-col justify-center items-start px-16 py-12 w-full">
        <div className="w-full max-w-2xl">

          {/* Logo e Título */}
          <div className="mb-12">
            <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <Sprout className="w-6 h-6 text-emerald-200 absolute bottom-2 left-2" />
              <Cloud className="w-8 h-8 text-white absolute top-2 right-2" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">SoloCloud</h1>
            <p className="text-2xl text-emerald-100 mb-2">
              Da Terra à Nuvem
            </p>
            <p className="text-lg text-sky-200 max-w-xl">
              Automação completa de relatórios MAPA. Futuramente expandindo para outros sistemas de compliance do agronegócio.
            </p>
          </div>

          {/* ROI - Simples e Direto */}
          <div className="space-y-6 text-white/90 mb-8">
            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm p-3 rounded-lg">
                <Zap className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xl mb-1">265× mais rápido</h3>
                <p className="text-sm text-emerald-100">O processo se torna exponencialmente mais eficiente</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-sky-500/30 to-violet-500/30 backdrop-blur-sm p-3 rounded-lg">
                <Target className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xl mb-1">105h 36min economizados</h3>
                <p className="text-sm text-sky-100">Por trimestre, quase 3 semanas de trabalho realocadas</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-violet-500/30 to-emerald-500/30 backdrop-blur-sm p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-violet-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xl mb-1">95% de redução de tempo</h3>
                <p className="text-sm text-violet-100">Zero erros, 100% conformidade, rastreabilidade completa</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="mt-1 bg-gradient-to-br from-emerald-500/30 to-sky-500/30 backdrop-blur-sm p-3 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xl mb-1">Acesso em tempo real via Cloud</h3>
                <p className="text-sm text-emerald-100">Gestão remota e segura de qualquer lugar</p>
              </div>
            </div>
          </div>

          {/* Footer com hint */}
          <div className="mt-auto pt-8">
            <p className="text-white/50 text-sm">
              Pressione <kbd className="px-2 py-1 bg-white/20 rounded text-xs">ESC</kbd> para sair
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Presentation;

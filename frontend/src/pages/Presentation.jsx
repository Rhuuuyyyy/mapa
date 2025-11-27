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

      {/* Conteúdo Principal - CENTRALIZADO */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-16 py-12 w-full">
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
    </div>
  );
};

export default Presentation;

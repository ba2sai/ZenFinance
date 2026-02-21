import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, CreditCard, PlayCircle, ShieldCheck, ChevronRight, X } from 'lucide-react';

const TOUR_SLIDES = [
  {
    icon: Target,
    title: "Bienvenido a ZenFinance",
    description: "Tu centro de comando financiero personal. Aquí no solo administras tu dinero, cultivas tu paz mental.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/20"
  },
  {
    icon: TrendingUp,
    title: "Panel Principal (Dashboard)",
    description: "Visualiza tu 'Factor de Paz' y recibe recomendaciones accionables de nuestro Asesor Zen en tiempo real.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20"
  },
  {
    icon: CreditCard,
    title: "Ingresos y Gastos",
    description: "Crea registros únicos o recurrentes. Si ya tienes tus cuentas en un banco, usa el botón 'Importar CSV' en la esquina superior derecha.",
    color: "text-orange-400",
    bg: "bg-orange-500/20"
  },
  {
    icon: PlayCircle,
    title: "Simulador de Escenarios",
    description: "¿Quieres comprar un auto o viajar? Usa el simulador para proyectar cómo afectará The tus ahorros antes de gastar.",
    color: "text-blue-400",
    bg: "bg-blue-500/20"
  },
  {
    icon: ShieldCheck,
    title: "Auditoría de Suscripciones",
    description: "Identificamos pagos silenciosos recurrentes para que puedas cancelar lo que no usas y retomes el control.",
    color: "text-purple-400",
    bg: "bg-purple-500/20"
  }
];

export const WalkthroughModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('zenfinance_tour_seen');
    if (!hasSeenTour) {
      // Small delay to let the app load first
      const t = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < TOUR_SLIDES.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem('zenfinance_tour_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const slide = TOUR_SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={handleClose} />
      
      <motion.div 
        key="tour-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="glass-card w-full max-w-lg overflow-hidden relative bg-white/10 border-white/20 shadow-2xl"
      >
        <button 
           onClick={handleClose}
           className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-10"
        >
           <X size={20} />
        </button>

        <div className="p-8 md:p-12 flex flex-col items-center text-center">
           
           <AnimatePresence mode="wait">
             <motion.div
               key={currentSlide}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
               className="flex flex-col items-center"
             >
                <div className={`w-24 h-24 rounded-3xl ${slide.bg} flex items-center justify-center mb-6 shadow-inner`}>
                   <Icon size={48} className={slide.color} />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                   {slide.title}
                </h2>
                
                <p className="text-slate-300 text-lg leading-relaxed">
                   {slide.description}
                </p>
             </motion.div>
           </AnimatePresence>

           <div className="mt-12 w-full flex flex-col items-center gap-6">
              <div className="flex gap-2">
                 {TOUR_SLIDES.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`} 
                    />
                 ))}
              </div>

              <button 
                 onClick={handleNext}
                 className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                 {currentSlide === TOUR_SLIDES.length - 1 ? '¡Comenzar mi viaje!' : 'Siguiente'}
                 {currentSlide < TOUR_SLIDES.length - 1 && <ChevronRight size={20} />}
              </button>
           </div>

        </div>
      </motion.div>
    </div>
  );
};

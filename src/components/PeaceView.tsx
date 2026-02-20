import React from 'react';
import { ShieldCheck, Heart, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const PeaceView: React.FC = () => {
 // Mock Data for visualization if real data is sparse
 const peaceFactor = 85; 
 const daysOfFreedom = 45;

 return (
   <div className="space-y-8 animate-in fade-in zoom-in duration-500">
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Peace Card */}
        <div className="glass-card p-10 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-teal-500/30 relative overflow-hidden flex flex-col items-center justify-center text-center">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
           <div className="relative z-10 mb-6">
              <div className="w-24 h-24 rounded-full bg-teal-500/20 flex items-center justify-center mb-4 mx-auto shadow-[0_0_30px_rgba(45,212,191,0.3)] animate-pulse">
                 <ShieldCheck size={48} className="text-teal-400" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2">Tu Nivel de Paz</h2>
              <p className="text-teal-200 text-lg">Estás en el camino correcto.</p>
           </div>
           
           <div className="relative z-10 w-full max-w-md">
              <div className="flex justify-between items-end mb-2">
                 <span className="font-bold text-teal-200">Índice Zen</span>
                 <span className="text-3xl font-black text-white">{peaceFactor}/100</span>
              </div>
              <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${peaceFactor}%` }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                 />
              </div>
           </div>
        </div>

        {/* Motivational / Stats Config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="glass-card p-6 flex flex-col justify-between hover:bg-slate-800/80 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                 <Heart size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm font-medium">Días de Libertad</p>
                 <h4 className="text-3xl font-bold text-white mb-1">{daysOfFreedom}</h4>
                 <p className="text-xs text-rose-400 font-medium">Cobertura de gastos fijos</p>
              </div>
           </div>

           <div className="glass-card p-6 flex flex-col justify-between hover:bg-slate-800/80 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                 <Zap size={24} />
              </div>
              <div>
                 <p className="text-slate-400 text-sm font-medium">Racha de Ahorro</p>
                 <h4 className="text-3xl font-bold text-white mb-1">3 Meses</h4>
                 <p className="text-xs text-amber-400 font-medium">¡Sigue así!</p>
              </div>
           </div>

           <div className="glass-card p-6 sm:col-span-2 bg-indigo-600/10 border-indigo-500/20">
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <Award size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-white text-lg">Próximo Hito: Fondo de Emergencia</h4>
                    <p className="text-slate-400 text-sm mt-1">
                       Estás al 65% de completar tu fondo de emergencia de 3 meses. Una vez completado, desbloquearás el nivel "Guerrero Zen".
                    </p>
                 </div>
              </div>
           </div>
        </div>
     </div>
   </div>
 );
};

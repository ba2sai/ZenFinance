import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import SavingsGoalForm from './SavingsGoalForm';
import { 
  Sparkles, Plus, X, Target, 
  PiggyBank, Car, Home, Plane, 
  GraduationCap, Heart, Laptop, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GOAL_ICONS: Record<string, any> = {
  piggy: PiggyBank,
  target: Target,
  car: Car,
  home: Home,
  travel: Plane,
  education: GraduationCap,
  health: Heart,
  tech: Laptop
};

export const SavingsView: React.FC = () => {
  const savingsGoals = useFinanceStore(state => state.savingsGoals) || [];
  const removeSavingGoal = useFinanceStore(state => state.removeSavingGoal);
  const updateSavingGoal = useFinanceStore(state => state.updateSavingGoal);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const totalSaved = savingsGoals.reduce((acc: number, curr: any) => acc + (curr.current || 0), 0);
  const totalTarget = savingsGoals.reduce((acc: number, curr: any) => acc + (curr.target || 0), 0);
  const totalProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleContribute = async (goalId: string) => {
    // Basic prompt for now, could be a modal
    const amountStr = prompt("Monto a abonar a esta meta:");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        await updateSavingGoal(goalId, { current: goal.current + amount });
      }
    } catch (error) {
      console.error("Error contributing:", error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta meta?")) return;
    try {
      await removeSavingGoal(goalId);
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <Target className="text-indigo-400" />
             Metas de Ahorro
           </h2>
           <p className="text-slate-400">Visualiza y alcanza tus sueños financieros.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Meta
        </button>
      </div>

      {/* Overview Card */}
      <div className="glass-card p-8 bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border-indigo-500/30 text-white relative overflow-hidden shadow-[0_0_30px_rgba(99,102,241,0.2)]">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div>
               <p className="text-indigo-200 text-sm font-medium mb-1 uppercase tracking-wider">Ahorro Total</p>
               <p className="text-5xl font-black tracking-tight text-white shadow-indigo-500/50 drop-shadow-sm">${totalSaved.toLocaleString()}</p>
            </div>
            
            <div className="md:col-span-2 space-y-3">
               <div className="flex justify-between items-end">
                  <span className="text-indigo-200 font-medium">Progreso Global</span>
                  <span className="text-2xl font-bold text-white">{Math.round(totalProgress)}%</span>
               </div>
               <div className="w-full bg-slate-900/50 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 shadow-[0_0_15px_rgba(129,140,248,0.5)]"
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
             {isFormOpen ? (
               <motion.div
                 key="form"
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="glass-card p-6 relative"
               >
                 <button 
                   onClick={() => setIsFormOpen(false)}
                   className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                 >
                   <X size={20} />
                 </button>
                 <h3 className="text-lg font-bold text-white mb-4">Nueva Meta de Ahorro</h3>
                 <SavingsGoalForm onCancel={() => setIsFormOpen(false)} />
               </motion.div>
             ) : (
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Sparkles className="text-amber-400" size={18} />
                     Mis Objetivos
                   </h3>
                   
                   {/* Inlined List */}
                   <div className="space-y-4">
                     {savingsGoals.length === 0 ? (
                        <div className="glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-slate-700/50 text-slate-500">
                           <p className="font-medium">No tienes metas activas.</p>
                           <p className="text-sm">Empieza hoy mismo.</p>
                        </div>
                     ) : (
                        savingsGoals.map((goal) => {
                           const current = goal.current || 0;
                           const target = goal.target || 0;
                           const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
                           const Icon = GOAL_ICONS[goal.icon || 'piggy'] || PiggyBank;
                           const isCompleted = target > 0 && progress >= 100;

                           return (
                             <motion.div
                               key={goal.id}
                               layout
                               className={`glass-card p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 border border-white/5 ${
                                 isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : ''
                               }`}
                             >
                               <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-3">
                                     <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                        <Icon size={24} />
                                     </div>
                                     <div>
                                        <h4 className="font-bold text-white leading-tight">{goal.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                                           Meta: ${target.toLocaleString()}
                                        </p>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => handleDelete(goal.id)}
                                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                               </div>

                               <div className="space-y-2">
                                  <div className="flex justify-between text-sm font-bold">
                                     <span className={isCompleted ? 'text-emerald-400' : 'text-slate-300'}>
                                        ${current.toLocaleString()}
                                     </span>
                                     <span className={isCompleted ? 'text-emerald-400' : 'text-slate-500'}>
                                        {Math.round(progress)}%
                                     </span>
                                  </div>
                                  
                                  <div className="w-full bg-slate-900/50 h-2.5 rounded-full overflow-hidden border border-white/5">
                                     <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${progress}%` }}
                                       className={`h-full rounded-full transition-all duration-1000 ${
                                          isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                       }`}
                                     />
                                  </div>
                               </div>

                               {!isCompleted && (
                                 <button 
                                   onClick={() => handleContribute(goal.id)}
                                   className="mt-4 w-full py-2 flex items-center justify-center gap-1 text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors border border-indigo-500/20"
                                 >
                                   <Plus size={14} /> Abonar
                                 </button>
                               )}
                             </motion.div>
                           );
                        })
                     )}
                   </div>

                </div>
             )}
           </AnimatePresence>
        </div>

        {/* Sidebar / Tips */}
        <div className="space-y-6">
           <div className="glass-card p-6 bg-amber-500/10 border-amber-500/20">
              <h4 className="font-bold text-amber-200 mb-2 flex items-center gap-2">
                <Sparkles className="text-amber-400" size={16} />
                Consejo Zen
              </h4>
              <p className="text-sm text-amber-100/80 leading-relaxed">
                Prioriza tu fondo de emergencia. Intenta tener al menos 3 meses de gastos cubiertos antes de invertir agresivamente.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

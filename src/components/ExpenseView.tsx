import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { ExpenseForm } from './ExpenseForm';
import { CreditCard, Plus, X, Trash2, Calendar, Repeat, ShoppingCart, Car, Home, Film, HeartPulse, GraduationCap, Smartphone, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Category Helper
const CATEGORY_CONFIG: Record<string, { label: string, color: string, icon: React.ElementType }> = {
  'Food': { label: 'Alimentación', color: 'bg-rose-500', icon: ShoppingCart },
  'Transport': { label: 'Transporte', color: 'bg-orange-500', icon: Car },
  'Housing': { label: 'Vivienda', color: 'bg-indigo-500', icon: Home },
  'Entertainment': { label: 'Entretenimiento', color: 'bg-purple-500', icon: Film },
  'Health': { label: 'Salud', color: 'bg-emerald-500', icon: HeartPulse },
  'Education': { label: 'Educación', color: 'bg-blue-500', icon: GraduationCap },
  'Software': { label: 'Software/Apps', color: 'bg-cyan-500', icon: Smartphone },
  'Other': { label: 'Otro', color: 'bg-slate-500', icon: HelpCircle },
};

export const ExpenseView: React.FC = () => {
  const expenses = useFinanceStore(state => state.expenses) || [];
  const removeExpense = useFinanceStore(state => state.removeExpense);
  const isHistoryLoaded = useFinanceStore(state => state.isHistoryLoaded);
  const subscribeToFinancials = useFinanceStore(state => state.subscribeToFinancials);
  const { orgId } = useAuthStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Chart Logic
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(categoryTotals).reduce((a,b) => a+b, 0);
  
  const chartData = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      cat,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      ...CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Other']
    }))
    .sort((a,b) => b.amount - a.amount);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             <CreditCard className="text-indigo-400" />
             Gestión de Gastos
           </h2>
           <p className="text-slate-400">Registra y analiza tus salidas de dinero.</p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Registrar Nuevo Gasto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form (if open) or List */}
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
                   className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                 >
                   <X size={20} />
                 </button>
                 <h3 className="text-lg font-bold text-white mb-4">Nuevo Gasto</h3>
                 <ExpenseForm onCancel={() => setIsFormOpen(false)} />
               </motion.div>
             ) : (
                <div className="space-y-4">
                   {expenses.length === 0 ? (
                      <div className="glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-slate-700/50 text-slate-500">
                         <CreditCard size={48} className="mb-4 opacity-20" />
                         <p className="font-medium">No hay gastos registrados.</p>
                         <button onClick={() => setIsFormOpen(true)} className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                            Crear el primero
                         </button>
                      </div>
                   ) : (
                      expenses.map((expense) => {
                         const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG['Other'];
                         const Icon = config.icon;
                         
                         return (
                           <motion.div
                             key={expense.id}
                             layout
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className="glass-card p-4 flex items-center justify-between group hover:bg-slate-800/80 transition-all border-l-4"
                             style={{ borderLeftColor: config.color.replace('bg-', 'text-') /* simple hack or use explicit mapping implies keeping tailwind classes safe */}}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900 shadow-inner ${config.color} bg-opacity-20 text-white`}>
                                    <Icon size={20} />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-200">{expense.description}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                       <span className="text-indigo-400">{config.label}</span>
                                       <span>•</span>
                                       {expense.frequency === 'one-time' ? (
                                          <span className="flex items-center gap-1">
                                             <Calendar size={12} />
                                             {new Date(expense.date || '').toLocaleDateString()}
                                          </span>
                                       ) : (
                                          <span className="flex items-center gap-1 text-amber-500">
                                             <Repeat size={12} />
                                             {expense.frequency}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                 <span className="text-lg font-bold text-white">
                                    -${expense.amount.toLocaleString()}
                                 </span>
                                 <button 
                                   onClick={() => {
                                      if(window.confirm('¿Eliminar gasto?')) removeExpense(expense.id);
                                   }}
                                   className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           </motion.div>
                         );
                      })
                   )}
                 </div>
              )}
            </AnimatePresence>

            {!isHistoryLoaded && orgId && expenses.length > 0 && !isFormOpen && (
               <div className="flex justify-center mt-6">
                  <button 
                    onClick={() => subscribeToFinancials(orgId, { loadAllHistory: true })}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full font-medium text-sm transition-colors"
                  >
                    Cargar historial completo
                  </button>
               </div>
            )}
         </div>

        {/* Right Column: Chart */}
        <div className="space-y-6">
           <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-6">Distribución</h3>
              <div className="relative w-48 h-48 mx-auto mb-6">
                 {/* Simple Donut logic with conic-gradient or SVG */}
                 {totalExpenses > 0 ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                       {(() => {
                          let cumulativePercent = 0;
                          return chartData.map((slice) => { // Removed 'i'
                             const start = cumulativePercent;
                             cumulativePercent += slice.percentage;
                             const r = 40;
                             const c = 2 * Math.PI * r;
                             const dash = (slice.percentage / 100) * c;
                             // const offset = c - dash; // Removed unused 'offset'
                             const dashOffset = - (start / 100) * c;
                             
                             return (
                                <circle 
                                  key={slice.cat}
                                  cx="50" cy="50" r={r}
                                  fill="transparent"
                                  stroke="currentColor" 
                                  strokeWidth="12"
                                  strokeDasharray={`${dash} ${c}`}
                                  strokeDashoffset={dashOffset}
                                  className={`${slice.color.replace('bg-', 'text-')} transition-all duration-500`}
                                />
                             );
                          });
                       })()}
                    </svg>
                 ) : (
                    <div className="w-full h-full rounded-full border-4 border-slate-800 border-dashed flex items-center justify-center text-slate-600 text-xs text-center p-4">
                       Sin datos
                    </div>
                 )}
                 {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">${totalExpenses.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total</span>
                 </div>
              </div>

              <div className="space-y-3">
                 {chartData.map((item) => (
                    <div key={item.cat} className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-slate-300">{item.label}</span>
                       </div>
                       <span className="font-bold text-slate-500">{Math.round(item.percentage)}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

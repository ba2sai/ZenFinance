import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
// import { useAuthStore } from '../store/useAuthStore'; // Removed unused
import { IncomeForm } from './IncomeForm';
import type { Income } from '../store/useFinanceStore';

export const IncomeView: React.FC = () => {
  const incomes = useFinanceStore(state => state.incomes) || [];
  const removeIncome = useFinanceStore(state => state.removeIncome);
  // const { orgId } = useAuthStore(); // Removed unused
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>(undefined);

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const calculateMonthly = (income: Income) => {
    if (income.frequency === 'monthly') return income.amount;
    if (income.frequency === 'biweekly') return income.amount * 2;
    return 0; // One-time not counted in monthly recurring
  };

  const totalMonthly = incomes.reduce((acc, curr) => acc + calculateMonthly(curr), 0);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 flex items-center gap-6">
           <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <TrendingUp size={32} />
           </div>
           <div>
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-1">Ingreso Mensual Recurrente</h3>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-white tracking-tighter shadow-emerald-500/50 drop-shadow-sm">
                   ${totalMonthly.toLocaleString()}
                 </span>
                 <span className="text-emerald-500 font-bold">+0% vs mes anterior</span>
              </div>
           </div>
        </div>

        <button 
          onClick={() => { setEditingIncome(undefined); setIsFormOpen(true); }}
          className="relative z-10 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Ingreso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {incomes.map(income => (
          <div 
            key={income.id} 
            className="glass-card p-6 relative group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${income.category === 'Salary' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-teal-500/20 text-teal-400'}`}>
                     <DollarSign size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-lg text-slate-200 group-hover:text-white transition-colors">
                       {income.source}
                     </h4>
                     <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {income.category}
                     </span>
                  </div>
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(income)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                     <Calendar size={16} />
                  </button>
                  <button onClick={() => removeIncome(income.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                     <Trash2 size={16} />
                  </button>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <span className="text-slate-500 text-sm font-medium">Monto</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    ${income.amount.toLocaleString()}
                  </span>
               </div>
               <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Frecuencia</span>
                  <span className="text-indigo-400 font-bold capitalize">{income.frequency}</span>
               </div>
               {income.frequency === 'one-time' && income.date && (
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Fecha</span>
                    <span className="text-slate-300">
                      {new Date(income.date).toLocaleDateString()}
                    </span>
                 </div>
               )}
            </div>
          </div>
        ))}

        {incomes.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
              <p className="text-slate-500 font-medium">No has registrado ingresos aún.</p>
           </div>
        )}
      </div>

      {isFormOpen && (
        <IncomeForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          existingIncome={editingIncome}
        />
      )}
    </div>
  );
};

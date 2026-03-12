import React, { useState } from 'react';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight, Target } from 'lucide-react';

import { useFinanceStore } from '../store/useFinanceStore';
import { ZenAdvisor } from './ZenAdvisor';
import { MetricTooltip } from './MetricTooltip';



// --- Rounded Stats Card ---
const RoundedStatCard = ({
   label,
   value,
   colorClass,
   icon,
   trend
}: {
   label: string,
   value: string | number,
   colorClass: string,
   icon?: React.ReactNode,
   trend?: string
}) => {
   return (
      <div className="glass-card p-6 flex flex-col justify-between rounded-3xl relative overflow-hidden group hover:bg-slate-800/80 transition-colors h-full">
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-opacity-20 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
               {icon}
            </div>
            {trend && (
               <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                  {trend}
               </span>
            )}
         </div>

         <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
            <p className="text-2xl font-black text-white tracking-tight">{value}</p>
         </div>
      </div>
   );
};

export const Dashboard: React.FC = () => {
   const finance = useFinanceStore();


   // State for Month Filter
   const [selectedDate, setSelectedDate] = useState(new Date());

   const handlePrevMonth = () => {
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
   };

   const handleNextMonth = () => {
      setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
   };

   const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();

   // Filter Data
   const filterMonth = selectedDate.getMonth();
   const filterYear = selectedDate.getFullYear();

   const monthlyExpenses = finance.expenses.filter(e => {
      if (e.frequency === 'one-time') {
         const d = new Date(e.date || '');
         return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
      }
      return true; // Recurring expenses count every month (simplified)
   });

   const monthlyIncomes = finance.incomes.filter(i => {
      if (i.frequency === 'one-time') {
         const d = new Date(i.date || '');
         return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
      }
      return true;
   });

   const totalMonthlyIncome = monthlyIncomes.reduce((acc, curr) => {
      let amount = curr.amount;
      if (curr.frequency === 'biweekly') amount *= 2;
      return acc + amount;
   }, 0);

   const totalMonthlyExpenses = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
   const freeBudget = totalMonthlyIncome - totalMonthlyExpenses;
   const peaceFactor = totalMonthlyIncome > 0 ? Math.max(0, Math.min(100, Math.round((freeBudget / totalMonthlyIncome) * 100))) : 0;

   const savingsRate = totalMonthlyIncome > 0 ? Math.round((finance.savingsGoals.reduce((acc, curr) => acc + curr.current, 0) / totalMonthlyIncome) * 100) : 0;
   const hasEmergencyFund = finance.savingsGoals.some(g => g.name.toLowerCase().includes('emergencia') && g.current >= g.target);

   const annualPlan = finance.savingsGoals.find(g => g.name === 'Plan de Ahorro Anual');

   return (
      <div className="space-y-8 animate-in fade-in zoom-in duration-500 pb-10">

         {/* Header */}
         <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button onClick={handlePrevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                     <ChevronLeft size={20} />
                  </button>
                  <span className="px-4 text-sm font-bold text-white min-w-[120px] text-center capitalize">
                     {isCurrentMonth ? 'Mes Actual' : selectedDate.toLocaleDateString('es-ES', { month: 'long' })}
                  </span>
                  <button onClick={handleNextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                     <ChevronRight size={20} />
                  </button>
               </div>
            </div>
         </div>

         {/* Top Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* 1. Ingresos */}
            <RoundedStatCard
               label="Ingresos (Mes)"
               value={`$${totalMonthlyIncome.toLocaleString()}`}
               colorClass="text-emerald-400"
               icon={<TrendingUp size={24} />}
               trend="+12.5%"
            />

            {/* 2. Presupuesto Libre */}
            <RoundedStatCard
               label="Presupuesto Libre"
               value={`$${freeBudget.toLocaleString()}`}
               colorClass="text-indigo-400"
               icon={<Target size={24} />}
               trend="+5.2%"
            />

            {/* 3. Factor de Paz (Donut) */}
            <div className="glass-card p-6 flex items-center justify-between rounded-3xl relative overflow-hidden group hover:bg-slate-800/80 transition-colors">
               <div>
                  <p className="text-slate-400 text-sm font-medium mb-1 flex items-center">
                     Factor de Paz
                     <MetricTooltip
                        title="Factor de Paz"
                        description="Qué porcentaje de tus ingresos de este mes quedó libre después de cubrir todos tus gastos. A mayor porcentaje, más margen financiero tienes."
                        formula="(Ingresos - Gastos del mes) ÷ Ingresos × 100"
                        example="Ej: si ganas $2,000 y gastas $780, tu Factor de Paz es 61%."
                     />
                  </p>
                  <p className="text-4xl font-black text-white">{peaceFactor}%</p>
                  <p className="text-emerald-400 text-xs font-bold mt-2">Flujo libre este mes</p>
               </div>
               <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                     <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                     <circle
                        cx="50" cy="50" r="40"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - peaceFactor / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                     />
                     <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#2dd4bf" />
                           <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                     </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
                  </div>
               </div>
            </div>

            {/* 4. Zen Advisor (Compact) */}
            <ZenAdvisor
               peaceFactor={peaceFactor}
               savingsRate={savingsRate}
               hasEmergencyFund={hasEmergencyFund}
               compact={true}
            />
         </div>

         {/* Annual Savings Plan Widget */}
         {annualPlan && (
            <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none" />
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <span>🎯</span> Plan de Ahorro Anual
                        </h3>
                        <p className="text-slate-400 text-sm font-medium">Mantén la consistencia y logra tus metas a largo plazo.</p>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-black text-emerald-400 tracking-tight">${annualPlan.current.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">de ${annualPlan.target.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="relative pt-1">
                     <div className="flex mb-2 items-center justify-between">
                        <div>
                           <span className="text-xs font-semibold inline-block text-emerald-400">
                              {Math.round((annualPlan.current / annualPlan.target) * 100)}% Completado
                           </span>
                        </div>
                     </div>
                     <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-800">
                        <div
                           style={{ width: `${Math.min(100, (annualPlan.current / annualPlan.target) * 100)}%` }}
                           className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-linear-to-r from-emerald-500 to-teal-500"
                        />
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Middle Section: Payments & Goals */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Próximos Pagos (Left - 2/3) */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Calendar className="text-indigo-400" size={20} />
                     Próximos Pagos
                  </h3>
                  <button className="text-indigo-400 text-sm font-bold hover:text-white transition-colors">
                     Ver calendario
                  </button>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr>
                           <th className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-4">Concepto</th>
                           <th className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-4">Fecha</th>
                           <th className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-4 text-right">Monto</th>
                           <th className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-4 text-right">Estado</th>
                        </tr>
                     </thead>
                     <tbody className="space-y-4">
                        {(() => {
                           const today = new Date();
                           const currentDay = today.getDate();
                           const upcoming = finance.expenses
                              .filter(e => e.frequency !== 'one-time')
                              .map(e => {
                                 const day = e.recurrenceDays?.[0] || 1;
                                 let date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                                 if (day < currentDay && isCurrentMonth) {
                                    date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, day);
                                 }
                                 return { ...e, nextDate: date };
                              })
                              .sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
                              .slice(0, 5);

                           if (upcoming.length === 0) {
                              return (
                                 <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-500">No hay pagos próximos este mes.</td>
                                 </tr>
                              );
                           }

                           return upcoming.map((exp, i) => (
                              <tr key={exp.id} className="group hover:bg-slate-800/30 transition-colors border-b border-white/5 last:border-0">
                                 <td className="py-4 pr-4">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                          {exp.description.charAt(0).toUpperCase()}
                                       </div>
                                       <div>
                                          <p className="font-bold text-white">{exp.description}</p>
                                          <p className="text-xs text-slate-500">{exp.category}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-4 text-slate-300 font-medium">
                                    {exp.nextDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                 </td>
                                 <td className="py-4 text-right font-bold text-white">
                                    ${exp.amount.toLocaleString()}
                                 </td>
                                 <td className="py-4 text-right">
                                    <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full">
                                       PENDIENTE
                                    </span>
                                 </td>
                              </tr>
                           ));
                        })()}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Metas de Ahorro (Right - 1/3) */}
            <div className="glass-card p-6 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Target className="text-indigo-400" size={20} />
                  Metas de Ahorro
               </h3>

               <div className="space-y-6">
                  {finance.savingsGoals.slice(0, 3).map(goal => {
                     const current = goal.current || 0;
                     const target = goal.target || 0;
                     const progress = target > 0 ? (current / target) * 100 : 0;
                     return (
                        <div key={goal.id}>
                           <div className="flex justify-between items-end mb-2">
                              <p className="font-bold text-white text-sm">{goal.name}</p>
                              <p className="text-xs text-slate-400 font-medium">
                                 ${current.toLocaleString()} / <span className="text-slate-600">${target.toLocaleString()}</span>
                              </p>
                           </div>
                           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-indigo-500 rounded-full"
                                 style={{ width: `${Math.min(100, progress)}%` }}
                              />
                           </div>
                        </div>
                     );
                  })}

                  {finance.savingsGoals.length === 0 && (
                     <p className="text-slate-500 text-sm text-center">No hay metas definidas.</p>
                  )}

                  <button className="w-full py-3 border border-dashed border-slate-700 rounded-xl text-slate-400 text-sm font-bold hover:bg-slate-800 hover:text-white transition-colors">
                     + Nueva Meta
                  </button>
               </div>
            </div>
         </div>

         {/* Bottom: Peace Banner (Optional/As per image "Manten la calma") */}
         <div className="glass-card p-0 rounded-3xl overflow-hidden relative min-h-[200px] flex items-end">
            <img
               src="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?q=80&w=2664&auto=format&fit=crop"
               alt="Calm"
               className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

            <div className="relative z-10 p-8">
               <h3 className="text-2xl font-bold text-white mb-1">Manten la calma</h3>
               <p className="text-slate-300 max-w-md">Tu salud financiera es una prioridad, vas por buen camino.</p>
            </div>
         </div>

      </div>
   );
};


import React from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Wallet, CheckCircle, XCircle, Search } from 'lucide-react';

export const SubscriptionAudit: React.FC = () => {
  const { expenses, loading } = useFinanceStore();
  const updateExpense = useFinanceStore(state => state.updateExpense);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Logic to detect potential subscriptions
  const subs = expenses.filter(e => 
    (e.frequency === 'monthly' || 
    e.category === 'Entertainment' || 
    e.category === 'Software' ||
    e.description.toLowerCase().includes('netflix') ||
    e.description.toLowerCase().includes('spotify') ||
    e.description.toLowerCase().includes('adobe')) &&
    e.subscriptionStatus !== 'cancelled' // Don't show cancelled subs in the main list
  );

  const pendingSubs = subs.filter(s => s.subscriptionStatus !== 'verified');
  const verifiedSubs = subs.filter(s => s.subscriptionStatus === 'verified');

  const totalSubs = subs.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 relative overflow-hidden border-violet-500/30">
        <div className="absolute inset-0 bg-violet-500/10 blur-3xl opacity-50" />
        
        <div className="relative z-10">
           <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
             <Wallet className="text-violet-300" />
             Auditoría de Suscripciones
           </h2>
           <p className="text-violet-200">
             {pendingSubs.length} por revisar • {verifiedSubs.length} aprobadas
           </p>
        </div>

        <div className="relative z-10 text-right">
           <p className="text-violet-200 text-sm font-medium uppercase tracking-wider">Gasto Mensual Total</p>
           <p className="text-5xl font-black text-white tracking-tight drop-shadow-lg">
             ${totalSubs.toLocaleString()}
           </p>
        </div>
      </div>

      {/* Pending Subscriptions */}
      {pendingSubs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="text-amber-400" size={20} />
            Detectadas (Pendientes de Revisión)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSubs.map(sub => (
              <div key={sub.id} className="glass-card p-6 relative group hover:bg-slate-800 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-lg">
                          {sub.description.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <h4 className="font-bold text-white">{sub.description}</h4>
                          <p className="text-xs text-slate-400">{sub.category}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xl text-white">${sub.amount}</span>
                </div>
                
                <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => updateExpense(sub.id, { subscriptionStatus: 'verified' })}
                      className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                      <CheckCircle size={16} />
                      Es útil
                    </button>
                    <button 
                      onClick={() => {
                        const emailBody = `Hola,\n\nQuiero cancelar mi suscripción a ${sub.description}.\n\nGracias.`;
                        navigator.clipboard.writeText(emailBody);
                        alert("Copiado al portapapeles: \n" + emailBody);
                        updateExpense(sub.id, { subscriptionStatus: 'cancelled' });
                      }}
                      className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                      <XCircle size={16} />
                      Cancelar
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Subscriptions */}
      {verifiedSubs.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={20} />
            Aprobadas y Verificadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedSubs.map(sub => (
              <div key={sub.id} className="glass-card p-6 relative bg-emerald-900/10 border-emerald-500/20 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          {sub.description.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <h4 className="font-bold text-emerald-100">{sub.description}</h4>
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Verificada</span>
                      </div>
                    </div>
                    <span className="font-bold text-lg text-emerald-100">${sub.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subs.length === 0 && (
        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/20">
            <p className="text-slate-400 font-medium">No detectamos suscripciones activas. ¡Buen trabajo!</p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { PlusCircle, Trash2, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

interface SimulatedItem {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense' | 'recurring';
  active: boolean;
  isMock: boolean; // True if added during simulation
}

export const ScenarioSimulator: React.FC = () => {
  const { incomes, expenses, recurringExpenses } = useFinanceStore();

  // Initialize simulation state from real data
  const [items, setItems] = useState<SimulatedItem[]>(() => {
    const defaultItems: SimulatedItem[] = [
      ...incomes.map(i => ({ id: `inc_${i.id}`, name: i.source, amount: i.amount, type: 'income' as const, active: true, isMock: false })),
      ...expenses.map(e => ({ id: `exp_${e.id}`, name: e.description, amount: e.amount, type: 'expense' as const, active: true, isMock: false })),
      ...recurringExpenses.map(r => ({ id: `rec_${r.id}`, name: r.name, amount: r.amount, type: 'recurring' as const, active: true, isMock: false }))
    ];
    return defaultItems;
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState<'income' | 'expense'>('expense');

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const removeMockItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddMockItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newItemName || !newItemAmount) return;

      const newItem: SimulatedItem = {
          id: `mock_${Date.now()}`,
          name: newItemName,
          amount: parseFloat(newItemAmount),
          type: newItemType,
          active: true,
          isMock: true
      };

      setItems(prev => [newItem, ...prev]);
      setNewItemName('');
      setNewItemAmount('');
  };

  const resetSimulation = () => {
      setItems([
          ...incomes.map(i => ({ id: `inc_${i.id}`, name: i.source, amount: i.amount, type: 'income' as const, active: true, isMock: false })),
          ...expenses.map(e => ({ id: `exp_${e.id}`, name: e.description, amount: e.amount, type: 'expense' as const, active: true, isMock: false })),
          ...recurringExpenses.map(r => ({ id: `rec_${r.id}`, name: r.name, amount: r.amount, type: 'recurring' as const, active: true, isMock: false }))
      ]);
  };

  // Calculations
  const calcMetrics = (currentItems: SimulatedItem[]) => {
      const activeItems = currentItems.filter(i => i.active);
      const totalIncome = activeItems.filter(i => i.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpense = activeItems.filter(i => i.type !== 'income').reduce((acc, curr) => acc + curr.amount, 0);
      const freeBudget = totalIncome - totalExpense;
      const peaceFactor = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((freeBudget / totalIncome) * 100))) : 0;
      
      return { totalIncome, totalExpense, freeBudget, peaceFactor };
  };

  const realMetrics = useMemo(() => calcMetrics(items.filter(i => !i.isMock).map(i => ({...i, active: true}))), [incomes, expenses, recurringExpenses]);
  const simMetrics = calcMetrics(items);

  const peaceFactorDiff = simMetrics.peaceFactor - realMetrics.peaceFactor;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Activity className="text-blue-400" /> Simulador de Escenarios
        </h2>
        <p className="text-slate-400 mt-2">Juega con variables hipotéticas para predecir tu futuro financiero sin afectar tus datos reales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dashboard Comparison */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-slate-800/50 bg-slate-900/40 relative overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Realidad Actual</h3>
                  <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${realMetrics.peaceFactor >= 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {realMetrics.peaceFactor >= 50 ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                      </div>
                      <div>
                          <p className="text-4xl font-black text-white">{realMetrics.peaceFactor}%</p>
                          <p className="text-sm text-slate-400">Factor de Paz</p>
                      </div>
                  </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-blue-500/30 bg-blue-900/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                      Escenario Simulado
                      {peaceFactorDiff !== 0 && (
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${peaceFactorDiff > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {peaceFactorDiff > 0 ? '+' : ''}{peaceFactorDiff}%
                          </span>
                      )}
                  </h3>
                  <div className="flex items-center gap-4 relative z-10">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${simMetrics.peaceFactor >= 50 ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {simMetrics.peaceFactor >= 50 ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                      </div>
                      <div>
                          <p className="text-4xl font-black text-white">{simMetrics.peaceFactor}%</p>
                          <p className="text-sm text-slate-400">Nuevo Factor de Paz</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Items Toggle List */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Tus Variables</h3>
                  <button onClick={resetSimulation} className="text-sm text-slate-400 hover:text-white transition-colors">Reiniciar</button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => (
                      <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${item.active ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-900/30 border-slate-800 opacity-50'} transition-all`}>
                          <div className="flex items-center gap-3">
                              <button 
                                  onClick={() => toggleItem(item.id)}
                                  className={`w-12 h-6 rounded-full p-1 transition-colors ${item.active ? 'bg-blue-500' : 'bg-slate-700'}`}
                              >
                                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                              <div>
                                  <p className={`font-medium ${item.active ? 'text-white' : 'text-slate-500 line-through'}`}>{item.name} {item.isMock && <span className="text-xs text-blue-400 ml-2">(Hipotético)</span>}</p>
                                  <p className="text-xs text-slate-400">{item.type === 'income' ? 'Ingreso' : 'Gasto'} • ${item.amount}</p>
                              </div>
                          </div>
                          {item.isMock && (
                              <button onClick={() => removeMockItem(item.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          {/* Add Mock Form */}
          <div className="lg:col-span-1 glass-card p-6 rounded-3xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4">Añadir Hipótesis</h3>
              <form onSubmit={handleAddMockItem} className="space-y-4">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipo</label>
                      <div className="flex gap-2">
                          <button 
                              type="button"
                              onClick={() => setNewItemType('expense')}
                              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${newItemType === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}
                          >
                              Gasto Nuevo
                          </button>
                          <button 
                              type="button"
                              onClick={() => setNewItemType('income')}
                              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${newItemType === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}
                          >
                              Ingreso Extra
                          </button>
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Descripción</label>
                      <input 
                          type="text" 
                          required
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Ej. Comprar auto"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Monto Mensual</label>
                      <input 
                          type="number" 
                          required
                          step="0.01"
                          value={newItemAmount}
                          onChange={(e) => setNewItemAmount(e.target.value)}
                          placeholder="300.00"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      />
                  </div>
                  <button 
                      type="submit"
                      disabled={!newItemName || !newItemAmount}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                      <PlusCircle size={18} /> Añadir Escenario
                  </button>
              </form>
          </div>
      </div>
    </div>
  );
};

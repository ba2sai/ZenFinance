import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

interface ExpenseFormProps {
  onCancel: () => void;
}

export const EXPENSE_CATEGORIES = {
  'Food': 'Alimentación',
  'Transport': 'Transporte',
  'Housing': 'Vivienda',
  'Entertainment': 'Entretenimiento',
  'Health': 'Salud',
  'Education': 'Educación',
  'Software': 'Software/Apps',
  'Other': 'Otro',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'weekly'>('one-time');
  const [loading, setLoading] = useState(false);
  
  const { orgId } = useAuthStore();
  const addExpense = useFinanceStore(state => state.addExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !orgId) return;

    setLoading(true);
    try {
      await addExpense({
        description,
        amount: parseFloat(amount),
        category,
        frequency,
        organizationId: orgId,
        date: new Date().toISOString()
      });

      setDescription('');
      setAmount('');
      onCancel();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Descripción</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Supermercado, Netflix..."
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Monto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 pl-8 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white [&>option]:bg-slate-900"
              >
                <option value="Food">Alimentación</option>
                <option value="Transport">Transporte</option>
                <option value="Housing">Vivienda</option>
                <option value="Entertainment">Entretenimiento</option>
                <option value="Health">Salud</option>
                <option value="Education">Educación</option>
                <option value="Software">Software/Apps</option>
                <option value="Other">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Frecuencia</label>
              <div className="grid grid-cols-3 gap-2">
                {(['one-time', 'monthly', 'weekly'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`p-2 rounded-lg text-sm font-bold capitalize transition-all ${
                      frequency === f 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {f === 'one-time' ? 'Único' : f === 'weekly' ? 'Semanal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </div>
    </form>
  );
};

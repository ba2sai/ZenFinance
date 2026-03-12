import React, { useState, useEffect } from 'react';
// import { X, DollarSign } from 'lucide-react'; // Removed unused
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import type { Income } from '../store/useFinanceStore';

interface IncomeFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCancel?: () => void; // Keeping for backward compatibility if needed, but primary is onClose
  existingIncome?: Income;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ isOpen, onClose, onCancel, existingIncome }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salario');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'one-time'>('monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([5]); 
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuthStore();
  const userId = user?.uid;
  const addIncome = useFinanceStore(state => state.addIncome);
  const customIncomeCategories = useFinanceStore(state => state.customCategories || []).filter(c => c.type === 'income');
  
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
       setTimeout(() => {
           inputRef.current?.focus();
           inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (existingIncome) {
      setSource(existingIncome.source);
      setAmount(existingIncome.amount.toString());
      setCategory(existingIncome.category || 'Salario');
      setFrequency(existingIncome.frequency);
      setDate(existingIncome.date || new Date().toISOString().split('T')[0]);
      setRecurrenceDays(existingIncome.recurrenceDays || [5]);
    } else {
        // Reset
        setSource('');
        setAmount('');
        setCategory('Salario');
        setFrequency('monthly');
        setRecurrenceDays([5]);
    }
  }, [existingIncome, isOpen]);

  const handleClose = () => {
      if (onClose) onClose();
      if (onCancel) onCancel();
  };

  if (isOpen === false) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !userId) return;

    setLoading(true);
    try {
      let finalRecurrenceDays = [...recurrenceDays].sort((a,b) => a-b);
      // Ensure at least one day is selected if not one-time
      if (frequency !== 'one-time' && finalRecurrenceDays.length === 0) {
        finalRecurrenceDays = frequency === 'biweekly' ? [15, 30] : [5];
      }
      
      const payload: Omit<Income, 'id'> = {
        source,
        amount: parseFloat(amount),
        frequency,
        category,
        recurrenceDays: finalRecurrenceDays,
        userId,
      };

      if (frequency === 'one-time') {
          payload.date = date;
      }

      await addIncome(payload);

      setSource('');
      setAmount('');
      setFrequency('monthly');
      handleClose();
    } catch (error) {
      console.error("Error adding income:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Fuente</label>
              <input
                ref={inputRef}
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ej. Salario, Freelance..."
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white [&>option]:bg-slate-900"
              >
                <option value="Salario">Salario</option>
                <option value="Inversión">Inversión</option>
                <option value="Negocio">Negocio</option>
                <option value="Regalo">Regalo</option>
                {customIncomeCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="Otro">Otro</option>
              </select>
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
          </div>

          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Frecuencia</label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'biweekly', 'one-time'] as const).map((f) => (
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
                    {f === 'one-time' ? 'Único' : f === 'biweekly' ? 'Quincenal' : 'Mensual'}
                  </button>
                ))}
              </div>
            </div>

            {frequency === 'one-time' ? (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                />
              </div>
            ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                     {frequency === 'monthly' ? 'Día del mes' : 'Días de pago'}
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    {frequency === 'monthly' ? 'Selecciona el día de pago' : 'Selecciona los días (ej. 15 y 30)'}
                  </p>
                  
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-white/10">
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const isSelected = recurrenceDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setRecurrenceDays(prev => prev.filter(d => d !== day));
                              } else {
                                setRecurrenceDays(prev => [...prev, day].sort((a,b) => a-b));
                              }
                            }}
                            className={`
                              w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                              ${isSelected 
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400' 
                                : 'text-slate-400 hover:bg-white/10 hover:text-white'}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Ingreso'}
          </button>
        </div>
    </form>
  );
};

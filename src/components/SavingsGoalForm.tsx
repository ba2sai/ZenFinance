import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import { 
  PiggyBank, Target, Car, Home, Plane, 
  GraduationCap, Heart, Laptop, Check, Loader2 
} from 'lucide-react';

const GOAL_ICONS = [
  { id: 'piggy', icon: PiggyBank, label: 'General' },
  { id: 'target', icon: Target, label: 'Meta' },
  { id: 'car', icon: Car, label: 'Vehículo' },
  { id: 'home', icon: Home, label: 'Hogar' },
  { id: 'travel', icon: Plane, label: 'Viaje' },
  { id: 'education', icon: GraduationCap, label: 'Educación' },
  { id: 'health', icon: Heart, label: 'Salud' },
  { id: 'tech', icon: Laptop, label: 'Tecnología' },
];

interface SavingsGoalFormProps {
  onCancel: () => void;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ onCancel }) => {
  const { user } = useAuthStore();
  const userId = user?.uid;
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('piggy');
  const [loading, setLoading] = useState(false);
  
  const addSavingGoal = useFinanceStore(state => state.addSavingGoal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !userId) return;

    setLoading(true);
    try {
      await addSavingGoal({
        name,
        target: parseFloat(target),
        current: 0,
        deadline,
        icon: selectedIcon,
        userId: userId,
      });
      onCancel();
    } catch (error) {
      console.error("Error adding goal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nombre de la Meta</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Viaje a Japón, Fondo de Emergencia"
          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Monto Objetivo ($)</label>
           <input
             type="number"
             value={target}
             onChange={(e) => setTarget(e.target.value)}
             placeholder="5000"
             className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500 font-mono"
             required
             min="1"
           />
        </div>
        <div>
           <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Fecha Límite</label>
           <input
             type="date"
             value={deadline}
             onChange={(e) => setDeadline(e.target.value)}
             className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-500"
           />
        </div>
      </div>

      <div>
         <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Ícono</label>
         <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map((item) => {
               const Icon = item.icon;
               const isSelected = selectedIcon === item.id;
               return (
                 <button
                   key={item.id}
                   type="button"
                   onClick={() => setSelectedIcon(item.id)}
                   className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[70px] ${
                     isSelected 
                       ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                       : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                   }`}
                 >
                   <Icon size={20} />
                   <span className="text-[10px] font-bold">{item.label}</span>
                 </button>
               );
            })}
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
          className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
          Crear Meta
        </button>
      </div>
    </form>
  );
};

export default SavingsGoalForm;

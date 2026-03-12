import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Heart, Zap, Award, Shield, Target, Flame, Check, TrendingUp, Wallet, Lock, Info } from 'lucide-react';
import { MetricTooltip } from './MetricTooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// ─── Budget Level Types ──────────────────────────────────────────────────────

type BudgetLevelId = '50/30/20' | '60/30/10' | '75/15/10';

interface BudgetLevel {
  id: BudgetLevelId;
  name: string;
  tagline: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
  border: string;
  text: string;
  bg: string;
  distribution: { label: string; pct: number; color: string }[];
}

const BUDGET_LEVELS: BudgetLevel[] = [
  {
    id: '50/30/20',
    name: 'Clásico',
    tagline: '50 / 30 / 20',
    desc: 'Balance vida-trabajo. Ideal para finanzas estables.',
    icon: <Shield size={18} />,
    accent: 'text-blue-400',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    distribution: [
      { label: 'Necesidades', pct: 50, color: 'bg-blue-400' },
      { label: 'Deseos', pct: 30, color: 'bg-indigo-400' },
      { label: 'Libertad', pct: 20, color: 'bg-emerald-400' },
    ],
  },
  {
    id: '60/30/10',
    name: 'Realista',
    tagline: '60 / 30 / 10',
    desc: 'Ajustado al costo de vida actual. Para quienes empiezan a organizarse.',
    icon: <Target size={18} />,
    accent: 'text-emerald-400',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    distribution: [
      { label: 'Necesidades', pct: 60, color: 'bg-emerald-400' },
      { label: 'Deseos', pct: 30, color: 'bg-teal-400' },
      { label: 'Ahorro', pct: 10, color: 'bg-yellow-400' },
    ],
  },
  {
    id: '75/15/10',
    name: 'Agresivo',
    tagline: '75 / 15 / 10',
    desc: 'Modo salida de deuda o inversión extrema. Sin excusas.',
    icon: <Flame size={18} />,
    accent: 'text-orange-400',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    distribution: [
      { label: 'Gasto Total', pct: 75, color: 'bg-orange-400' },
      { label: 'Inversión', pct: 15, color: 'bg-purple-400' },
      { label: 'Protección', pct: 10, color: 'bg-rose-400' },
    ],
  },
];

// ─── Real-time metrics helpers ────────────────────────────────────────────────

function getMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly': return amount;
    case 'biweekly': return amount * 2;
    case 'weekly': return amount * 4;
    case 'yearly': return amount / 12;
    case 'one-time': return 0; // doesn't count towards monthly recurring
    default: return amount;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PeaceView: React.FC = () => {
  const { incomes, expenses, savingsGoals } = useFinanceStore();
  const { user } = useAuthStore();

  const [budgetLevel, setBudgetLevel] = useState<BudgetLevelId>('50/30/20');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load persisted budget level from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      const data = snap.data();
      if (data?.budgetLevel) setBudgetLevel(data.budgetLevel as BudgetLevelId);
    });
  }, [user?.uid]);

  const handleSelectLevel = async (id: BudgetLevelId) => {
    if (id === budgetLevel) return;
    setBudgetLevel(id);
    if (!user?.uid) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { budgetLevel: id });
    } catch (e) {
      console.error('Error saving budget level:', e);
    } finally {
      setSaving(false);
    }
  };

  // ── Real-time metrics ──────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly income (recurring)
    const monthlyIncome = incomes.reduce((acc, inc) => acc + getMonthlyAmount(inc.amount, inc.frequency), 0);

    // Expenses this month
    const thisMonthExpenses = expenses.filter((e) => {
      const d = e.date ? new Date(e.date) : null;
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlySpend = thisMonthExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // Monthly fixed/recurring expenses (for "días de libertad")
    const monthlyFixed = expenses
      .filter((e) => e.frequency && e.frequency !== 'one-time')
      .reduce((acc, e) => acc + getMonthlyAmount(e.amount, e.frequency!), 0);

    // Total savings (sum of current across all goals)
    const totalSaved = savingsGoals.reduce((acc, g) => acc + (g.current || 0), 0);

    // Días de libertad = totalSaved / (monthlyFixed per day)
    const dailyFixed = monthlyFixed / 30;
    const daysOfFreedom = dailyFixed > 0 ? Math.round(totalSaved / dailyFixed) : 0;

    // Índice Zen (0-100)
    // Factors: savings ratio, spend vs income balance, goals progress
    const savingsRatio = monthlyIncome > 0 ? Math.min(1, totalSaved / (monthlyIncome * 3)) : 0; // 3 months = ideal
    const spendRatio = monthlyIncome > 0 ? Math.max(0, 1 - monthlySpend / monthlyIncome) : 0;
    const goalsTotal = savingsGoals.reduce((a, g) => a + (g.target || 0), 0);
    const goalsCurrent = savingsGoals.reduce((a, g) => a + (g.current || 0), 0);
    const goalsRatio = goalsTotal > 0 ? goalsCurrent / goalsTotal : 0;
    const zenIndex = Math.min(100, Math.round(savingsRatio * 40 + spendRatio * 40 + goalsRatio * 20));

    // Racha: count months where income > expense (last 6 months)
    let streak = 0;
    for (let i = 0; i < 6; i++) {
      const m = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
      const y = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const mIncome = incomes
        .filter((inc) => {
          const d = inc.date ? new Date(inc.date) : null;
          return d && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((a, inc) => a + inc.amount, 0);
      const mExpense = expenses
        .filter((e) => {
          const d = e.date ? new Date(e.date) : null;
          return d && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((a, e) => a + e.amount, 0);
      if (mIncome > mExpense) streak++;
      else break;
    }

    // Next milestone
    let nextMilestone = { label: 'Registra tus primeros datos', pct: 0 };
    if (monthlyIncome > 0) {
      const emergencyTarget = monthlyIncome * 3;
      const emergencyPct = Math.min(100, Math.round((totalSaved / emergencyTarget) * 100));
      if (emergencyPct < 100) {
        nextMilestone = { label: `Fondo de emergencia (3 meses): ${emergencyPct}%`, pct: emergencyPct };
      } else {
        const targetSaved = monthlyIncome * 6;
        const sixMonthPct = Math.min(100, Math.round((totalSaved / targetSaved) * 100));
        nextMilestone = { label: `Fondo ideal (6 meses): ${sixMonthPct}%`, pct: sixMonthPct };
      }
    }

    return { monthlyIncome, monthlySpend, totalSaved, daysOfFreedom, zenIndex, streak, nextMilestone };
  }, [incomes, expenses, savingsGoals]);

  const activeLevelData = BUDGET_LEVELS.find((l) => l.id === budgetLevel)!;

  // ── Zen index color & label ──────────────────────────────────────────────
  const zenColor =
    metrics.zenIndex >= 75 ? 'from-teal-400 to-emerald-400' :
    metrics.zenIndex >= 40 ? 'from-amber-400 to-yellow-400' :
    'from-rose-400 to-pink-400';

  const zenLabel =
    metrics.zenIndex >= 75 ? 'Excelente 🧘' :
    metrics.zenIndex >= 40 ? 'En Progreso 💪' :
    'Necesita Atención 🚨';

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">

      {/* ── Row 1: Zen Index + Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Peace Card */}
        <div className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-teal-500/15 to-emerald-500/15 border-teal-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <ShieldCheck size={20} className="text-teal-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center">
                  Tu Índice Zen
                  <MetricTooltip
                    title="Índice Zen (0-100)"
                    description="Mide tu salud financiera global, no solo el mes actual. Combina tres factores: qué tanto has ahorrado, si tu flujo mensual es positivo y el progreso en tus metas."
                    formula="Ahorro acumulado×40 + Flujo mensual×40 + Metas×20"
                    example="Un score bajo puede deberse a que recién empiezas a ahorrar, aunque tu mes haya sido excelente. Mejora con el tiempo conforme acumulas."
                  />
                </h3>
                <p className="text-xs text-slate-400">Salud financiera global acumulada</p>
              </div>
            </div>

            <div className="flex items-end gap-4 mb-6">
              <span className={`text-7xl font-black bg-gradient-to-r ${zenColor} bg-clip-text text-transparent`}>
                {metrics.zenIndex}
              </span>
              <div className="mb-2">
                <p className="text-slate-300 text-sm font-bold">{zenLabel}</p>
                <p className="text-slate-500 text-xs">de 100 puntos</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.zenIndex}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${zenColor} shadow-[0_0_10px_rgba(45,212,191,0.4)]`}
              />
            </div>
          </div>

          {/* Next Milestone */}
          <div className="relative z-10 mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
            <div className="flex items-start gap-3">
              <Award size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Próximo Hito</p>
                <p className="text-sm text-slate-200 font-medium">{metrics.nextMilestone.label}</p>
                {metrics.nextMilestone.pct > 0 && (
                  <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.nextMilestone.pct}%` }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4">
          {/* Días de libertad */}
          <div className="glass-card p-5 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Heart size={18} className="text-rose-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Días de Libertad</p>
            </div>
            <p className="text-4xl font-black text-white">{metrics.daysOfFreedom}</p>
            <p className="text-xs text-rose-400 font-medium mt-1">Ahorros ÷ gastos fijos diarios</p>
          </div>

          {/* Racha */}
          <div className="glass-card p-5 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Zap size={18} className="text-amber-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Racha de Ahorro</p>
            </div>
            <p className="text-4xl font-black text-white">{metrics.streak} <span className="text-xl font-bold text-slate-400">mes{metrics.streak !== 1 ? 'es' : ''}</span></p>
            <p className="text-xs text-amber-400 font-medium mt-1">{metrics.streak >= 3 ? '¡Sigue así! 🔥' : 'Ingresos > Gastos consecutivos'}</p>
          </div>

          {/* Ahorro total */}
          <div className="glass-card p-5 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Wallet size={18} className="text-indigo-400" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Total Ahorrado</p>
            </div>
            <p className="text-3xl font-black text-white">${metrics.totalSaved.toLocaleString()}</p>
            <p className="text-xs text-indigo-400 font-medium mt-1">Suma de todas tus metas</p>
          </div>
        </div>
      </div>

      {/* ── Row 2: Budget Level Selector (Compact) ───────────────────── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" />
            <h4 className="font-bold text-white text-sm">Frecuencia de Vibración Financiera</h4>
            {saving && <span className="text-xs text-slate-500 animate-pulse">Guardando…</span>}
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Info size={13} />
            {showPreview ? 'Ocultar distribución' : 'Ver distribución'}
          </button>
        </div>

        {/* Compact level picker */}
        <div className="grid grid-cols-3 gap-3">
          {BUDGET_LEVELS.map((level) => {
            const isActive = level.id === budgetLevel;
            return (
              <button
                key={level.id}
                onClick={() => handleSelectLevel(level.id)}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? `${level.bg} ${level.border}`
                    : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/70'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check size={12} className={level.text} />
                  </div>
                )}
                <div className={`flex items-center gap-1.5 mb-1.5 ${isActive ? level.text : 'text-slate-400'}`}>
                  {level.icon}
                  <span className="font-bold text-sm text-white">{level.name}</span>
                </div>
                <p className={`text-xs font-mono font-bold mb-1 ${isActive ? level.text : 'text-slate-500'}`}>
                  {level.tagline}
                </p>
                <p className="text-xs text-slate-400 leading-snug hidden sm:block">{level.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Distribution preview (toggle) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-slate-900/60 rounded-xl border border-white/5">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <Lock size={11} />
                  Distribución mensual — basada en tus ingresos (${metrics.monthlyIncome.toLocaleString()}/mes)
                </p>
                <div className="space-y-2">
                  {activeLevelData.distribution.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                      <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                      <span className="text-xs text-slate-500 font-mono">{item.pct}%</span>
                      <span className="text-sm font-bold text-white font-mono w-24 text-right">
                        ${(metrics.monthlyIncome * item.pct / 100).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Visual bar */}
                <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-0.5">
                  {activeLevelData.distribution.map((item) => (
                    <motion.div
                      key={item.label}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${item.color}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

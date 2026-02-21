import { useFinanceStore } from '../store/useFinanceStore';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
}

export const useGamification = () => {
    const { metrics, savingsGoals, expenses } = useFinanceStore();

    // Belt System Logic
    const getBelt = (netWorth: number) => {
        if (netWorth < 1000) return { name: 'Cinturón Blanco', color: 'bg-slate-200 text-slate-800' };
        if (netWorth < 5000) return { name: 'Cinturón Amarillo', color: 'bg-amber-400 text-amber-900' };
        if (netWorth < 15000) return { name: 'Cinturón Verde', color: 'bg-emerald-500 text-white' };
        if (netWorth < 50000) return { name: 'Cinturón Azul', color: 'bg-blue-500 text-white' };
        if (netWorth < 100000) return { name: 'Cinturón Marrón', color: 'bg-amber-800 text-white' };
        return { name: 'Cinturón Negro', color: 'bg-slate-900 text-white' };
    };

    const currentBelt = getBelt(metrics.totalPatrimonio);

    // Badges Logic
    const badges: Badge[] = [
        {
            id: 'savings-ninja',
            name: 'Savings Ninja',
            description: 'Ahorra el 20% de tus ingresos durante 3 meses.',
            icon: '🥷',
            unlocked: savingsGoals.length > 0 && savingsGoals.some(g => g.current >= g.target * 0.2), // Simplistic criteria for now
            progress: savingsGoals.length > 0 ? (savingsGoals[0].current / savingsGoals[0].target) * 100 : 0
        },
        {
            id: 'debt-slayer',
            name: 'Debt Slayer',
            description: 'Paga un préstamo por completo.',
            icon: '🗡️',
            unlocked: expenses.some(e => e.category === 'Deudas' && e.amount === 0) // Placeholder logic
        },
        {
            id: 'peace-master',
            name: 'Maestro de la Paz',
            description: 'Alcanza un Factor de Paz del 100%.',
            icon: '🧘‍♂️',
            unlocked: metrics.peaceFactor >= 100
        }
    ];

    // Streak Logic (Days without unnecessary spending)
    // Simplify for now: Just calculate days since the last expense not categorized as 'Supermercado', 'Vivienda', 'Servicios'
    const calculateStreak = () => {
        const essentialCategories = ['Supermercado', 'Vivienda', 'Servicios Fijos', 'Deudas'];
        
        const nonEssentialExpenses = expenses.filter(e => !essentialCategories.includes(e.category));
        
        if (nonEssentialExpenses.length === 0) {
            return 3; // Mock default starting streak
        }

        const dates = nonEssentialExpenses.map(e => new Date(e.date || '2000-01-01').getTime());
        const lastExpenseDate = Math.max(...dates);
        
        const daysSince = Math.floor((Date.now() - lastExpenseDate) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysSince);
    };

    const streak = calculateStreak();

    return {
        currentBelt,
        badges,
        streak
    };
};

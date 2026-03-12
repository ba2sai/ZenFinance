import { useFinanceStore } from '../store/useFinanceStore';
import { useMemo } from 'react';
import { getMonthlyAmount } from '../utils/financeUtils';

export interface MonthlyData {
  month: string; // "Jan 2024"
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export const useHistoricalData = () => {
  const { incomes, expenses } = useFinanceStore();

  const history = useMemo(() => {
    const months: Record<string, MonthlyData> = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = {
        month: d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        income: 0,
        expenses: 0,
        savings: 0,
        savingsRate: 0
      };
    }

    // Process Incomes
    incomes.forEach(inc => {
      // Logic: For one-time, add to specific month. For recurring, add to ALL relevant months in window.
      // Simplify: Assume recurring active for all history for now
      Object.keys(months).forEach(key => {
        const [year, month] = key.split('-').map(Number);
        
        if (inc.frequency === 'one-time') {
           const d = new Date(inc.date || '');
           if (d.getFullYear() === year && d.getMonth() === month) {
             months[key].income += inc.amount;
           }
        } else {
           months[key].income += getMonthlyAmount(inc.amount, inc.frequency);
        }
      });
    });

    // Process Expenses
    expenses.forEach(exp => {
      Object.keys(months).forEach(key => {
        const [year, month] = key.split('-').map(Number);
        
        if (exp.frequency === 'one-time') {
           const d = new Date(exp.date || '');
           if (d.getFullYear() === year && d.getMonth() === month) {
             months[key].expenses += exp.amount;
           }
        } else {
           months[key].expenses += getMonthlyAmount(exp.amount, exp.frequency);
        }
      });
    });

    // Calculate Savings & Rate
    return Object.values(months).map(m => {
      const savings = m.income - m.expenses;
      const rate = m.income > 0 ? (savings / m.income) * 100 : 0;
      return { ...m, savings, savingsRate: rate };
    }).reverse(); // Chronological order

  }, [incomes, expenses]);

  const trends = useMemo(() => {
    if (history.length < 2) return { expenseTrend: 0, savingsTrend: 0 };
    
    const lastMonth = history[history.length - 1];
    const prevMonth = history[history.length - 2];

    const expenseTrend = prevMonth.expenses > 0 
      ? ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 
      : 0;

    return {
       expenseTrend,
       avgSavingsRate: history.reduce((acc, curr) => acc + curr.savingsRate, 0) / history.length
    };
  }, [history]);

  return { history, trends };
};

import { create } from 'zustand';
import { db } from '../firebase';
import type { Unsubscribe } from 'firebase/firestore';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date?: string; 
  organizationId: string;
  frequency: 'one-time' | 'monthly' | 'biweekly' | 'weekly' | 'yearly';
  recurrenceDays?: number[];
  nextDueDate?: string;
  subscriptionStatus?: 'active' | 'verified' | 'cancelled';
}

export const Expense = {};

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month
  category: string;
  organizationId: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'one-time';
  category: string;
  date?: string; 
  recurrenceDays?: number[]; 
  organizationId: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  icon?: string;
  organizationId: string;
}

interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingGoal[];
  metrics: {
    totalPatrimonio: number;
    freeBudget: number;
    peaceFactor: number;
  };
  loading: boolean;
  permissionError: boolean;
  
  // Actions
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  removeSavingGoal: (id: string) => Promise<void>;
  updateSavingGoal: (id: string, data: Partial<SavingGoal>) => Promise<void>;

  setIncomes: (incomes: Income[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setRecurringExpenses: (expenses: RecurringExpense[]) => void;
  setSavingsGoals: (savingsGoals: SavingGoal[]) => void; // Added this setter for consistency
  subscribeToFinancials: (orgId: string) => Unsubscribe[];
  clearFinanceData: () => void;
  clearPermissionError: () => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  expenses: [],
  recurringExpenses: [],
  incomes: [],
  savingsGoals: [],
  metrics: {
    totalPatrimonio: 0,
    freeBudget: 0,
    peaceFactor: 100,
  },
  loading: false,
  permissionError: false,

  setExpenses: (expenses) => set({ expenses }),
  setRecurringExpenses: (recurringExpenses) => set({ recurringExpenses }),
  setIncomes: (incomes) => set({ incomes }),
  setSavingsGoals: (savingsGoals) => set({ savingsGoals }), // Added this setter for consistency
  clearFinanceData: () => set({ expenses: [], recurringExpenses: [], incomes: [], savingsGoals: [] }),
  clearPermissionError: () => set({ permissionError: false }),

  addIncome: async (income) => {
    try {
      await addDoc(collection(db, 'incomes'), income);
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },

  removeIncome: async (id) => {
    try {
      await deleteDoc(doc(db, 'incomes', id));
    } catch (error) {
       console.error("Error removing income:", error);
       throw error;
    }
  },

  addExpense: async (expense) => {
    try {
        await addDoc(collection(db, 'expenses'), expense);
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
  },

  updateExpense: async (id, data) => {
      try {
          await updateDoc(doc(db, 'expenses', id), data);
      } catch (error) {
          console.error("Error updating expense:", error);
          throw error;
      }
  },

  removeExpense: async (id) => {
      try {
          await deleteDoc(doc(db, 'expenses', id));
      } catch (error) {
          console.error("Error removing expense:", error);
          throw error;
      }
  },

  addSavingGoal: async (goal) => {
      try {
          await addDoc(collection(db, 'saving_goals'), goal);
      } catch (error) {
          console.error("Error adding goal:", error);
          throw error;
      }
  },

  removeSavingGoal: async (id) => {
      try {
          await deleteDoc(doc(db, 'saving_goals', id));
      } catch (error) {
          console.error("Error removing goal:", error);
          throw error;
      }
  },

  updateSavingGoal: async (id, data) => {
      try {
          await updateDoc(doc(db, 'saving_goals', id), data);
      } catch (error) {
          console.error("Error updating goal:", error);
          throw error;
      }
  },


  subscribeToFinancials: (orgId: string) => {
    if (!orgId || orgId === 'default-org') {
      console.warn("Invalid orgId for subscription:", orgId);
      return [];
    }
    
    set({ loading: true, permissionError: false });
    
    // Subscribe to multiple collections
    const collections = ['expenses', 'incomes', 'recurring_expenses', 'saving_goals'];
    const unsubs: Unsubscribe[] = [];

    // Helper to sync state based on collection name
    const syncState = (col: string, data: any[]) => {
        if (col === 'expenses') set({ expenses: data as Expense[] });
        if (col === 'incomes') set({ incomes: data as Income[] });
        if (col === 'recurring_expenses') set({ recurringExpenses: data as RecurringExpense[] });
        if (col === 'saving_goals') set({ savingsGoals: data as SavingGoal[] });
    };

    collections.forEach(col => {
      const q = query(collection(db, col), where('organizationId', '==', orgId));
      const unsub = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          syncState(col, data);
          set({ loading: false });
        },
        (error) => {
          console.error(`Error subscribing to ${col}:`, error);
          if (error.code === 'permission-denied') {
            set({ permissionError: true, loading: false });
          }
        }
      );
      unsubs.push(unsub);
    });

    return unsubs;
  },
}));

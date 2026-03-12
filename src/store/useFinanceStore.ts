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
  updateDoc,
  limit
} from 'firebase/firestore';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date?: string; 
  userId: string;
  frequency: 'one-time' | 'monthly' | 'biweekly' | 'weekly' | 'yearly';
  recurrenceDays?: number[];
  nextDueDate?: string;
  subscriptionStatus?: 'active' | 'verified' | 'cancelled';
}


export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number; // Day of month
  category: string;
  userId: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'yearly' | 'one-time';
  category: string;
  date?: string; 
  recurrenceDays?: number[]; 
  userId: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
  icon?: string;
  userId: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  userId: string;
}

interface FinanceState {
  incomes: Income[];
  expenses: Expense[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingGoal[];
  customCategories: CustomCategory[];
  metrics: {
    totalPatrimonio: number;
    freeBudget: number;
    peaceFactor: number;
  };
  loading: boolean;
  permissionError: boolean;
  isHistoryLoaded: boolean;
  language: string;
  currency: string;
  
  // Actions
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
  addIncome: (income: Omit<Income, 'id'>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  addSavingGoal: (goal: Omit<SavingGoal, 'id'>) => Promise<void>;
  removeSavingGoal: (id: string) => Promise<void>;
  updateSavingGoal: (id: string, data: Partial<SavingGoal>) => Promise<void>;

  addCustomCategory: (category: Omit<CustomCategory, 'id'>) => Promise<void>;
  removeCustomCategory: (id: string) => Promise<void>;

  setIncomes: (incomes: Income[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setRecurringExpenses: (expenses: RecurringExpense[]) => void;
  setSavingsGoals: (savingsGoals: SavingGoal[]) => void;
  setCustomCategories: (categories: CustomCategory[]) => void;
  subscribeToFinancials: (userId: string, options?: { loadAllHistory?: boolean }) => Unsubscribe[];
  clearFinanceData: () => void;
  clearPermissionError: () => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  expenses: [],
  recurringExpenses: [],
  incomes: [],
  savingsGoals: [],
  customCategories: [],
  metrics: {
    totalPatrimonio: 0,
    freeBudget: 0,
    peaceFactor: 100,
  },
  loading: false,
  permissionError: false,
  isHistoryLoaded: false,
  language: localStorage.getItem('zen_lang') || 'es',
  currency: localStorage.getItem('zen_currency') || 'USD',

  setLanguage: (lang) => {
    localStorage.setItem('zen_lang', lang);
    set({ language: lang });
  },
  setCurrency: (currency) => {
    localStorage.setItem('zen_currency', currency);
    set({ currency });
  },

  setExpenses: (expenses) => set({ expenses }),
  setRecurringExpenses: (recurringExpenses) => set({ recurringExpenses }),
  setIncomes: (incomes) => set({ incomes }),
  setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
  setCustomCategories: (customCategories) => set({ customCategories }),
  clearFinanceData: () => set({ expenses: [], recurringExpenses: [], incomes: [], savingsGoals: [], customCategories: [], isHistoryLoaded: false }),
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

  addCustomCategory: async (category) => {
      try {
          await addDoc(collection(db, 'categories'), category);
      } catch (error) {
          console.error("Error adding category:", error);
          throw error;
      }
  },

  removeCustomCategory: async (id) => {
      try {
          await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
          console.error("Error removing category:", error);
          throw error;
      }
  },

  subscribeToFinancials: (userId: string, options = { loadAllHistory: false }) => {
    if (!userId) {
      console.warn("Invalid userId for subscription:", userId);
      return [];
    }
    
    set({ loading: true, permissionError: false, isHistoryLoaded: options.loadAllHistory });
    
    // Subscribe to multiple collections
    const collectionsConfig = [
      { name: 'expenses', canPaginate: true },
      { name: 'incomes', canPaginate: true },
      { name: 'recurring_expenses', canPaginate: false },
      { name: 'saving_goals', canPaginate: false },
      { name: 'categories', canPaginate: false }
    ];
    const unsubs: Unsubscribe[] = [];

    // Helper to sync state based on collection name
    const syncState = (col: string, data: any[]) => {
        if (col === 'expenses') set({ expenses: data as Expense[] });
        if (col === 'incomes') set({ incomes: data as Income[] });
        if (col === 'recurring_expenses') set({ recurringExpenses: data as RecurringExpense[] });
        if (col === 'saving_goals') set({ savingsGoals: data as SavingGoal[] });
        if (col === 'categories') set({ customCategories: data as CustomCategory[] });
    };

    collectionsConfig.forEach(col => {
      let q = query(collection(db, col.name), where('userId', '==', userId));
      
      if (!options.loadAllHistory && col.canPaginate) {
         // Apply limit for regular loading to optimize reads
         // Note: orderBy requires a composite index, falling back to simple limit for now
         q = query(q, limit(100)); 
      }

      const unsub = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          syncState(col.name, data);
          set({ loading: false });
        },
        (error) => {
          console.error(`Error subscribing to ${col.name}:`, error);
          if (error.code === 'permission-denied') {
            set({ permissionError: true, loading: false });
          } else if (error.code === 'failed-precondition') {
             console.error(`Index missing for ${col.name}. Please click the URL in the Firebase console error to create it.`);
          }
        }
      );
      unsubs.push(unsub);
    });

    return unsubs;
  },
}));

/**
 * aiService.ts — Expense categorization via secure Firebase Callable Function.
 * The Gemini API key lives ONLY on the backend (process.env.GEMINI_API_KEY).
 */
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

const categorizeExpensesFn = httpsCallable<
  { rawData: string },
  { status: string; data: { amount: number; category: string; description: string; date: string }[] }
>(functions, "categorizeExpenses");

export const categorizeExpenses = async (rawData: string) => {
  try {
    const result = await categorizeExpensesFn({ rawData });
    if (result.data.status === "success") return result.data.data;
    throw new Error("AI returned error status");
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return null;
  }
};

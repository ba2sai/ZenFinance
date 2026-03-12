/**
 * subscriptionService.ts — Subscription analysis via secure Firebase Callable Functions.
 * The Gemini API key lives ONLY on the backend (process.env.GEMINI_API_KEY).
 */
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

interface Subscription {
  name: string;
  price: number;
  reason: string;
  anxietyLevel: string;
}

const analyzeSubscriptionsFn = httpsCallable<
  { expenses: any[] },
  { status: string; data: Subscription[] }
>(functions, "analyzeSubscriptions");

const generateCancellationEmailFn = httpsCallable<
  { subscription: string },
  { status: string; data: string }
>(functions, "generateCancellationEmail");

export const analyzeSubscriptions = async (expenses: any[]): Promise<Subscription[]> => {
  try {
    const result = await analyzeSubscriptionsFn({ expenses });
    return result.data.status === "success" ? result.data.data : [];
  } catch (error) {
    console.error("Subscription Analysis Error:", error);
    return [];
  }
};

export const generateCancellationEmail = async (subscription: string): Promise<string> => {
  try {
    const result = await generateCancellationEmailFn({ subscription });
    return result.data.status === "success" ? result.data.data : "";
  } catch (error) {
    console.error("generateCancellationEmail Error:", error);
    return "";
  }
};

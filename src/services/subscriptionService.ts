import { GoogleGenerativeAI } from "@google/generative-ai";
const getGenAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeSubscriptions = async (expenses: any[]) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Analiza esta lista de gastos e identifica patrones de suscripción (pagos recurrentes).
    Dime cuáles parecen innecesarios o podrían cancelarse para mejorar el Factor de Paz.
    Retorna un array JSON con: { name: string, price: number, reason: string, anxietyLevel: string }.
    
    Gastos:
    ${JSON.stringify(expenses)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[.*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Subscription Analysis Error:", error);
    return [];
  }
};

export const generateCancellationEmail = async (subscription: string) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Escribe un email de cancelación de suscripción para ${subscription}. El tono debe ser educado pero firme, buscando la tranquilidad mental.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

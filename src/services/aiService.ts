import { GoogleGenerativeAI } from "@google/generative-ai";

// Note: In production, API keys should be handled via backend/secret manager
const getGenAI = () => new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const categorizeExpenses = async (rawData: string) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Eres el Agente 6 de ZenFinance: Especialista Senior en Finanzas y Administración.
    Tu misión es transformar datos transaccionales caóticos en una narrativa de paz mental.
    Analiza este texto extraído de un Excel o PDF de gastos y conviértelo en un JSON válido.
    
    Reglas:
    1. Tono estoico, calmado y empoderador. 
    2. Categoriza cada gasto en: Bienestar, Supervivencia, Lujo, o Inversión.
    3. Si detectas un gasto inusual o cobro doble, menciónalo como una "perturbación en el flujo".
    4. Retorna un array de objetos con: { amount: number, category: string, description: string, date: string }.
    
    Texto:
    ${rawData}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response (in case Gemini adds markdown backticks)
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Formato de respuesta IA inválido");
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return null;
  }
};

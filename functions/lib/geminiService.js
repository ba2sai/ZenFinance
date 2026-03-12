import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const getModel = (apiKey) => {
    if (!apiKey)
        throw new HttpsError("internal", "Gemini API key not configured.");
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
};
// ── 1. Categorize imported CSV expenses ────────────────────────────────────
export const categorizeExpenses = onCall({ secrets: [geminiApiKey] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { rawData } = request.data;
    if (!rawData)
        throw new HttpsError("invalid-argument", "rawData is required.");
    const model = getModel(geminiApiKey.value());
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
        const text = result.response.text();
        const jsonMatch = text.match(/\[.*\]/s);
        if (jsonMatch)
            return { status: "success", data: JSON.parse(jsonMatch[0]) };
        throw new Error("Invalid AI response format");
    }
    catch (error) {
        console.error("categorizeExpenses error:", error);
        throw new HttpsError("internal", error.message || "Failed to categorize expenses.");
    }
});
// ── 2. Analyze subscriptions for waste ─────────────────────────────────────
export const analyzeSubscriptions = onCall({ secrets: [geminiApiKey] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { expenses } = request.data;
    if (!expenses)
        throw new HttpsError("invalid-argument", "expenses array is required.");
    const model = getModel(geminiApiKey.value());
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
        return { status: "success", data: jsonMatch ? JSON.parse(jsonMatch[0]) : [] };
    }
    catch (error) {
        console.error("analyzeSubscriptions error:", error);
        throw new HttpsError("internal", error.message || "Failed to analyze subscriptions.");
    }
});
// ── 3. Generate cancellation email ─────────────────────────────────────────
export const generateCancellationEmail = onCall({ secrets: [geminiApiKey] }, async (request) => {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { subscription } = request.data;
    if (!subscription)
        throw new HttpsError("invalid-argument", "subscription name is required.");
    const model = getModel(geminiApiKey.value());
    const prompt = `Escribe un email de cancelación de suscripción para ${subscription}. El tono debe ser educado pero firme, buscando la tranquilidad mental.`;
    try {
        const result = await model.generateContent(prompt);
        return { status: "success", data: result.response.text() };
    }
    catch (error) {
        console.error("generateCancellationEmail error:", error);
        throw new HttpsError("internal", error.message || "Failed to generate email.");
    }
});
//# sourceMappingURL=geminiService.js.map
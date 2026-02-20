import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const analyzeFinancialFlow = onCall(async (request) => {
    const { auth, data } = request;
    if (!auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { orgId } = auth.token;
    const { expenses, income } = data;
    const prompt = `
    Eres el Agente 6 de ZenFinance: Especialista Senior en Finanzas.
    Tu misión es transformar estos datos en paz mental.
    Analiza los siguientes gastos e ingresos:
    Ingresos: ${JSON.stringify(income)}
    Gastos: ${JSON.stringify(expenses)}

    Reglas:
    1. Tono estoico, calmado y empoderador.
    2. Identifica "ruido" (gastos innecesarios o duplicados).
    3. Identifica "Zen Flow" (dinero hacia valor).
    4. Genera una alerta si hay una desviación crítica.
    5. Retorna un JSON con: { message: string, alerts: string[], suggestions: string[] }.
    
    Respuesta en español.
  `;
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{.*\}/s);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: responseText };
        // Save advice to Firestore
        await admin.firestore().collection("advice").add({
            organizationId: orgId,
            userId: auth.uid,
            content: analysis,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            rating: null
        });
        return { status: "success", analysis };
    }
    catch (error) {
        console.error("Analysis Error:", error);
        throw new HttpsError("internal", error.message);
    }
});
export const handleAdviceFeedback = onCall(async (request) => {
    const { auth, data } = request;
    if (!auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { adviceId, rating, content } = data;
    const { orgId } = auth.token;
    try {
        // Update advice rating
        await admin.firestore().collection("advice").doc(adviceId).update({ rating });
        // If rating is 4-5 stars, add to knowledge base
        if (rating >= 4) {
            await admin.firestore().collection("knowledge_base").add({
                organizationId: orgId,
                content: content,
                type: "insight",
                rating: rating,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        return { status: "success" };
    }
    catch (error) {
        console.error("Feedback Error:", error);
        throw new HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=financialEngine.js.map
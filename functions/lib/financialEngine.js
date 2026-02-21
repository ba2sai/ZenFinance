import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
export const analyzeFinancialFlow = onCall(async (request) => {
    const { auth, data } = request;
    if (!auth)
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    const { orgId } = auth.token;
    const { expenses, income, history, trends, context } = data;
    const prompt = `
    Eres el Agente 6 de ZenFinance: Especialista Senior en Finanzas y Psicología del Dinero.
    Tu misión es transformar estos datos en paz mental y acción estratégica.
    
    ## Contexto Actual
    - Factor de Paz Actual: ${context?.peaceFactor || 'N/A'}%
    - Tasa de Ahorro Promedio (6 meses): ${trends?.avgSavingsRate?.toFixed(1) || 0}%
    - Tendencia de Gastos: ${trends?.expenseTrend > 0 ? 'SUBIENDO 📈' : 'BAJANDO 📉'} (${Math.abs(trends?.expenseTrend || 0).toFixed(1)}%)

    ## Datos Históricos (Últimos 6 Meses)
    ${JSON.stringify(history?.slice(0, 3) || [])} ... (resumen)

    ## Datos del Mes Actual
    Ingresos: ${JSON.stringify(income)}
    Gastos: ${JSON.stringify(expenses)}

    ## Reglas de Análisis
    1. **Detecta Patrones**: Si los gastos suben más que los ingresos, ALERTA ROJA.
    2. **Evalúa la Paz**: Si el Factor de Paz es bajo (<50), sugiere acciones inmediatas de bajo esfuerzo.
    3. **Celebra el Progreso**: Si la tendencia de gastos baja, felicita al usuario.
    4. **Identifica "Ruido"**: Gastos hormiga o suscripciones que parecen olvidadas.
    5. **Tono**: Estoico, directo, pero empático. Como un mentor sabio.

    ## Formato de Respuesta
    Retorna un JSON con: 
    { 
      "message": "Mensaje principal inspirador y directo (max 2 lineas)", 
      "alerts": ["Alerta 1", "Alerta 2"], 
      "suggestions": ["Acción concreta 1", "Acción concreta 2"] 
    }
    
    Respuesta estrictamente en ESPAÑOL.
  `;
    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{.*\}/s);
        const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: responseText };
        // Save advice to Firestore
        await getFirestore().collection("advice").add({
            organizationId: orgId,
            userId: auth.uid,
            content: analysis,
            timestamp: FieldValue.serverTimestamp(),
            rating: null
        });
        return {
            status: "success",
            data: { analysis },
            metadata: { timestamp: new Date().toISOString() }
        };
    }
    catch (error) {
        console.error("Analysis Error:", error);
        return {
            status: "error",
            data: null,
            metadata: {
                timestamp: new Date().toISOString(),
                errorMsg: error.message || "Error generating analysis"
            }
        };
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
        await getFirestore().collection("advice").doc(adviceId).update({ rating });
        // If rating is 4-5 stars, add to knowledge base
        if (rating >= 4) {
            await getFirestore().collection("knowledge_base").add({
                organizationId: orgId,
                content: content,
                type: "insight",
                rating: rating,
                timestamp: FieldValue.serverTimestamp()
            });
        }
        return {
            status: "success",
            data: { message: "Feedback saved" },
            metadata: { timestamp: new Date().toISOString() }
        };
    }
    catch (error) {
        console.error("Feedback Error:", error);
        return {
            status: "error",
            data: null,
            metadata: {
                timestamp: new Date().toISOString(),
                errorMsg: error.message || "Failed to save feedback"
            }
        };
    }
});
//# sourceMappingURL=financialEngine.js.map
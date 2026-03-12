import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

export const processUploadedFile = onCall({ secrets: [geminiApiKey] }, async (request) => {
  const genAI = new GoogleGenerativeAI(geminiApiKey.value());
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  const { auth, data } = request;
  if (!auth) throw new HttpsError("unauthenticated", "User must be authenticated.");

  const { fileBase64, mimeType } = data;

  try {
    const prompt = `
      Analiza este documento financiero (PDF/Imagen/Excel) y extrae las transacciones.
      Retorna un array JSON de objetos: { amount: number, description: string, date: string, category: string }.
      Categoriza en: Bienestar, Supervivencia, Lujo, o Inversión.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[.*\]/s);
    const transactions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return { 
        status: "success", 
        data: { transactions },
        metadata: { timestamp: new Date().toISOString() }
    };
  } catch (error: any) {
    console.error("OCR Error:", error);
    return {
        status: "error",
        data: null,
        metadata: {
            timestamp: new Date().toISOString(),
            errorMsg: error.message || "Error processing file via AI"
        }
    };
  }
});

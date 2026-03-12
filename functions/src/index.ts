import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";

initializeApp();

export { analyzeFinancialFlow, handleAdviceFeedback } from "./financialEngine.js";
export { processUploadedFile } from "./ocrService.js";
export { auditExpenses, auditIncomes, auditCategories, auditSavingGoals, auditRecurring } from "./auditTriggers.js";
export { categorizeExpenses, analyzeSubscriptions, generateCancellationEmail } from "./geminiService.js";



// Trigger: When a new user is created in Firebase Auth
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore();

  try {
    // 3. Create a user profile in the 'users' collection
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      role: "USER",
      createdAt: FieldValue.serverTimestamp()
    });

    console.log(`Successfully created profile for user ${user.uid}`);
  } catch (error) {
    console.error("Error creating new user environment:", error);
  }
});

import { onCall } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions/v1";

initializeApp();

export { analyzeFinancialFlow, handleAdviceFeedback } from "./financialEngine.js";
export { processUploadedFile } from "./ocrService.js";

// Trigger: When a new user is created in Firebase Auth
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = getFirestore();
  const auth = getAuth();
  
  // 1. Create a new Organization for this user
  const orgRef = db.collection("organizations").doc();
  const orgId = orgRef.id;

  try {
    await orgRef.set({
      name: `${user.email?.split('@')[0]}'s Organization` || "My Organization",
      ownerId: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      members: {
        [user.uid]: "ADMIN"
      }
    });

    // 2. Set Custom User Claims on the Auth user record
    await auth.setCustomUserClaims(user.uid, { 
      orgId: orgId,
      role: "ADMIN"
    });

    // 3. Create a user profile in the 'users' collection
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      organizationId: orgId,
      role: "ADMIN",
      createdAt: FieldValue.serverTimestamp()
    });

    console.log(`Successfully created org ${orgId} for user ${user.uid}`);
  } catch (error) {
    console.error("Error creating new user environment:", error);
  }
});

// Callable: Manually setup organization for existing users
export const setupOrganization = onCall(async (request) => {
  const { auth } = request;
  if (!auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be loggeed in.");
  }
  
  const db = getFirestore();
  const adminAuth = getAuth();
  const uid = auth.uid;

  // Check if user already has orgId
  if (auth.token.orgId) {
    return { 
        status: "success", 
        data: { message: "User already has an organization", orgId: auth.token.orgId },
        metadata: { timestamp: new Date().toISOString() }
    };
  }

  const orgRef = db.collection("organizations").doc();
  const orgId = orgRef.id;

  try {
    await orgRef.set({
      name: `${auth.token.email?.split('@')[0]}'s Organization` || "My Organization",
      ownerId: uid,
      createdAt: FieldValue.serverTimestamp(),
      members: {
        [uid]: "ADMIN"
      }
    });

    await adminAuth.setCustomUserClaims(uid, { 
      orgId: orgId,
      role: "ADMIN"
    });

    await db.collection("users").doc(uid).set({
      email: auth.token.email,
      organizationId: orgId,
      role: "ADMIN",
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { 
        status: "success", 
        data: { orgId },
        metadata: { timestamp: new Date().toISOString() }
    };
  } catch (error: any) {
    console.error("Error setting up organization:", error);
    return {
        status: "error",
        data: null,
        metadata: {
            timestamp: new Date().toISOString(),
            errorMsg: error.message || "Internal server error"
        }
    };
  }
});

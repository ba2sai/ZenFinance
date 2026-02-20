import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
admin.initializeApp();
export { analyzeFinancialFlow, handleAdviceFeedback } from "./financialEngine.js";
export { processUploadedFile } from "./ocrService.js";
// Trigger: When a new user is created in Firebase Auth
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
    const db = admin.firestore();
    // 1. Create a new Organization for this user
    const orgRef = db.collection("organizations").doc();
    const orgId = orgRef.id;
    try {
        await orgRef.set({
            name: `${user.email?.split('@')[0]}'s Organization` || "My Organization",
            ownerId: user.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            members: {
                [user.uid]: "ADMIN"
            }
        });
        // 2. Set Custom User Claims on the Auth user record
        await admin.auth().setCustomUserClaims(user.uid, {
            orgId: orgId,
            role: "ADMIN"
        });
        // 3. Create a user profile in the 'users' collection
        await db.collection("users").doc(user.uid).set({
            email: user.email,
            organizationId: orgId,
            role: "ADMIN",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully created org ${orgId} for user ${user.uid}`);
    }
    catch (error) {
        console.error("Error creating new user environment:", error);
    }
});
//# sourceMappingURL=index.js.map
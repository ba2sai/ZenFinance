import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
function generateAuditLog(tableName) {
    return onDocumentWritten(`${tableName}/{docId}`, async (event) => {
        // If both don't exist, it's a weird state, ignore
        if (!event.data)
            return;
        const beforeData = event.data.before.data();
        const afterData = event.data.after.data();
        // Determine action type
        let action = "UPDATE";
        if (!event.data.before.exists) {
            action = "CREATE";
        }
        else if (!event.data.after.exists) {
            action = "DELETE";
        }
        // Get User ID (Fallback to examining data if not directly at root level depending on your schema)
        const userId = afterData?.userId || beforeData?.userId;
        if (!userId) {
            console.warn(`[AuditLog] No userId found for ${tableName}/${event.params.docId}`);
            return;
        }
        try {
            await getFirestore().collection("audit_logs").add({
                userId: userId,
                collection: tableName,
                documentId: event.params.docId,
                action: action,
                timestamp: FieldValue.serverTimestamp(),
                // Exclude large object data in production to save space, but save diffs if necessary. 
                // For now, storing summary.
                summary: `${action} operation performed on ${tableName}`
            });
        }
        catch (error) {
            console.error(`[AuditLog] Error logging ${action} on ${tableName}:`, error);
        }
    });
}
// Export triggers for vital security collections
export const auditExpenses = generateAuditLog("expenses");
export const auditIncomes = generateAuditLog("incomes");
export const auditCategories = generateAuditLog("categories");
export const auditSavingGoals = generateAuditLog("saving_goals");
export const auditRecurring = generateAuditLog("recurring_expenses");
//# sourceMappingURL=auditTriggers.js.map
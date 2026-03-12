import * as functions from "firebase-functions/v1";
export { analyzeFinancialFlow, handleAdviceFeedback } from "./financialEngine.js";
export { processUploadedFile } from "./ocrService.js";
export { auditExpenses, auditIncomes, auditCategories, auditSavingGoals, auditRecurring } from "./auditTriggers.js";
export declare const onUserCreated: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
export declare const setupOrganization: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    status: string;
    data: {
        message: string;
        orgId: any;
    };
    metadata: {
        timestamp: string;
        errorMsg?: never;
    };
} | {
    status: string;
    data: {
        orgId: string;
        message?: never;
    };
    metadata: {
        timestamp: string;
        errorMsg?: never;
    };
} | {
    status: string;
    data: null;
    metadata: {
        timestamp: string;
        errorMsg: any;
    };
}>, unknown>;
//# sourceMappingURL=index.d.ts.map
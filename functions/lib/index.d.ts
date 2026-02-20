import * as functions from "firebase-functions/v1";
export { analyzeFinancialFlow, handleAdviceFeedback } from "./financialEngine.js";
export { processUploadedFile } from "./ocrService.js";
export declare const onUserCreated: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
export declare const setupOrganization: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    status: string;
    message: string;
    orgId: any;
} | {
    status: string;
    orgId: string;
    message?: never;
}>, unknown>;
//# sourceMappingURL=index.d.ts.map
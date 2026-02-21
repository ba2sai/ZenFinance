export declare const analyzeFinancialFlow: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    status: string;
    data: {
        analysis: any;
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
export declare const handleAdviceFeedback: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    status: string;
    data: {
        message: string;
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
//# sourceMappingURL=financialEngine.d.ts.map
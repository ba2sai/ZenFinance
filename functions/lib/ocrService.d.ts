export declare const processUploadedFile: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    status: string;
    data: {
        transactions: any;
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
//# sourceMappingURL=ocrService.d.ts.map
import { UPIPaymentConfig, IntentUrls } from './types.js';
export declare class UPIServerEngine {
    private defaultUpi?;
    private defaultName?;
    constructor(defaults?: {
        merchantUpi?: string;
        merchantName?: string;
    });
    createSession(config: UPIPaymentConfig, ttlSeconds?: number): Promise<IntentUrls>;
    isSessionActive(expiresAt: number): boolean;
    validateUTRFormat(utr: string): boolean;
}
//# sourceMappingURL=server.d.ts.map
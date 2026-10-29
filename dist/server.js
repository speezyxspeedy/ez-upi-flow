"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPIServerEngine = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const node_crypto_1 = require("node:crypto");
class UPIServerEngine {
    defaultUpi;
    defaultName;
    constructor(defaults) {
        this.defaultUpi = defaults?.merchantUpi;
        this.defaultName = defaults?.merchantName;
    }
    async createSession(config, ttlSeconds = 180) {
        const upiId = config.merchantUpi || this.defaultUpi;
        const name = config.merchantName || this.defaultName;
        if (!upiId || !name) {
            throw new Error('[upi-intent-flow] Merchant UPI ID aur Name mandatory hain.');
        }
        if (config.amount <= 0) {
            throw new Error('[upi-intent-flow] Amount 0 se zyada hona chahiye.');
        }
        const formattedAmount = config.amount.toFixed(2);
        const encodedName = encodeURIComponent(name);
        const transactionNote = encodeURIComponent(config.note || `Order #${config.orderId}`);
        const baseParams = `pa=${upiId}&pn=${encodedName}&am=${formattedAmount}&cu=INR&tr=${config.orderId}&tn=${transactionNote}`;
        const rawIntent = `upi://pay?${baseParams}`;
        const gpayIntent = `gpay://upi/pay?${baseParams}`;
        const phonepeIntent = `phonepe://pay?${baseParams}`;
        const paytmIntent = `paytmmp://pay?${baseParams}`;
        const qrBase64 = await qrcode_1.default.toDataURL(rawIntent, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 260,
        });
        const now = Date.now();
        const expiresAt = now + ttlSeconds * 1000;
        const ip = config.clientIp || '0.0.0.0';
        const ua = config.userAgent || 'unknown';
        const sessionToken = (0, node_crypto_1.createHash)('sha256')
            .update(`${config.orderId}|${ip}|${ua}|${(0, node_crypto_1.randomBytes)(8).toString('hex')}`)
            .digest('hex');
        return {
            rawIntent,
            gpayIntent,
            phonepeIntent,
            paytmIntent,
            qrBase64,
            orderId: config.orderId,
            amount: config.amount,
            sessionToken,
            expiresAt,
        };
    }
    isSessionActive(expiresAt) {
        return Date.now() <= expiresAt;
    }
    validateUTRFormat(utr) {
        return /^\d{12}$/.test(utr.trim());
    }
}
exports.UPIServerEngine = UPIServerEngine;
//# sourceMappingURL=server.js.map
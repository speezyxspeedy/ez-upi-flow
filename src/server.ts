import QRCode from 'qrcode';
import { createHash, randomBytes } from 'node:crypto';
import { UPIPaymentConfig, IntentUrls } from './types.js';

export class UPIServerEngine {
  private defaultUpi?: string;
  private defaultName?: string;

  constructor(defaults?: { merchantUpi?: string; merchantName?: string }) {
    this.defaultUpi = defaults?.merchantUpi;
    this.defaultName = defaults?.merchantName;
  }

  public async createSession(config: UPIPaymentConfig, ttlSeconds: number = 180): Promise<IntentUrls> {
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

    const qrBase64 = await QRCode.toDataURL(rawIntent, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 260,
    });

    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;

    const ip = config.clientIp || '0.0.0.0';
    const ua = config.userAgent || 'unknown';
    const sessionToken = createHash('sha256')
      .update(`${config.orderId}|${ip}|${ua}|${randomBytes(8).toString('hex')}`)
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

  public isSessionActive(expiresAt: number): boolean {
    return Date.now() <= expiresAt;
  }

  public validateUTRFormat(utr: string): boolean {
    return /^\d{12}$/.test(utr.trim());
  }
}

export interface UPIPaymentConfig {
  merchantUpi: string;
  merchantName: string;
  amount: number;
  orderId: string;
  note?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface IntentUrls {
  rawIntent: string;
  gpayIntent: string;
  phonepeIntent: string;
  paytmIntent: string;
  qrBase64: string;
  orderId: string;
  amount: number;
  sessionToken: string;
  expiresAt: number;
}

export interface ClientModalOptions {
  packet: IntentUrls;
  merchantName: string;
  onSuccessClaim: (data: { orderId: string; utr: string; sessionToken: string }) => void;
  onCancel: (data: { orderId: string; reason: string }) => void;
}

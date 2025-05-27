import * as qs from 'qs';
import * as crypto from 'crypto';

interface VNPayParams {
  orderId: number;
  amount: number;
  ipAddr?: string;
  orderInfo?: string;
  language?: string;
  bankCode?: string;
}

// Hàm sắp xếp và encode từng tham số giống mẫu VNPAY
function sortAndEncodeObject(
  obj: Record<string, string>,
): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

export function generateHMAC(
  data: Record<string, string>,
  secret: string,
): string {
  const sortedParams = sortAndEncodeObject(data);
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  // Log signData để debug lỗi hash
  console.log('[VNPay] signData for HMAC:', signData);
  console.log('[VNPay] Using Hash Secret:', secret);
  const hmac = crypto
    .createHmac('sha512', secret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex')
    .toUpperCase(); // Đảm bảo trả về chữ hoa để so sánh đúng chuẩn VNPay
  console.log('[VNPay] HMAC result:', hmac);
  return hmac;
}

export function createVNPayUrl({
  orderId,
  amount,
  ipAddr = '127.0.0.1',
  orderInfo = `Thanh toan don hang #${orderId}`,
  language = 'vn',
  bankCode = '',
}: VNPayParams): string {
  const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
  const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
  const vnp_Url = process.env.VNPAY_PAYMENT_URL;
  const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

  if (!vnp_TmnCode || !vnp_HashSecret || !vnp_Url || !vnp_ReturnUrl) {
    throw new Error('Missing VNPAY configuration');
  }

  const date = new Date();
  const createDate = date
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);

  const vnp_Params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode,
    vnp_Locale: language,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

  const sortedEncodedParams = sortAndEncodeObject(vnp_Params);
  const hmac = generateHMAC(vnp_Params, vnp_HashSecret);
  sortedEncodedParams['vnp_SecureHash'] = hmac;

  const queryString = Object.keys(sortedEncodedParams)
    .map((key) => `${key}=${sortedEncodedParams[key]}`)
    .join('&');

  return `${vnp_Url}?${queryString}`;
}

export function verifyReturnUrl(query: Record<string, string>): boolean {
  try {
    const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
    if (!vnp_HashSecret) {
      throw new Error('Missing VNPAY_HASH_SECRET');
    }

    // Clone object để không làm thay đổi query gốc
    const params = { ...query };
    const vnp_SecureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;
    // KHÔNG xóa vnp_ResponseCode hoặc bất kỳ trường nào khác!

    // Sort và encode đúng chuẩn trước khi tạo HMAC
    const hmac = generateHMAC(params, vnp_HashSecret);
    return hmac === (vnp_SecureHash || '').toUpperCase();
  } catch (error) {
    console.error('Error verifying return URL:', error);
    return false;
  }
}

export function getReturnUrlStatus(query: Record<string, string>): {
  success: boolean;
  message: string;
  orderId: number;
  amount: number;
} {
  const isValidSignature = verifyReturnUrl(query);
  if (!isValidSignature) {
    throw new Error('Invalid signature');
  }

  const vnp_ResponseCode = query.vnp_ResponseCode;
  const orderId = parseInt(query.vnp_TxnRef);
  const amount = parseInt(query.vnp_Amount) / 100;

  return {
    success: vnp_ResponseCode === '00',
    message: vnp_ResponseCode === '00' ? 'Success' : 'Failed',
    orderId,
    amount,
  };
}

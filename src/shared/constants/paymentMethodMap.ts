import PaymentMethod from '@shared/models/PaymentMethod';

export const paymentMethodMap: Record<PaymentMethod['type'], string> = {
  credit: '카드',
  cash: '현금',
  giftcard: '상품권',
  etc: '기타',
} as const;

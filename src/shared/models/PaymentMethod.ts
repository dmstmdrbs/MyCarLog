import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class PaymentMethod extends Model {
  static table = 'payment_methods';

  @field('name') name!: string;
  @field('type') type!: 'credit' | 'cash' | 'giftcard' | 'etc';
  @readonly @field('created_at') createdAt!: number;
}

// PaymentMethod 타입 (클래스가 아닌 타입으로 사용할 때)
export type PaymentMethodType = PaymentMethod;

// 결제 수단 생성을 위한 데이터 타입
export interface CreatePaymentMethodData {
  name: string;
  type: 'credit' | 'cash' | 'giftcard' | 'etc';
}

// 결제 수단 수정을 위한 데이터 타입
export interface UpdatePaymentMethodData {
  name?: string;
  type?: 'credit' | 'cash' | 'giftcard' | 'etc';
}

export const paymentMethodSchema: TableSchemaSpec = {
  name: 'payment_methods',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
};

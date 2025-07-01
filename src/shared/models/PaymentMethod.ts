import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class PaymentMethod extends Model {
  static table = 'payment_methods';

  @field('name') name!: string;
  @field('type') type!: 'credit' | 'cash' | 'giftcard' | 'etc';
  @readonly @field('created_at') createdAt!: number;
}

export const paymentMethodSchema: TableSchemaSpec = {
  name: 'payment_methods',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
};

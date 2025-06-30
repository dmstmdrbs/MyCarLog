import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class FuelRecord extends Model {
  static table = 'fuel_records';

  @field('vehicle_id') vehicleId!: string;
  @field('date') date!: number;
  @field('total_cost') totalCost!: number;
  @field('unit_price') unitPrice!: number;
  @field('amount') amount!: number;
  @field('payment_type') paymentType!: 'cash' | 'card' | 'giftcard';
  @field('station_id') stationId!: string;
  @field('memo') memo!: string;
  @readonly @field('created_at') createdAt!: number;
}

export const fuelRecordSchema: TableSchemaSpec = {
  name: 'fuel_records',
  columns: [
    { name: 'vehicle_id', type: 'string' },
    { name: 'date', type: 'number' },
    { name: 'total_cost', type: 'number' },
    { name: 'unit_price', type: 'number' },
    { name: 'amount', type: 'number' },
    { name: 'payment_type', type: 'string' },
    { name: 'station_id', type: 'string' },
    { name: 'memo', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

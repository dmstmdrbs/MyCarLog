import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class MaintenanceRecord extends Model {
  static table = 'maintenance_records';

  @field('vehicle_id') vehicleId!: string;
  @field('date') date!: number;
  @field('odometer') odometer!: number;
  @field('item_id') itemId!: string; // MaintenanceItem 모델 참조
  @field('cost') cost!: number;
  @field('shop_name') shopName!: string;
  @field('memo') memo!: string;
  @readonly @field('created_at') createdAt!: number;
}

export const maintenanceRecordSchema: TableSchemaSpec = {
  name: 'maintenance_records',
  columns: [
    { name: 'vehicle_id', type: 'string' },
    { name: 'date', type: 'number' },
    { name: 'odometer', type: 'number' },
    { name: 'item_id', type: 'string' },
    { name: 'cost', type: 'number' },
    { name: 'shop_name', type: 'string', isOptional: true },
    { name: 'memo', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

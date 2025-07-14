import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class MaintenanceRecord extends Model {
  static table = 'maintenance_records';

  @field('vehicle_id') vehicleId!: string;
  @field('date') date!: string; // yyyy-MM-dd
  @field('odometer') odometer!: number;
  @field('maintenance_item_id') maintenanceItemId!: string; // MaintenanceItem 모델 참조
  @field('cost') cost!: number;
  @field('is_diy') isDiy!: boolean;
  @field('shop_id') shopId!: string;
  @field('shop_name') shopName!: string;
  @field('memo') memo!: string;
  @readonly @field('created_at') createdAt!: number;
}

export const maintenanceRecordSchema: TableSchemaSpec = {
  name: 'maintenance_records',
  columns: [
    { name: 'vehicle_id', type: 'string' },
    { name: 'date', type: 'string' },
    { name: 'odometer', type: 'number', isOptional: true },
    { name: 'maintenance_item_id', type: 'string' },
    { name: 'cost', type: 'number' },
    { name: 'is_diy', type: 'boolean', isOptional: true },
    { name: 'shop_id', type: 'string', isOptional: true },
    { name: 'shop_name', type: 'string', isOptional: true },
    { name: 'memo', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

export type MaintenanceRecordType = Pick<
  MaintenanceRecord,
  | 'id'
  | 'date'
  | 'odometer'
  | 'maintenanceItemId'
  | 'cost'
  | 'isDiy'
  | 'shopId'
  | 'shopName'
  | 'memo'
  | 'createdAt'
  | 'vehicleId'
>;

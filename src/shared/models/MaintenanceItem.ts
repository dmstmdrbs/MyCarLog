import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class MaintenanceItem extends Model {
  static table = 'maintenance_items';

  @field('name') name!: string;
  @field('maintenance_km') maintenanceKm?: number; // 정비 주기, 킬로미터
  @field('maintenance_month') maintenanceMonth?: number; // 정비 주기, 월
  @readonly @field('created_at') createdAt!: number;
}

export const maintenanceItemSchema: TableSchemaSpec = {
  name: 'maintenance_items',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'maintenance_km', type: 'number', isOptional: true },
    { name: 'maintenance_month', type: 'number', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

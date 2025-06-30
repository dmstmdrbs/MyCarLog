import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class MaintenancePlan extends Model {
  static table = 'maintenance_plans';

  @field('vehicle_id') vehicleId!: string;
  @field('planned_date') plannedDate!: number;
  @field('item_id') itemId!: string; // MaintenanceItem 모델 참조
  @field('memo') memo!: string;
  @readonly @field('created_at') createdAt!: number;
}

export const maintenancePlanSchema: TableSchemaSpec = {
  name: 'maintenance_plans',
  columns: [
    { name: 'vehicle_id', type: 'string' },
    { name: 'planned_date', type: 'number' },
    { name: 'item_id', type: 'string' },
    { name: 'memo', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

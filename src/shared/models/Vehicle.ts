import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class Vehicle extends Model {
  static table = 'vehicles';

  @field('type') type!: 'ICE' | 'EV';
  @field('nickname') nickname!: string;
  @field('manufacturer') manufacturer!: string;
  @field('model') model!: string;
  @field('is_default') isDefault!: boolean;
  @readonly @field('created_at') createdAt!: number;
}

export const vehicleSchema: TableSchemaSpec = {
  name: 'vehicles',
  columns: [
    { name: 'type', type: 'string' },
    { name: 'nickname', type: 'string' },
    { name: 'manufacturer', type: 'string' },
    { name: 'model', type: 'string' },
    { name: 'is_default', type: 'boolean' },
    { name: 'created_at', type: 'number' },
  ],
};

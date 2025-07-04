import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class Shop extends Model {
  static table = 'shops';

  @field('name') name!: string;
  @readonly @field('created_at') createdAt!: number;
}

export const shopSchema: TableSchemaSpec = {
  name: 'shops',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
};

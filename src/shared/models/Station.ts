import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';

export default class Station extends Model {
  static table = 'stations';

  @field('name') name!: string;
  @field('type') type!: 'gas' | 'ev'; // 주유소/충전소 구분
  @readonly @field('created_at') createdAt!: number;
}

export const stationSchema = {
  name: 'stations',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
};

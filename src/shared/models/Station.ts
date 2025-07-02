import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';

export default class Station extends Model {
  static table = 'stations';

  @field('name') name!: string;
  @field('type') type!: 'gas' | 'ev'; // 주유소/충전소 구분
  @readonly @field('created_at') createdAt!: number;
}

// Station 타입 (클래스가 아닌 타입으로 사용할 때)
export type StationType = Station;

// 주유소 생성을 위한 데이터 타입
export interface CreateStationData {
  name: string;
  type: 'gas' | 'ev';
}

// 주유소 수정을 위한 데이터 타입
export interface UpdateStationData {
  name?: string;
  type?: 'gas' | 'ev';
}

export const stationSchema: TableSchemaSpec = {
  name: 'stations',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
};

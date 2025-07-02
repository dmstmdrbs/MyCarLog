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

// Vehicle 타입 (클래스가 아닌 타입으로 사용할 때)
export type VehicleType = Vehicle;

// 차량 생성을 위한 데이터 타입
export interface CreateVehicleData {
  type: 'ICE' | 'EV';
  nickname: string;
  manufacturer: string;
  model: string;
  isDefault?: boolean;
}

// 차량 수정을 위한 데이터 타입
export interface UpdateVehicleData {
  type?: 'ICE' | 'EV';
  nickname?: string;
  manufacturer?: string;
  model?: string;
  isDefault?: boolean;
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

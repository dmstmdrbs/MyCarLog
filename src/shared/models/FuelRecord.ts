import { Model } from '@nozbe/watermelondb';
import { field, readonly } from '@nozbe/watermelondb/decorators';
import { TableSchemaSpec } from '@nozbe/watermelondb/Schema';
import { PaymentMethodType } from './PaymentMethod';

export default class FuelRecord extends Model {
  static table = 'fuel_records';

  @field('vehicle_id') vehicleId!: string;
  @field('date') date!: number;
  @field('total_cost') totalCost!: number;
  @field('unit_price') unitPrice!: number;
  @field('amount') amount!: number;
  @field('payment_method_id') paymentMethodId!: string;
  @field('payment_name') paymentName!: string;
  @field('payment_type') paymentType!: PaymentMethodType['type'];
  @field('station_id') stationId!: string;
  @field('station_name') stationName!: string;
  @field('memo') memo!: string;
  @readonly @field('created_at') createdAt!: number;
}

// FuelRecord 타입 (클래스가 아닌 타입으로 사용할 때)
export type FuelRecordType = Pick<
  FuelRecord,
  | 'id'
  | 'date'
  | 'totalCost'
  | 'unitPrice'
  | 'amount'
  | 'paymentMethodId'
  | 'paymentName'
  | 'paymentType'
  | 'stationId'
  | 'stationName'
  | 'memo'
  | 'createdAt'
  | 'vehicleId'
>;

// 연료 기록 생성을 위한 데이터 타입
export interface CreateFuelRecordData {
  vehicleId: string;
  date: number;
  totalCost: number;
  unitPrice: number;
  amount: number;
  paymentMethodId: string;
  paymentName: string;
  paymentType: PaymentMethodType['type'];
  stationId: string;
  stationName: string;
  memo?: string;
  odometer: number;
}

// 연료 기록 수정을 위한 데이터 타입
export interface UpdateFuelRecordData {
  vehicleId?: string;
  date?: number;
  totalCost?: number;
  unitPrice?: number;
  amount?: number;
  paymentMethodId?: string;
  paymentName?: string;
  paymentType?: PaymentMethodType['type'];
  stationId?: string;
  stationName?: string;
  odometer?: number;
  memo?: string;
}

// 월별 통계 타입
export interface MonthlyFuelStats {
  year: number;
  month: number;
  totalCost: number;
  totalAmount: number;
  averagePrice: number;
  recordCount: number;
}

export const fuelRecordSchema: TableSchemaSpec = {
  name: 'fuel_records',
  columns: [
    { name: 'vehicle_id', type: 'string' },
    { name: 'date', type: 'number' },
    { name: 'total_cost', type: 'number' },
    { name: 'unit_price', type: 'number' },
    { name: 'amount', type: 'number' },
    { name: 'payment_method_id', type: 'string' },
    { name: 'payment_name', type: 'string' },
    { name: 'payment_type', type: 'string' },
    { name: 'station_id', type: 'string' },
    { name: 'station_name', type: 'string' },
    { name: 'memo', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
  ],
};

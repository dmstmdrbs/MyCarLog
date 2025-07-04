import { Q } from '@nozbe/watermelondb';
import MaintenanceRecord from '../models/MaintenanceRecord';
import { BaseRepository } from './BaseRepository';
import { PaymentMethodType } from '../models/PaymentMethod';
import { format } from 'date-fns';

export type CreateMaintenanceRecordData = {
  vehicleId: string;
  date: string;
  odometer: number;
  isDiy: boolean;
  maintenanceItemId: string;
  paymentMethodId: string;
  paymentName: string;
  paymentType: PaymentMethodType['type'];
  cost: number;
  shopId?: string;
  shopName?: string;
  memo?: string;
};

export type UpdateMaintenanceRecordData = {
  vehicleId?: string;
  date?: string;
  odometer?: number;
  isDiy?: boolean;
  maintenanceItemId?: string;
  paymentMethodId?: string;
  paymentName?: string;
  paymentType?: PaymentMethodType['type'];
  cost?: number;
  shopId?: string;
  shopName?: string;
  memo?: string;
};

export interface IMaintenanceRecordRepository {
  findByVehicleId(vehicleId: string): Promise<MaintenanceRecord[]>;
  findByDateRange(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MaintenanceRecord[]>;
  findById(id: string): Promise<MaintenanceRecord | null>;
  create(data: CreateMaintenanceRecordData): Promise<MaintenanceRecord>;
  update(
    id: string,
    data: UpdateMaintenanceRecordData,
  ): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
}

class MaintenanceRecordRepository
  extends BaseRepository<MaintenanceRecord>
  implements IMaintenanceRecordRepository
{
  constructor() {
    super('maintenance_records');
  }

  protected assignData(
    record: MaintenanceRecord,
    data: Partial<MaintenanceRecord>,
  ): void {
    if (data.vehicleId !== undefined) record.vehicleId = data.vehicleId;
    if (data.date !== undefined) record.date = data.date;
    if (data.odometer !== undefined) record.odometer = data.odometer;
    if (data.maintenanceItemId !== undefined)
      record.maintenanceItemId = data.maintenanceItemId;
    if (data.cost !== undefined) record.cost = data.cost;
    if (data.shopName !== undefined) record.shopName = data.shopName;
    if (data.memo !== undefined) record.memo = data.memo;
    if (data.isDiy !== undefined) record.isDiy = data.isDiy;
  }

  async findByVehicleId(vehicleId: string): Promise<MaintenanceRecord[]> {
    try {
      return await this.collection
        .query(Q.where('vehicle_id', vehicleId), Q.sortBy('date', Q.desc))
        .fetch();
    } catch (error) {
      console.error(
        `Error finding maintenance records for vehicle ${vehicleId}:`,
        error,
      );
      throw error;
    }
  }

  async findByDateRange(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MaintenanceRecord[]> {
    try {
      return await this.collection
        .query(
          Q.where('vehicle_id', vehicleId),
          Q.where('date', Q.gte(format(startDate, 'yyyy-MM-dd'))),
          Q.where('date', Q.lte(format(endDate, 'yyyy-MM-dd'))),
          Q.sortBy('date', Q.desc),
        )
        .fetch();
    } catch (error) {
      console.error(`Error finding maintenance records by date range:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<MaintenanceRecord | null> {
    try {
      const record = await this.collection.find(id);
      return record || null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      console.error(`Error finding maintenance record by id ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateMaintenanceRecordData): Promise<MaintenanceRecord> {
    try {
      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          record.vehicleId = data.vehicleId;
          record.date = data.date;
          record.odometer = data.odometer;
          record.isDiy = data.isDiy;
          record.maintenanceItemId = data.maintenanceItemId;
          record.cost = data.cost;
          record.shopId = data.shopId || '';
          record.shopName = data.shopName || '';
          record.memo = data.memo || '';
        });
      });
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateMaintenanceRecordData,
  ): Promise<MaintenanceRecord> {
    try {
      return await this.database.write(async () => {
        const record = await this.collection.find(id);
        return await record.update((r) => {
          if (data.vehicleId !== undefined) r.vehicleId = data.vehicleId;
          if (data.date !== undefined) r.date = data.date;
          if (data.odometer !== undefined) r.odometer = data.odometer;
          if (data.maintenanceItemId !== undefined)
            r.maintenanceItemId = data.maintenanceItemId;
          if (data.cost !== undefined) r.cost = data.cost;
          if (data.shopId !== undefined && data.shopName !== undefined) {
            r.shopId = data.shopId;
            r.shopName = data.shopName;
            r.isDiy = false;
          }
          if (data.memo !== undefined) r.memo = data.memo;
          if (data.isDiy !== undefined) {
            r.isDiy = data.isDiy;
            r.shopId = '';
            r.shopName = '';
          }
        });
      });
    } catch (error) {
      console.error(`Error updating maintenance record ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.database.write(async () => {
        const record = await this.collection.find(id);
        await record.destroyPermanently();
      });
    } catch (error) {
      console.error(`Error deleting maintenance record ${id}:`, error);
      throw error;
    }
  }
}

export const maintenanceRecordRepository = new MaintenanceRecordRepository();

import { Q } from '@nozbe/watermelondb';
import { BaseRepository } from './BaseRepository';
import { IRepository } from './BaseRepository';
import MaintenancePlan from '@/shared/models/MaintenancePlan';

export interface IMaintenancePlanRepository
  extends IRepository<MaintenancePlan> {
  findByVehicleId(vehicleId: string): Promise<MaintenancePlan[]>;
  findByItemId(itemId: string): Promise<MaintenancePlan[]>;
  findByDateRange(
    vehicleId: string,
    startDate: number,
    endDate: number,
  ): Promise<MaintenancePlan[]>;
}

export interface CreateMaintenancePlanData {
  vehicleId: string;
  plannedDate: number;
  itemId: string;
  memo?: string;
}

export interface UpdateMaintenancePlanData {
  vehicleId?: string;
  plannedDate?: number;
  itemId?: string;
  memo?: string;
}

class MaintenancePlanRepository
  extends BaseRepository<MaintenancePlan>
  implements IMaintenancePlanRepository
{
  constructor() {
    super('maintenance_plans');
  }

  protected assignData(
    record: MaintenancePlan,
    data: Partial<MaintenancePlan>,
  ): void {
    if (data.vehicleId) {
      record.vehicleId = data.vehicleId;
    }
    if (data.plannedDate) {
      record.plannedDate = data.plannedDate;
    }
    if (data.itemId) {
      record.itemId = data.itemId;
    }
    if (data.memo) {
      record.memo = data.memo;
    }
  }

  async findByVehicleId(vehicleId: string): Promise<MaintenancePlan[]> {
    try {
      return await this.collection
        .query(
          Q.where('vehicle_id', vehicleId),
          Q.sortBy('planned_date', Q.asc),
        )
        .fetch();
    } catch (error) {
      throw new Error('Failed to find maintenance plans by vehicle id', {
        cause: error,
      });
    }
  }

  async findByItemId(itemId: string): Promise<MaintenancePlan[]> {
    try {
      return await this.collection
        .query(Q.where('item_id', itemId), Q.sortBy('planned_date', Q.asc))
        .fetch();
    } catch (error) {
      throw new Error('Failed to find maintenance plans by item id', {
        cause: error,
      });
    }
  }

  async findByDateRange(
    vehicleId: string,
    startDate: number,
    endDate: number,
  ): Promise<MaintenancePlan[]> {
    try {
      return await this.collection
        .query(
          Q.where('vehicle_id', vehicleId),
          Q.where('planned_date', Q.gte(startDate)),
          Q.where('planned_date', Q.lte(endDate)),
          Q.sortBy('planned_date', Q.asc),
        )
        .fetch();
    } catch (error) {
      throw new Error('Failed to find maintenance plans by date range', {
        cause: error,
      });
    }
  }

  async create(data: CreateMaintenancePlanData): Promise<MaintenancePlan> {
    try {
      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          this.assignData(record, data);
        });
      });
    } catch (error) {
      throw new Error('Failed to create maintenance plan', { cause: error });
    }
  }

  async update(
    id: string,
    data: UpdateMaintenancePlanData,
  ): Promise<MaintenancePlan> {
    try {
      return await this.database.write(async () => {
        const plan = await this.collection.find(id);
        return await plan.update((record) => {
          this.assignData(record, data);
        });
      });
    } catch (error) {
      throw new Error('Failed to update maintenance plan', { cause: error });
    }
  }
}

export const maintenancePlanRepository = new MaintenancePlanRepository();

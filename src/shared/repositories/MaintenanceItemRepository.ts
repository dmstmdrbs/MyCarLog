import { BaseRepository } from './BaseRepository';
import MaintenanceItem from '@shared/models/MaintenanceItem';
import { Q } from '@nozbe/watermelondb';

export interface IMaintenanceItemRepository {
  findAll(): Promise<MaintenanceItem[]>;
  findById(id: string): Promise<MaintenanceItem | null>;
  create(data: CreateMaintenanceItemData): Promise<MaintenanceItem>;
  update(id: string, data: UpdateMaintenanceItemData): Promise<MaintenanceItem>;
  delete(id: string): Promise<void>;
}

export interface CreateMaintenanceItemData {
  name: string;
  maintenanceKm?: number;
  maintenanceMonth?: number;
}

export interface UpdateMaintenanceItemData {
  name?: string;
  maintenanceKm?: number;
  maintenanceMonth?: number;
}

export class MaintenanceItemRepository
  extends BaseRepository<MaintenanceItem>
  implements IMaintenanceItemRepository
{
  constructor() {
    super('maintenance_items');
  }

  protected assignData(
    record: MaintenanceItem,
    data: Partial<MaintenanceItem>,
  ): void {
    if (data.name !== undefined) record.name = data.name;
    if (data.maintenanceKm !== undefined)
      record.maintenanceKm = data.maintenanceKm;
    if (data.maintenanceMonth !== undefined)
      record.maintenanceMonth = data.maintenanceMonth;
  }

  async findAll(): Promise<MaintenanceItem[]> {
    try {
      return await this.collection.query().fetch();
    } catch (error) {
      console.error(`Error finding maintenance items:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<MaintenanceItem | null> {
    try {
      return await this.collection
        .query(Q.where('id', id))
        .fetch()
        .then((items) => items[0] || null);
    } catch (error) {
      console.error(`Error finding maintenance item by id:`, error);
      throw error;
    }
  }

  async create(data: CreateMaintenanceItemData): Promise<MaintenanceItem> {
    try {
      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          record.name = data.name;
          record.maintenanceKm = data.maintenanceKm;
          record.maintenanceMonth = data.maintenanceMonth;
        });
      });
    } catch (error) {
      console.error(`Error creating maintenance item:`, error);
      throw error;
    }
  }

  async update(
    id: string,
    data: UpdateMaintenanceItemData,
  ): Promise<MaintenanceItem> {
    try {
      return await this.database.write(async () => {
        const record = await this.collection
          .query(Q.where('id', id))
          .fetch()
          .then((items) => items[0]);
        return await record.update((r) => {
          if (data.name !== undefined) r.name = data.name;
          if (data.maintenanceKm !== undefined)
            r.maintenanceKm = data.maintenanceKm;
          if (data.maintenanceMonth !== undefined)
            r.maintenanceMonth = data.maintenanceMonth;
        });
      });
    } catch (error) {
      console.error(`Error updating maintenance item:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.database.write(async () => {
        const record = await this.collection
          .query(Q.where('id', id))
          .fetch()
          .then((items) => items[0]);
        await record.destroyPermanently();
      });
    } catch (error) {
      console.error(`Error deleting maintenance item:`, error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const maintenanceItemRepository = new MaintenanceItemRepository();

import { BaseRepository } from './BaseRepository';
import Vehicle from '@shared/models/Vehicle';
import { Q } from '@nozbe/watermelondb';

export interface IVehicleRepository {
  findByType(type: 'ICE' | 'EV'): Promise<Vehicle[]>;
  findDefaultVehicle(): Promise<Vehicle | null>;
  setAsDefault(id: string): Promise<Vehicle>;
  unsetAllDefaults(): Promise<void>;
}

export interface CreateVehicleData {
  type: 'ICE' | 'EV';
  nickname: string;
  manufacturer?: string;
  model?: string;
  isDefault?: boolean;
}

export interface UpdateVehicleData {
  type?: 'ICE' | 'EV';
  nickname?: string;
  manufacturer?: string;
  model?: string;
  isDefault?: boolean;
  odometer?: number;
}

export class VehicleRepository
  extends BaseRepository<Vehicle>
  implements IVehicleRepository
{
  constructor() {
    super('vehicles');
  }

  protected assignData(record: Vehicle, data: Partial<Vehicle>): void {
    if (data.type !== undefined) record.type = data.type;
    if (data.nickname !== undefined) record.nickname = data.nickname;
    if (data.manufacturer !== undefined)
      record.manufacturer = data.manufacturer;
    if (data.model !== undefined) record.model = data.model;
    record.isDefault = data.isDefault || false;
    if (data.odometer !== undefined) record.odometer = data.odometer;
  }

  async findByType(type: 'ICE' | 'EV'): Promise<Vehicle[]> {
    try {
      return await this.collection.query(Q.where('type', type)).fetch();
    } catch (error) {
      console.error(`Error finding vehicles by type ${type}:`, error);
      throw error;
    }
  }

  async findDefaultVehicle(): Promise<Vehicle | null> {
    try {
      const defaultVehicles = await this.collection
        .query(Q.where('is_default', true))
        .fetch();
      return defaultVehicles[0] || null;
    } catch (error) {
      console.error('Error finding default vehicle:', error);
      throw error;
    }
  }

  async setAsDefault(id: string): Promise<Vehicle> {
    try {
      return await this.database.write(async () => {
        // 먼저 모든 차량의 기본값을 해제
        await this.unsetAllDefaults();

        // 선택된 차량을 기본으로 설정
        const vehicle = await this.collection.find(id);
        return await vehicle.update((v) => {
          v.isDefault = true;
        });
      });
    } catch (error) {
      console.error(`Error setting vehicle ${id} as default:`, error);
      throw error;
    }
  }

  async unsetAllDefaults(): Promise<void> {
    try {
      const defaultVehicles = await this.collection
        .query(Q.where('is_default', true))
        .fetch();

      if (defaultVehicles.length > 0) {
        await Promise.all(
          defaultVehicles.map((vehicle: Vehicle) =>
            vehicle.update((v: Vehicle) => {
              v.isDefault = false;
            }),
          ),
        );
      }
    } catch (error) {
      console.error('Error unsetting all default vehicles:', error);
      throw error;
    }
  }

  async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    try {
      // 차량이 없으면 첫 차량을 기본 차량으로 설정
      const stats = await this.getVehicleStats();

      if (stats.total === 0) {
        data.isDefault = true;
      }
      const newVehicle = await this.database.write(async () => {
        return await this.collection.create((vehicle) => {
          this.assignData(vehicle, data);
        });
      });

      if (data.isDefault) {
        await this.database.write(async () => {
          await this.unsetAllDefaults();
        });
        await this.setAsDefault(newVehicle.id);
      }
      return newVehicle;
    } catch (error) {
      console.error('Error creating vehicle - createVehicle:', error);
      throw error;
    }
  }

  async deleteVehicle(id: string): Promise<void> {
    try {
      await this.database.write(async () => {
        const stats = await this.getVehicleStats();
        if (stats.total === 1) {
          throw new Error('최소 1대의 차량이 등록되어있어야 합니다.');
        }

        const vehicle = await this.collection.find(id);
        await vehicle.destroyPermanently();
        if (stats.defaultVehicle?.id === id) {
          await this.setAsDefault(stats.defaultVehicle?.id || '');
        }
      });
    } catch (error) {
      console.error(`Error deleting vehicle ${id}:`, error);
      throw error;
    }
  }

  async updateVehicle(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    try {
      return await this.database.write(async () => {
        // 기본 차량으로 설정되는 경우 다른 모든 차량의 기본값 해제
        if (data.isDefault) {
          await this.unsetAllDefaults();
        }

        const vehicle = await this.collection.find(id);
        return await vehicle.update((v) => {
          if (data.type !== undefined) v.type = data.type;
          if (data.nickname !== undefined) v.nickname = data.nickname;
          if (data.manufacturer !== undefined)
            v.manufacturer = data.manufacturer;
          if (data.model !== undefined) v.model = data.model;
          if (data.isDefault !== undefined) v.isDefault = data.isDefault;
          if (data.odometer !== undefined) v.odometer = data.odometer;
        });
      });
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error);
      throw error;
    }
  }

  async getVehicleStats(): Promise<{
    total: number;
    iceCount: number;
    evCount: number;
    defaultVehicle: Vehicle | null;
  }> {
    try {
      const [total, iceVehicles, evVehicles, defaultVehicle] =
        await Promise.all([
          this.count(),
          this.findByType('ICE'),
          this.findByType('EV'),
          this.findDefaultVehicle(),
        ]);

      return {
        total,
        iceCount: iceVehicles.length,
        evCount: evVehicles.length,
        defaultVehicle,
      };
    } catch (error) {
      console.error('Error getting vehicle stats:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const vehicleRepository = new VehicleRepository();

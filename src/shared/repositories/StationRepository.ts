import { BaseRepository } from './BaseRepository';
import Station from '@shared/models/Station';
import { Q } from '@nozbe/watermelondb';

export interface IStationRepository {
  findByType(type: Station['type']): Promise<Station[]>;
  findByName(name: string): Promise<Station | null>;
  searchByName(searchTerm: string): Promise<Station[]>;
}

export interface CreateStationData {
  name: string;
  type: Station['type'];
}

export interface UpdateStationData {
  name?: string;
  type?: Station['type'];
}

export class StationRepository
  extends BaseRepository<Station>
  implements IStationRepository
{
  constructor() {
    super('stations');
  }

  protected assignData(record: Station, data: Partial<Station>): void {
    if (data.name !== undefined) record.name = data.name;
    if (data.type !== undefined) record.type = data.type;
  }

  async findByType(type: Station['type']): Promise<Station[]> {
    try {
      return await this.collection
        .query(Q.where('type', type), Q.sortBy('name', Q.asc))
        .fetch();
    } catch (error) {
      console.error(`Error finding stations by type ${type}:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Station | null> {
    try {
      const stations = await this.collection
        .query(Q.where('name', name))
        .fetch();
      return stations[0] || null;
    } catch (error) {
      console.error(`Error finding station by name ${name}:`, error);
      throw error;
    }
  }

  async searchByName(searchTerm: string): Promise<Station[]> {
    try {
      return await this.collection
        .query(
          Q.where('name', Q.like(`%${searchTerm}%`)),
          Q.sortBy('name', Q.asc),
        )
        .fetch();
    } catch (error) {
      console.error(`Error searching stations by name ${searchTerm}:`, error);
      throw error;
    }
  }

  async createStation(data: CreateStationData): Promise<Station> {
    try {
      // 동일한 이름의 주유소가 있는지 확인
      const existing = await this.findByName(data.name);
      if (existing) {
        throw new Error(`주유소 '${data.name}'이 이미 존재합니다.`);
      }

      return await this.database.write(async () => {
        return await this.collection.create((station) => {
          station.name = data.name;
          station.type = data.type;
        });
      });
    } catch (error) {
      console.error('Error creating station:', error);
      throw error;
    }
  }

  async updateStation(id: string, data: UpdateStationData): Promise<Station> {
    try {
      // 이름 변경 시 중복 확인
      if (data.name) {
        const existing = await this.findByName(data.name);
        if (existing && existing.id !== id) {
          throw new Error(`주유소 '${data.name}'이 이미 존재합니다.`);
        }
      }

      return await this.database.write(async () => {
        const station = await this.collection.find(id);
        return await station.update((s) => {
          if (data.name !== undefined) s.name = data.name;
          if (data.type !== undefined) s.type = data.type;
        });
      });
    } catch (error) {
      console.error(`Error updating station ${id}:`, error);
      throw error;
    }
  }

  async getStationStats(): Promise<{
    totalCount: number;
    typeBreakdown: Record<Station['type'], number>;
  }> {
    try {
      const allStations = await this.findAll();

      const typeBreakdown = allStations.reduce(
        (acc, station) => {
          acc[station.type] = (acc[station.type] || 0) + 1;
          return acc;
        },
        {} as Record<Station['type'], number>,
      );

      return {
        totalCount: allStations.length,
        typeBreakdown,
      };
    } catch (error) {
      console.error('Error getting station stats:', error);
      throw error;
    }
  }

  async getRecentlyAddedStations(limit: number = 10): Promise<Station[]> {
    try {
      return await this.collection
        .query(Q.sortBy('created_at', Q.desc), Q.take(limit))
        .fetch();
    } catch (error) {
      console.error('Error getting recently added stations:', error);
      throw error;
    }
  }

  async getStationsByUsageFrequency(): Promise<Station[]> {
    try {
      // 사용 빈도 순으로 정렬 (실제로는 FuelRecord와 연관하여 계산해야 함)
      // 현재는 생성 순서 역순으로 반환
      return await this.collection
        .query(Q.sortBy('created_at', Q.desc))
        .fetch();
    } catch (error) {
      console.error('Error getting stations by usage frequency:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const stationRepository = new StationRepository();

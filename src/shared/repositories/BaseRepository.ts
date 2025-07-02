import { Model, Database, Collection } from '@nozbe/watermelondb';
import { database } from '@/database';

export interface IRepository<T extends Model> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export abstract class BaseRepository<T extends Model>
  implements IRepository<T>
{
  protected database: Database;
  protected collection: Collection<T>;

  constructor(tableName: string) {
    this.database = database;
    this.collection = this.database.get<T>(tableName);
  }

  async findAll(): Promise<T[]> {
    try {
      return await this.collection.query().fetch();
    } catch (error) {
      console.error(`Error fetching all ${this.collection.table}:`, error);
      throw error;
    }
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.collection.find(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      console.error(
        `Error finding ${this.collection.table} by id ${id}:`,
        error,
      );
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          this.assignData(record, data);
        });
      });
    } catch (error) {
      console.error(`Error creating ${this.collection.table}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      return await this.database.write(async () => {
        const record = await this.collection.find(id);
        return await record.update((r) => {
          this.assignData(r, data);
        });
      });
    } catch (error) {
      console.error(
        `Error updating ${this.collection.table} with id ${id}:`,
        error,
      );
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
      console.error(
        `Error deleting ${this.collection.table} with id ${id}:`,
        error,
      );
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      const records = await this.findAll();
      return records.length;
    } catch (error) {
      console.error(`Error counting ${this.collection.table}:`, error);
      throw error;
    }
  }

  // 서브클래스에서 구현해야 하는 데이터 할당 메서드
  protected abstract assignData(record: T, data: Partial<T>): void;
}

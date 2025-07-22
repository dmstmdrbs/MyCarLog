import { Q } from '@nozbe/watermelondb';
import { BaseRepository } from './BaseRepository';
import { IRepository } from './BaseRepository';
import Shop from '@/shared/models/Shop';

export interface IShopRepository extends IRepository<Shop> {
  findAll(): Promise<Shop[]>;
  findById(id: string): Promise<Shop | null>;
  create(data: Shop): Promise<Shop>;
  update(id: string, data: Shop): Promise<Shop>;
  delete(id: string): Promise<void>;
  findByName(name: string): Promise<Shop | null>;
}

export interface CreateShopData {
  name: string;
}

export interface UpdateShopData {
  name?: string;
}

class ShopRepository extends BaseRepository<Shop> implements IShopRepository {
  constructor() {
    super('shops');
  }

  protected assignData(record: Shop, data: Partial<Shop>): void {
    if (data.name) {
      record.name = data.name;
    }
    if (data.createdAt) {
      record.createdAt = data.createdAt;
    }
  }

  async findAll(): Promise<Shop[]> {
    try {
      return await this.collection
        .query(Q.sortBy('created_at', Q.desc))
        .fetch();
    } catch (error) {
      throw new Error('Failed to find all shops', { cause: error });
    }
  }

  async findById(id: string): Promise<Shop | null> {
    try {
      return await this.collection
        .query(Q.where('id', id))
        .fetch()
        .then((items) => items[0] || null);
    } catch (error) {
      throw new Error('Failed to find shop by id', { cause: error });
    }
  }

  async findByName(name: string): Promise<Shop | null> {
    try {
      return await this.collection
        .query(Q.where('name', name))
        .fetch()
        .then((items) => items[0] || null);
    } catch (error) {
      throw new Error('Failed to find shop by name', { cause: error });
    }
  }

  async create(data: CreateShopData): Promise<Shop> {
    try {
      const existingShop = await this.findByName(data.name);
      if (existingShop) {
        return existingShop;
      }

      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          this.assignData(record, data);
        });
      });
    } catch (error) {
      throw new Error('Failed to create shop', { cause: error });
    }
  }

  async updateShop(id: string, data: Shop): Promise<Shop> {
    try {
      return await this.database.write(async () => {
        const shop = await this.collection.find(id);
        return await shop.update((record) => {
          this.assignData(record, data);
        });
      });
    } catch (error) {
      throw new Error('Failed to update shop', { cause: error });
    }
  }

  async deleteShop(id: string): Promise<void> {
    try {
      await this.database.write(async () => {
        const shop = await this.collection.find(id);
        await shop.destroyPermanently();
      });
    } catch (error) {
      throw new Error('Failed to delete shop', { cause: error });
    }
  }
}

export const shopRepository = new ShopRepository();

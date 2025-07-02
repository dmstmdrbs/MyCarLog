import { BaseRepository } from './BaseRepository';
import PaymentMethod from '@shared/models/PaymentMethod';
import { Q } from '@nozbe/watermelondb';

export interface IPaymentMethodRepository {
  findByType(type: PaymentMethod['type']): Promise<PaymentMethod[]>;
  findByName(name: string): Promise<PaymentMethod | null>;
}

export interface CreatePaymentMethodData {
  name: string;
  type: PaymentMethod['type'];
}

export interface UpdatePaymentMethodData {
  name?: string;
  type?: PaymentMethod['type'];
}

export class PaymentMethodRepository
  extends BaseRepository<PaymentMethod>
  implements IPaymentMethodRepository
{
  constructor() {
    super('payment_methods');
  }

  protected assignData(
    record: PaymentMethod,
    data: Partial<PaymentMethod>,
  ): void {
    if (data.name !== undefined) record.name = data.name;
    if (data.type !== undefined) record.type = data.type;
  }

  async findByType(type: PaymentMethod['type']): Promise<PaymentMethod[]> {
    try {
      return await this.collection
        .query(Q.where('type', type), Q.sortBy('name', Q.asc))
        .fetch();
    } catch (error) {
      console.error(`Error finding payment methods by type ${type}:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<PaymentMethod | null> {
    try {
      const paymentMethods = await this.collection
        .query(Q.where('name', name))
        .fetch();
      return paymentMethods[0] || null;
    } catch (error) {
      console.error(`Error finding payment method by name ${name}:`, error);
      throw error;
    }
  }

  async createPaymentMethod(
    data: CreatePaymentMethodData,
  ): Promise<PaymentMethod> {
    try {
      // 동일한 이름의 결제 수단이 있는지 확인
      const existing = await this.findByName(data.name);
      if (existing) {
        throw new Error(`결제 수단 '${data.name}'이 이미 존재합니다.`);
      }

      return await this.database.write(async () => {
        return await this.collection.create((paymentMethod) => {
          paymentMethod.name = data.name;
          paymentMethod.type = data.type;
        });
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  async updatePaymentMethod(
    id: string,
    data: UpdatePaymentMethodData,
  ): Promise<PaymentMethod> {
    try {
      // 이름 변경 시 중복 확인
      if (data.name) {
        const existing = await this.findByName(data.name);
        if (existing && existing.id !== id) {
          throw new Error(`결제 수단 '${data.name}'이 이미 존재합니다.`);
        }
      }

      return await this.database.write(async () => {
        const paymentMethod = await this.collection.find(id);
        return await paymentMethod.update((pm) => {
          if (data.name !== undefined) pm.name = data.name;
          if (data.type !== undefined) pm.type = data.type;
        });
      });
    } catch (error) {
      console.error(`Error updating payment method ${id}:`, error);
      throw error;
    }
  }

  async getPaymentMethodStats(): Promise<{
    totalCount: number;
    typeBreakdown: Record<PaymentMethod['type'], number>;
  }> {
    try {
      const allPaymentMethods = await this.findAll();

      const typeBreakdown = allPaymentMethods.reduce(
        (acc, pm) => {
          acc[pm.type] = (acc[pm.type] || 0) + 1;
          return acc;
        },
        {} as Record<PaymentMethod['type'], number>,
      );

      return {
        totalCount: allPaymentMethods.length,
        typeBreakdown,
      };
    } catch (error) {
      console.error('Error getting payment method stats:', error);
      throw error;
    }
  }

  async getPaymentMethodsByUsage(): Promise<PaymentMethod[]> {
    try {
      // 사용 빈도 순으로 정렬 (실제로는 FuelRecord와 연관하여 계산해야 함)
      return await this.collection
        .query(Q.sortBy('created_at', Q.desc))
        .fetch();
    } catch (error) {
      console.error('Error getting payment methods by usage:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const paymentMethodRepository = new PaymentMethodRepository();

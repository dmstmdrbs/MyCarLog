import { BaseRepository } from './BaseRepository';
import FuelRecord from '@shared/models/FuelRecord';
import { Q } from '@nozbe/watermelondb';
import { PaymentMethodType } from '../models/PaymentMethod';

export interface IFuelRecordRepository {
  findByVehicleId(vehicleId: string): Promise<FuelRecord[]>;
  findByDateRange(
    vehicleId: string,
    startDate: number,
    endDate: number,
  ): Promise<FuelRecord[]>;
  findByMonth(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<FuelRecord[]>;
  getTotalCostByVehicle(vehicleId: string): Promise<number>;
  getTotalAmountByVehicle(vehicleId: string): Promise<number>;
  getMonthlyStats(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<{
    totalCost: number;
    totalAmount: number;
    recordCount: number;
    avgUnitPrice: number;
  }>;
  getPaymentStatsByMonth(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<
    Array<{ paymentType: string; totalCost: number; usageCount: number }>
  >;
  getMonthlyStatsWithComparisons(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<{
    current: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
    prevMonth: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
    prevYear: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
  }>;
  getYearlyStats(
    vehicleId: string,
    year: number,
  ): Promise<
    Array<{
      month: number;
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    }>
  >;
}

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
}

export interface UpdateFuelRecordData {
  date?: number;
  totalCost?: number;
  unitPrice?: number;
  amount?: number;
  paymentMethodId?: string;
  paymentName?: string;
  paymentType?: PaymentMethodType['type'];
  stationId?: string;
  stationName?: string;
  memo?: string;
}

export class FuelRecordRepository
  extends BaseRepository<FuelRecord>
  implements IFuelRecordRepository
{
  constructor() {
    super('fuel_records');
  }

  protected assignData(record: FuelRecord, data: Partial<FuelRecord>): void {
    if (data.vehicleId !== undefined) record.vehicleId = data.vehicleId;
    if (data.date !== undefined) record.date = data.date;
    if (data.totalCost !== undefined) record.totalCost = data.totalCost;
    if (data.unitPrice !== undefined) record.unitPrice = data.unitPrice;
    if (data.amount !== undefined) record.amount = data.amount;
    if (data.paymentMethodId !== undefined)
      record.paymentMethodId = data.paymentMethodId;
    if (data.paymentName !== undefined) record.paymentName = data.paymentName;
    if (data.paymentType !== undefined) record.paymentType = data.paymentType;
    if (data.stationId !== undefined) record.stationId = data.stationId;
    if (data.stationName !== undefined) record.stationName = data.stationName;
    if (data.memo !== undefined) record.memo = data.memo;
  }

  async findByVehicleId(vehicleId: string): Promise<FuelRecord[]> {
    try {
      return await this.collection
        .query(Q.where('vehicle_id', vehicleId), Q.sortBy('date', Q.desc))
        .fetch();
    } catch (error) {
      console.error(
        `Error finding fuel records for vehicle ${vehicleId}:`,
        error,
      );
      throw error;
    }
  }

  async findByDateRange(
    vehicleId: string,
    startDate: number,
    endDate: number,
  ): Promise<FuelRecord[]> {
    try {
      return await this.collection
        .query(
          Q.where('vehicle_id', vehicleId),
          Q.where('date', Q.gte(startDate)),
          Q.where('date', Q.lte(endDate)),
          Q.sortBy('date', Q.desc),
        )
        .fetch();
    } catch (error) {
      console.error(`Error finding fuel records by date range:`, error);
      throw error;
    }
  }

  async findByMonth(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<FuelRecord[]> {
    try {
      const startDate = new Date(year, month - 1, 1).getTime();
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).getTime();

      return await this.findByDateRange(vehicleId, startDate, endDate);
    } catch (error) {
      console.error(`Error finding fuel records for ${year}-${month}:`, error);
      throw error;
    }
  }

  async getTotalCostByVehicle(vehicleId: string): Promise<number> {
    try {
      const records = await this.findByVehicleId(vehicleId);
      return records.reduce((total, record) => total + record.totalCost, 0);
    } catch (error) {
      console.error(
        `Error getting total cost for vehicle ${vehicleId}:`,
        error,
      );
      throw error;
    }
  }

  async getTotalAmountByVehicle(vehicleId: string): Promise<number> {
    try {
      const records = await this.findByVehicleId(vehicleId);
      return records.reduce((total, record) => total + record.amount, 0);
    } catch (error) {
      console.error(
        `Error getting total amount for vehicle ${vehicleId}:`,
        error,
      );
      throw error;
    }
  }

  async getMonthlyStats(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<{
    totalCost: number;
    totalAmount: number;
    recordCount: number;
    avgUnitPrice: number;
  }> {
    try {
      const records = await this.findByMonth(vehicleId, year, month);

      const totalCost = records.reduce(
        (sum, record) => sum + record.totalCost,
        0,
      );
      const totalAmount = records.reduce(
        (sum, record) => sum + record.amount,
        0,
      );
      const recordCount = records.length;
      const avgUnitPrice = totalAmount > 0 ? totalCost / totalAmount : 0;

      return {
        totalCost,
        totalAmount,
        recordCount,
        avgUnitPrice: Math.round(avgUnitPrice * 100) / 100, // 소수점 둘째자리까지
      };
    } catch (error) {
      console.error(`Error getting monthly stats for ${year}-${month}:`, error);
      throw error;
    }
  }

  async create(data: CreateFuelRecordData): Promise<FuelRecord> {
    try {
      return await this.database.write(async () => {
        return await this.collection.create((record) => {
          record.vehicleId = data.vehicleId;
          record.date = data.date;
          record.totalCost = data.totalCost;
          record.unitPrice = data.unitPrice;
          record.amount = data.amount;
          record.paymentMethodId = data.paymentMethodId;
          record.paymentName = data.paymentName;
          record.paymentType = data.paymentType;
          record.stationId = data.stationId;
          record.stationName = data.stationName;
          record.memo = data.memo || '';
        });
      });
    } catch (error) {
      console.error('Error creating fuel record:', error);
      throw error;
    }
  }

  async updateFuelRecord(
    id: string,
    data: UpdateFuelRecordData,
  ): Promise<FuelRecord> {
    try {
      return await this.database.write(async () => {
        const record = await this.collection.find(id);
        return await record.update((r) => {
          if (data.date !== undefined) r.date = data.date;
          if (data.totalCost !== undefined) r.totalCost = data.totalCost;
          if (data.unitPrice !== undefined) r.unitPrice = data.unitPrice;
          if (data.amount !== undefined) r.amount = data.amount;
          if (data.paymentMethodId !== undefined)
            r.paymentMethodId = data.paymentMethodId;
          if (data.paymentName !== undefined) r.paymentName = data.paymentName;
          if (data.paymentType !== undefined) r.paymentType = data.paymentType;
          if (data.stationId !== undefined) r.stationId = data.stationId;
          if (data.stationName !== undefined) r.stationName = data.stationName;
          if (data.memo !== undefined) r.memo = data.memo;
        });
      });
    } catch (error) {
      console.error(`Error updating fuel record ${id}:`, error);
      throw error;
    }
  }

  async getRecentStations(
    vehicleId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      stationId: string;
      stationName: string;
      lastUsedDate: number;
      usageCount: number;
    }>
  > {
    try {
      const records = await this.findByVehicleId(vehicleId);

      // 주유소별로 그룹화하고 통계 계산
      const stationStats = records.reduce(
        (acc, record) => {
          const key = record.stationId;
          if (!acc[key]) {
            acc[key] = {
              stationId: record.stationId,
              stationName: record.stationName,
              lastUsedDate: record.date,
              usageCount: 0,
            };
          }
          acc[key].usageCount++;
          if (record.date > acc[key].lastUsedDate) {
            acc[key].lastUsedDate = record.date;
          }
          return acc;
        },
        {} as Record<
          string,
          {
            stationId: string;
            stationName: string;
            lastUsedDate: number;
            usageCount: number;
          }
        >,
      );

      return Object.values(stationStats)
        .sort((a, b) => b.lastUsedDate - a.lastUsedDate)
        .slice(0, limit);
    } catch (error) {
      console.error(
        `Error getting recent stations for vehicle ${vehicleId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * 월별 결제 수단별 지출 통계
   */
  async getPaymentStatsByMonth(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<
    Array<{
      paymentType: string;
      paymentName: string;
      totalCost: number;
      usageCount: number;
    }>
  > {
    const records = await this.findByMonth(vehicleId, year, month);
    const stats: Record<
      string,
      { paymentName: string; totalCost: number; usageCount: number }
    > = {};
    records.forEach((record) => {
      if (!stats[record.paymentType]) {
        stats[record.paymentType] = {
          paymentName: record.paymentName,
          totalCost: 0,
          usageCount: 0,
        };
      }
      stats[record.paymentType].totalCost += record.totalCost;
      stats[record.paymentType].usageCount += 1;
    });
    return Object.entries(stats).map(
      ([paymentType, { paymentName, totalCost, usageCount }]) => ({
        paymentType,
        paymentName,
        totalCost,
        usageCount,
      }),
    );
  }

  /**
   * 기준 월, 전월, 전년 동월 통계 반환 (비교용)
   */
  async getMonthlyStatsWithComparisons(
    vehicleId: string,
    year: number,
    month: number,
  ): Promise<{
    current: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
    prevMonth: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
    prevYear: {
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    };
  }> {
    const current = await this.getMonthlyStats(vehicleId, year, month);
    // 전월 계산
    let prevMonthYear = year;
    let prevMonth = month - 1;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevMonthYear -= 1;
    }
    const prevMonthStats = await this.getMonthlyStats(
      vehicleId,
      prevMonthYear,
      prevMonth,
    );
    // 전년 동월
    const prevYearStats = await this.getMonthlyStats(
      vehicleId,
      year - 1,
      month,
    );
    return {
      current,
      prevMonth: prevMonthStats,
      prevYear: prevYearStats,
    };
  }

  /**
   * 연간 통계 (월별 배열)
   */
  async getYearlyStats(
    vehicleId: string,
    year: number,
  ): Promise<
    Array<{
      month: number;
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    }>
  > {
    const stats: Array<{
      month: number;
      totalCost: number;
      totalAmount: number;
      recordCount: number;
      avgUnitPrice: number;
    }> = [];
    for (let m = 1; m <= 12; m++) {
      const monthly = await this.getMonthlyStats(vehicleId, year, m);
      stats.push({ month: m, ...monthly });
    }
    return stats;
  }
}

// 싱글톤 인스턴스
export const fuelRecordRepository = new FuelRecordRepository();

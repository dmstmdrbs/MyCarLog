import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { database } from '@/database';
import { BackupData, BackupResult } from '../types/backup.types';
import Constants from 'expo-constants';
import Vehicle from '@/shared/models/Vehicle';
import FuelRecord from '@/shared/models/FuelRecord';
import MaintenanceRecord from '@/shared/models/MaintenanceRecord';
import MaintenanceItem from '@/shared/models/MaintenanceItem';
import MaintenancePlan from '@/shared/models/MaintenancePlan';
import PaymentMethod from '@/shared/models/PaymentMethod';
import Station from '@/shared/models/Station';
import Shop from '@/shared/models/Shop';

export class BackupService {
  static async createBackup(): Promise<BackupResult> {
    try {
      // 모든 테이블의 데이터를 조회
      const vehicles = await database.get<Vehicle>('vehicles').query().fetch();
      const fuelRecords = await database
        .get<FuelRecord>('fuel_records')
        .query()
        .fetch();
      const maintenanceRecords = await database
        .get<MaintenanceRecord>('maintenance_records')
        .query()
        .fetch();
      const maintenanceItems = await database
        .get<MaintenanceItem>('maintenance_items')
        .query()
        .fetch();
      const maintenancePlans = await database
        .get<MaintenancePlan>('maintenance_plans')
        .query()
        .fetch();
      const paymentMethods = await database
        .get<PaymentMethod>('payment_methods')
        .query()
        .fetch();
      const stations = await database.get<Station>('stations').query().fetch();
      const shops = await database.get<Shop>('shops').query().fetch();

      const backupData: BackupData = {
        version: '1.0.0',
        createdAt: Date.now(),
        appVersion: Constants.expoConfig?.version || '1.0.0',
        data: {
          vehicles: vehicles.map((v) => ({
            id: v.id,
            type: v.type,
            nickname: v.nickname,
            manufacturer: v.manufacturer,
            model: v.model,
            isDefault: v.isDefault,
            odometer: v.odometer,
            createdAt: v.createdAt,
          })),
          fuelRecords: fuelRecords.map((f) => ({
            id: f.id,
            vehicleId: f.vehicleId,
            date: f.date,
            totalCost: f.totalCost,
            unitPrice: f.unitPrice,
            amount: f.amount,
            paymentMethodId: f.paymentMethodId,
            paymentName: f.paymentName,
            paymentType: f.paymentType,
            stationId: f.stationId,
            stationName: f.stationName,
            memo: f.memo,
            odometer: f.odometer,
            createdAt: f.createdAt,
          })),
          maintenanceRecords: maintenanceRecords.map((m) => ({
            id: m.id,
            vehicleId: m.vehicleId,
            date: m.date,
            odometer: m.odometer,
            maintenanceItemId: m.maintenanceItemId,
            cost: m.cost,
            isDiy: m.isDiy,
            shopId: m.shopId,
            shopName: m.shopName,
            memo: m.memo,
            createdAt: m.createdAt,
          })),
          maintenanceItems: maintenanceItems.map((mi) => ({
            id: mi.id,
            name: mi.name,
            maintenanceKm: mi.maintenanceKm,
            maintenanceMonth: mi.maintenanceMonth,
            createdAt: mi.createdAt,
          })),
          maintenancePlans: maintenancePlans.map((mp) => ({
            id: mp.id,
            vehicleId: mp.vehicleId,
            plannedDate: mp.plannedDate,
            itemId: mp.itemId,
            memo: mp.memo,
            createdAt: mp.createdAt,
          })),
          paymentMethods: paymentMethods.map((pm) => ({
            id: pm.id,
            name: pm.name,
            type: pm.type,
            createdAt: pm.createdAt,
          })),
          stations: stations.map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            createdAt: s.createdAt,
          })),
          shops: shops.map((s) => ({
            id: s.id,
            name: s.name,
            createdAt: s.createdAt,
          })),
        },
      };

      // JSON 파일로 저장
      const fileName = `mycarlog_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
      );

      return {
        success: true,
        fileUri,
        dataCount: {
          vehicles: vehicles.length,
          fuelRecords: fuelRecords.length,
          maintenanceRecords: maintenanceRecords.length,
          maintenanceItems: maintenanceItems.length,
          maintenancePlans: maintenancePlans.length,
          paymentMethods: paymentMethods.length,
          stations: stations.length,
          shops: shops.length,
        },
      };
    } catch (error) {
      console.error('백업 생성 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '백업 생성에 실패했습니다.',
      };
    }
  }

  static async shareBackup(fileUri: string): Promise<void> {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'MyCarLog 백업 파일 공유',
        });
      } else {
        throw new Error('파일 공유 기능을 사용할 수 없습니다.');
      }
    } catch (error) {
      console.error('백업 공유 실패:', error);
      throw new Error('백업 파일 공유에 실패했습니다.');
    }
  }

  static async deleteBackupFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri);
    } catch (error) {
      console.error('백업 파일 삭제 실패:', error);
    }
  }
}

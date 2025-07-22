import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '@/database';
import Constants from 'expo-constants';
import Vehicle from '@/shared/models/Vehicle';
import FuelRecord from '@/shared/models/FuelRecord';
import MaintenanceRecord from '@/shared/models/MaintenanceRecord';
import MaintenancePlan from '@/shared/models/MaintenancePlan';
import MaintenanceItem from '@/shared/models/MaintenanceItem';
import {
  VehicleBackupData,
  VehicleRestoreOptions,
  VehicleRestoreResult,
  FuelRecordBackup,
  MaintenanceRecordBackup,
  MaintenancePlanBackup,
  MaintenanceItemBackup,
} from '../types/backup.types';

export class VehicleBackupService {
  // 차량별 백업 생성
  static async createVehicleBackup(
    vehicleId: string,
  ): Promise<{ success: boolean; fileUri?: string; error?: string }> {
    try {
      // 차량 정보 조회
      const vehicle = await database.get<Vehicle>('vehicles').find(vehicleId);
      if (!vehicle) {
        return { success: false, error: '차량을 찾을 수 없습니다.' };
      }

      // 차량 관련 데이터 조회
      const fuelRecords = await database
        .get<FuelRecord>('fuel_records')
        .query()
        .fetch();
      const maintenanceRecords = await database
        .get<MaintenanceRecord>('maintenance_records')
        .query()
        .fetch();
      const maintenancePlans = await database
        .get<MaintenancePlan>('maintenance_plans')
        .query()
        .fetch();
      const maintenanceItems = await database
        .get<MaintenanceItem>('maintenance_items')
        .query()
        .fetch();

      // 해당 차량의 데이터만 필터링
      const vehicleFuelRecords = fuelRecords.filter(
        (record) => record.vehicleId === vehicleId,
      );
      const vehicleMaintenanceRecords = maintenanceRecords.filter(
        (record) => record.vehicleId === vehicleId,
      );
      const vehicleMaintenancePlans = maintenancePlans.filter(
        (plan) => plan.vehicleId === vehicleId,
      );

      // 정비기록과 정비계획에서 참조하는 정비항목 ID들 수집
      const referencedItemIds = new Set<string>();
      vehicleMaintenanceRecords.forEach((record) => {
        if (record.maintenanceItemId) {
          referencedItemIds.add(record.maintenanceItemId);
        }
      });
      vehicleMaintenancePlans.forEach((plan) => {
        if (plan.itemId) {
          referencedItemIds.add(plan.itemId);
        }
      });

      // 참조되는 정비항목들만 필터링
      const referencedMaintenanceItems = maintenanceItems.filter((item) =>
        referencedItemIds.has(item.id),
      );

      // 백업 데이터 구성
      const backupData: VehicleBackupData = {
        version: '1.0',
        createdAt: Date.now(),
        appVersion: Constants.expoConfig?.version || '1.0.0',
        vehicleId: vehicle.id,
        vehicleName: vehicle.nickname,
        vehicleInfo: {
          type: vehicle.type,
          nickname: vehicle.nickname,
          manufacturer: vehicle.manufacturer,
          model: vehicle.model,
          odometer: vehicle.odometer,
        },
        data: {
          fuelRecords: vehicleFuelRecords.map((record) => ({
            id: record.id,
            vehicleId: record.vehicleId,
            date: record.date,
            totalCost: record.totalCost,
            unitPrice: record.unitPrice,
            amount: record.amount,
            paymentMethodId: record.paymentMethodId,
            paymentName: record.paymentName,
            paymentType: record.paymentType,
            stationId: record.stationId,
            stationName: record.stationName,
            memo: record.memo,
            odometer: record.odometer,
            createdAt: record.createdAt,
            updatedAt: record.createdAt, // WatermelonDB는 updatedAt을 직접 노출하지 않음
          })),
          maintenanceRecords: vehicleMaintenanceRecords.map((record) => {
            // 정비항목 이름 찾기
            const maintenanceItem = referencedMaintenanceItems.find(
              (item) => item.id === record.maintenanceItemId,
            );
            return {
              id: record.id,
              vehicleId: record.vehicleId,
              date: record.date,
              odometer: record.odometer,
              maintenanceItemId: record.maintenanceItemId,
              maintenanceItemName: maintenanceItem?.name,
              cost: record.cost,
              isDiy: record.isDiy,
              shopId: record.shopId,
              shopName: record.shopName,
              memo: record.memo,
              createdAt: record.createdAt,
              updatedAt: record.createdAt,
            };
          }),
          maintenancePlans: vehicleMaintenancePlans.map((plan) => {
            // 정비항목 이름 찾기
            const maintenanceItem = referencedMaintenanceItems.find(
              (item) => item.id === plan.itemId,
            );
            return {
              id: plan.id,
              vehicleId: plan.vehicleId,
              plannedDate: plan.plannedDate,
              itemId: plan.itemId,
              itemName: maintenanceItem?.name,
              memo: plan.memo,
              createdAt: plan.createdAt,
              updatedAt: plan.createdAt,
            };
          }),
          maintenanceItems: referencedMaintenanceItems.map((item) => ({
            id: item.id,
            name: item.name,
            maintenanceKm: item.maintenanceKm,
            maintenanceMonth: item.maintenanceMonth,
            createdAt: item.createdAt,
            updatedAt: item.createdAt,
          })),
        },
      };

      // 파일로 저장
      const fileName = `vehicle_backup_${vehicle.nickname}_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
      );

      return { success: true, fileUri };
    } catch (error) {
      console.error('차량별 백업 생성 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '백업 생성에 실패했습니다.',
      };
    }
  }

  // 차량별 백업 파일 공유
  static async shareVehicleBackup(
    fileUri: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return { success: false, error: '파일 공유가 지원되지 않습니다.' };
      }

      await Sharing.shareAsync(fileUri);
      return { success: true };
    } catch (error) {
      console.error('백업 파일 공유 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '파일 공유에 실패했습니다.',
      };
    }
  }

  // 차량별 백업 파일 삭제
  static async deleteVehicleBackupFile(
    fileUri: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await FileSystem.deleteAsync(fileUri);
      return { success: true };
    } catch (error) {
      console.error('백업 파일 삭제 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : '파일 삭제에 실패했습니다.',
      };
    }
  }

  // 차량별 백업 파일 선택
  static async selectVehicleBackupFile(): Promise<string> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        throw new Error('파일 선택이 취소되었습니다.');
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('차량별 백업 파일 선택 실패:', error);
      throw new Error('백업 파일을 선택할 수 없습니다.');
    }
  }

  // 차량별 백업 파일 검증
  static async validateVehicleBackupFile(
    fileUri: string,
  ): Promise<VehicleBackupData> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData: VehicleBackupData = JSON.parse(fileContent);

      if (!backupData.version || !backupData.vehicleId || !backupData.data) {
        throw new Error('잘못된 차량별 백업 파일 형식입니다.');
      }

      return backupData;
    } catch (error) {
      console.error('차량별 백업 파일 검증 실패:', error);
      if (error instanceof SyntaxError) {
        throw new Error('백업 파일이 손상되었습니다.');
      }
      throw error;
    }
  }

  // 차량별 백업 복원 (새 차량으로만 복원)
  static async restoreVehicleBackup(
    backupData: VehicleBackupData,
    options: VehicleRestoreOptions,
  ): Promise<VehicleRestoreResult> {
    try {
      const mergeResult = {
        fuelRecords: { added: 0, updated: 0, skipped: 0 },
        maintenanceRecords: { added: 0, updated: 0, skipped: 0 },
        maintenancePlans: { added: 0, updated: 0, skipped: 0 },
        maintenanceItems: { added: 0, updated: 0, skipped: 0 },
      };

      let targetVehicleId: string;
      let targetVehicleName: string;

      await database.write(async () => {
        // 새 차량 생성
        const newVehicle = await database
          .get<Vehicle>('vehicles')
          .create((vehicle) => {
            vehicle.type = backupData.vehicleInfo.type;
            vehicle.nickname = backupData.vehicleInfo.nickname;
            vehicle.manufacturer = backupData.vehicleInfo.manufacturer;
            vehicle.model = backupData.vehicleInfo.model;
            vehicle.isDefault = false; // 새로 생성된 차량은 기본값이 아님
            vehicle.odometer = backupData.vehicleInfo.odometer;
          });
        targetVehicleId = newVehicle.id;
        targetVehicleName = newVehicle.nickname;

        // 데이터 병합 (의존성 순서: 정비항목 -> 정비기록/정비계획 -> 연료기록)
        await this.mergeVehicleMaintenanceItems(
          backupData.data.maintenanceItems,
          mergeResult,
          options,
        );
        await this.mergeVehicleFuelRecords(
          backupData.data.fuelRecords,
          targetVehicleId!,
          mergeResult,
          options,
        );
        await this.mergeVehicleMaintenanceRecords(
          backupData.data.maintenanceRecords,
          targetVehicleId!,
          mergeResult,
          options,
        );
        await this.mergeVehicleMaintenancePlans(
          backupData.data.maintenancePlans,
          targetVehicleId!,
          mergeResult,
          options,
        );
      });

      return {
        success: true,
        targetVehicleId,
        targetVehicleName,
        mergeResult,
      };
    } catch (error) {
      console.error('차량별 백업 복원 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '복원에 실패했습니다.',
      };
    }
  }

  // 차량별 정비항목 병합
  private static async mergeVehicleMaintenanceItems(
    backupItems: MaintenanceItemBackup[],
    mergeResult: any,
    options: VehicleRestoreOptions,
  ) {
    const allItems = await database
      .get<MaintenanceItem>('maintenance_items')
      .query()
      .fetch();

    for (const backupItem of backupItems) {
      const existingItem = allItems.find(
        (item: MaintenanceItem) => item.name === backupItem.name,
      );

      if (!existingItem) {
        await database
          .get<MaintenanceItem>('maintenance_items')
          .create((item) => {
            item.name = backupItem.name;
            item.maintenanceKm = backupItem.maintenanceKm;
            item.maintenanceMonth = backupItem.maintenanceMonth;
          });
        mergeResult.maintenanceItems.added++;
      } else {
        if (
          options.mergeStrategy === 'smart' &&
          backupItem.createdAt > existingItem.createdAt
        ) {
          await existingItem.update((item) => {
            item.maintenanceKm = backupItem.maintenanceKm;
            item.maintenanceMonth = backupItem.maintenanceMonth;
          });
          mergeResult.maintenanceItems.updated++;
        } else if (options.mergeStrategy === 'backup_first') {
          await existingItem.update((item) => {
            item.maintenanceKm = backupItem.maintenanceKm;
            item.maintenanceMonth = backupItem.maintenanceMonth;
          });
          mergeResult.maintenanceItems.updated++;
        } else {
          mergeResult.maintenanceItems.skipped++;
        }
      }
    }
  }

  // 차량별 연료 기록 병합
  private static async mergeVehicleFuelRecords(
    backupRecords: FuelRecordBackup[],
    targetVehicleId: string,
    mergeResult: any,
    options: VehicleRestoreOptions,
  ) {
    const allRecords = await database
      .get<FuelRecord>('fuel_records')
      .query()
      .fetch();
    const existingRecords = allRecords.filter(
      (r: FuelRecord) => r.vehicleId === targetVehicleId,
    );

    for (const backupRecord of backupRecords) {
      const existingRecord = existingRecords.find(
        (r: FuelRecord) =>
          r.date === backupRecord.date && r.odometer === backupRecord.odometer,
      );

      if (!existingRecord) {
        await database.get<FuelRecord>('fuel_records').create((fuelRecord) => {
          fuelRecord.vehicleId = targetVehicleId;
          fuelRecord.date = backupRecord.date;
          fuelRecord.totalCost = backupRecord.totalCost;
          fuelRecord.unitPrice = backupRecord.unitPrice;
          fuelRecord.amount = backupRecord.amount;
          fuelRecord.paymentMethodId = backupRecord.paymentMethodId || '';
          fuelRecord.paymentName = backupRecord.paymentName;
          fuelRecord.paymentType = backupRecord.paymentType;
          fuelRecord.stationId = backupRecord.stationId || '';
          fuelRecord.stationName = backupRecord.stationName;
          fuelRecord.memo = backupRecord.memo;
          fuelRecord.odometer = backupRecord.odometer;
        });
        mergeResult.fuelRecords.added++;
      } else {
        if (
          options.mergeStrategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = backupRecord.paymentMethodId || '';
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = backupRecord.stationId || '';
            fuelRecord.stationName = backupRecord.stationName;
            fuelRecord.memo = backupRecord.memo;
          });
          mergeResult.fuelRecords.updated++;
        } else if (options.mergeStrategy === 'backup_first') {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = backupRecord.paymentMethodId || '';
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = backupRecord.stationId || '';
            fuelRecord.stationName = backupRecord.stationName;
            fuelRecord.memo = backupRecord.memo;
          });
          mergeResult.fuelRecords.updated++;
        } else {
          mergeResult.fuelRecords.skipped++;
        }
      }
    }
  }

  // 차량별 정비 기록 병합
  private static async mergeVehicleMaintenanceRecords(
    backupRecords: MaintenanceRecordBackup[],
    targetVehicleId: string,
    mergeResult: any,
    options: VehicleRestoreOptions,
  ) {
    const allRecords = await database
      .get<MaintenanceRecord>('maintenance_records')
      .query()
      .fetch();
    const existingRecords = allRecords.filter(
      (r: MaintenanceRecord) => r.vehicleId === targetVehicleId,
    );

    // 정비항목 ID 매핑을 위해 모든 정비항목 조회
    const allMaintenanceItems = await database
      .get<MaintenanceItem>('maintenance_items')
      .query()
      .fetch();

    for (const backupRecord of backupRecords) {
      // 백업의 정비항목 ID를 현재 DB의 정비항목 ID로 매핑
      let mappedMaintenanceItemId = backupRecord.maintenanceItemId;
      if (backupRecord.maintenanceItemName) {
        // 정비항목 이름으로 매핑
        const existingMaintenanceItem = allMaintenanceItems.find(
          (item) => item.name === backupRecord.maintenanceItemName,
        );
        if (existingMaintenanceItem) {
          mappedMaintenanceItemId = existingMaintenanceItem.id;
        }
      }

      const existingRecord = existingRecords.find(
        (r: MaintenanceRecord) =>
          r.date === backupRecord.date &&
          r.maintenanceItemId === mappedMaintenanceItemId,
      );

      if (!existingRecord) {
        await database
          .get<MaintenanceRecord>('maintenance_records')
          .create((record) => {
            record.vehicleId = targetVehicleId;
            record.date = backupRecord.date;
            record.odometer = backupRecord.odometer;
            record.maintenanceItemId = mappedMaintenanceItemId || '';
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = backupRecord.shopId || '';
            record.shopName = backupRecord.shopName;
            record.memo = backupRecord.memo;
          });
        mergeResult.maintenanceRecords.added++;
      } else {
        if (
          options.mergeStrategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((record) => {
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = backupRecord.shopId || '';
            record.shopName = backupRecord.shopName;
            record.memo = backupRecord.memo;
          });
          mergeResult.maintenanceRecords.updated++;
        } else if (options.mergeStrategy === 'backup_first') {
          await existingRecord.update((record) => {
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = backupRecord.shopId || '';
            record.shopName = backupRecord.shopName;
            record.memo = backupRecord.memo;
          });
          mergeResult.maintenanceRecords.updated++;
        } else {
          mergeResult.maintenanceRecords.skipped++;
        }
      }
    }
  }

  // 차량별 정비 계획 병합
  private static async mergeVehicleMaintenancePlans(
    backupPlans: MaintenancePlanBackup[],
    targetVehicleId: string,
    mergeResult: any,
    options: VehicleRestoreOptions,
  ) {
    const allPlans = await database
      .get<MaintenancePlan>('maintenance_plans')
      .query()
      .fetch();
    const existingPlans = allPlans.filter(
      (p: MaintenancePlan) => p.vehicleId === targetVehicleId,
    );

    // 정비항목 ID 매핑을 위해 모든 정비항목 조회
    const allMaintenanceItems = await database
      .get<MaintenanceItem>('maintenance_items')
      .query()
      .fetch();

    for (const backupPlan of backupPlans) {
      // 백업의 정비항목 ID를 현재 DB의 정비항목 ID로 매핑
      let mappedItemId = backupPlan.itemId;
      if (backupPlan.itemName) {
        // 정비항목 이름으로 매핑
        const existingMaintenanceItem = allMaintenanceItems.find(
          (item) => item.name === backupPlan.itemName,
        );
        if (existingMaintenanceItem) {
          mappedItemId = existingMaintenanceItem.id;
        }
      }

      const existingPlan = existingPlans.find(
        (p: MaintenancePlan) =>
          p.itemId === mappedItemId && p.plannedDate === backupPlan.plannedDate,
      );

      if (!existingPlan) {
        await database
          .get<MaintenancePlan>('maintenance_plans')
          .create((plan) => {
            plan.vehicleId = targetVehicleId;
            plan.plannedDate = backupPlan.plannedDate;
            plan.itemId = mappedItemId || '';
            plan.memo = backupPlan.memo;
          });
        mergeResult.maintenancePlans.added++;
      } else {
        if (
          options.mergeStrategy === 'smart' &&
          backupPlan.createdAt > existingPlan.createdAt
        ) {
          await existingPlan.update((plan) => {
            plan.memo = backupPlan.memo;
          });
          mergeResult.maintenancePlans.updated++;
        } else if (options.mergeStrategy === 'backup_first') {
          await existingPlan.update((plan) => {
            plan.memo = backupPlan.memo;
          });
          mergeResult.maintenancePlans.updated++;
        } else {
          mergeResult.maintenancePlans.skipped++;
        }
      }
    }
  }
}

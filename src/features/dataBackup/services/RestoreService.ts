import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { database } from '@/database';
import {
  BackupData,
  RestoreResult,
  MergeOptions,
  VehicleBackup,
  FuelRecordBackup,
  MaintenanceRecordBackup,
  MaintenanceItemBackup,
  MaintenancePlanBackup,
  PaymentMethodBackup,
  StationBackup,
  ShopBackup,
  RestoreIdMapping,
} from '../types/backup.types';
import {
  createEmptyIdMapping,
  addIdMapping,
  updateForeignKeyReferences,
  getRestoreOrder,
} from '../utils/idMappingUtils';
import Vehicle from '@/shared/models/Vehicle';
import FuelRecord from '@/shared/models/FuelRecord';
import MaintenanceRecord from '@/shared/models/MaintenanceRecord';
import MaintenanceItem from '@/shared/models/MaintenanceItem';
import MaintenancePlan from '@/shared/models/MaintenancePlan';
import PaymentMethod from '@/shared/models/PaymentMethod';
import Station from '@/shared/models/Station';
import Shop from '@/shared/models/Shop';

// 병합 결과 타입 정의
interface MergeResultCounts {
  added: number;
  updated: number;
  skipped: number;
}

interface MergeResult {
  vehicles: MergeResultCounts;
  fuelRecords: MergeResultCounts;
  maintenanceRecords: MergeResultCounts;
  maintenanceItems: MergeResultCounts;
  maintenancePlans: MergeResultCounts;
  paymentMethods: MergeResultCounts;
  stations: MergeResultCounts;
  shops: MergeResultCounts;
}

export class RestoreService {
  static async selectBackupFile(): Promise<string> {
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
      console.error('백업 파일 선택 실패:', error);
      throw new Error('백업 파일을 선택할 수 없습니다.');
    }
  }

  static async validateBackupFile(fileUri: string): Promise<BackupData> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(fileContent);

      // 백업 파일 유효성 검사
      if (!backupData.version || !backupData.data) {
        throw new Error('잘못된 백업 파일 형식입니다.');
      }

      // 필수 데이터 구조 확인
      const requiredTables = [
        'vehicles',
        'fuelRecords',
        'maintenanceRecords',
        'maintenanceItems',
        'maintenancePlans',
        'paymentMethods',
        'stations',
        'shops',
      ];

      for (const table of requiredTables) {
        if (
          !Array.isArray(backupData.data[table as keyof typeof backupData.data])
        ) {
          throw new Error(`백업 파일에 ${table} 데이터가 없습니다.`);
        }
      }

      return backupData;
    } catch (error) {
      console.error('백업 파일 검증 실패:', error);
      if (error instanceof SyntaxError) {
        throw new Error('백업 파일이 손상되었습니다.');
      }
      throw error;
    }
  }

  // 기존 방식 (모든 데이터 교체) - 하위 호환성을 위해 유지
  static async restoreFromBackup(
    backupData: BackupData,
  ): Promise<RestoreResult> {
    return this.mergeFromBackup(backupData, { strategy: 'replace_all' });
  }

  // 새로운 병합 방식
  static async mergeFromBackup(
    backupData: BackupData,
    options: MergeOptions = { strategy: 'smart' },
  ): Promise<RestoreResult> {
    try {
      const mergeResult: MergeResult = {
        vehicles: { added: 0, updated: 0, skipped: 0 },
        fuelRecords: { added: 0, updated: 0, skipped: 0 },
        maintenanceRecords: { added: 0, updated: 0, skipped: 0 },
        maintenanceItems: { added: 0, updated: 0, skipped: 0 },
        maintenancePlans: { added: 0, updated: 0, skipped: 0 },
        paymentMethods: { added: 0, updated: 0, skipped: 0 },
        stations: { added: 0, updated: 0, skipped: 0 },
        shops: { added: 0, updated: 0, skipped: 0 },
      };

      await database.write(async () => {
        if (options.strategy === 'replace_all') {
          // 기존 방식: 모든 데이터 삭제 후 복원
          await database.get('vehicles').query().destroyAllPermanently();
          await database.get('fuel_records').query().destroyAllPermanently();
          await database
            .get('maintenance_records')
            .query()
            .destroyAllPermanently();
          await database
            .get('maintenance_items')
            .query()
            .destroyAllPermanently();
          await database
            .get('maintenance_plans')
            .query()
            .destroyAllPermanently();
          await database.get('payment_methods').query().destroyAllPermanently();
          await database.get('stations').query().destroyAllPermanently();
          await database.get('shops').query().destroyAllPermanently();

          // 모든 백업 데이터 추가
          for (const vehicleData of backupData.data.vehicles) {
            await database.get<Vehicle>('vehicles').create((vehicle) => {
              vehicle.type = vehicleData.type;
              vehicle.nickname = vehicleData.nickname;
              vehicle.manufacturer = vehicleData.manufacturer;
              vehicle.model = vehicleData.model;
              vehicle.isDefault = vehicleData.isDefault;
              vehicle.odometer = vehicleData.odometer;
            });
            mergeResult.vehicles.added++;
          }

          // ... 다른 테이블들도 동일하게 처리
          for (const fuelRecordData of backupData.data.fuelRecords) {
            await database
              .get<FuelRecord>('fuel_records')
              .create((fuelRecord) => {
                fuelRecord.vehicleId = fuelRecordData.vehicleId;
                fuelRecord.date = fuelRecordData.date;
                fuelRecord.totalCost = fuelRecordData.totalCost;
                fuelRecord.unitPrice = fuelRecordData.unitPrice;
                fuelRecord.amount = fuelRecordData.amount;
                fuelRecord.paymentMethodId = fuelRecordData.paymentMethodId;
                fuelRecord.paymentName = fuelRecordData.paymentName;
                fuelRecord.paymentType = fuelRecordData.paymentType;
                fuelRecord.stationId = fuelRecordData.stationId;
                fuelRecord.stationName = fuelRecordData.stationName;
                fuelRecord.memo = fuelRecordData.memo;
                fuelRecord.odometer = fuelRecordData.odometer;
              });
            mergeResult.fuelRecords.added++;
          }

          for (const maintenanceRecordData of backupData.data
            .maintenanceRecords) {
            await database
              .get<MaintenanceRecord>('maintenance_records')
              .create((maintenanceRecord) => {
                maintenanceRecord.vehicleId = maintenanceRecordData.vehicleId;
                maintenanceRecord.date = maintenanceRecordData.date;
                maintenanceRecord.odometer = maintenanceRecordData.odometer;
                maintenanceRecord.maintenanceItemId =
                  maintenanceRecordData.maintenanceItemId;
                maintenanceRecord.cost = maintenanceRecordData.cost;
                maintenanceRecord.isDiy = maintenanceRecordData.isDiy;
                maintenanceRecord.shopId = maintenanceRecordData.shopId;
                maintenanceRecord.shopName = maintenanceRecordData.shopName;
                maintenanceRecord.memo = maintenanceRecordData.memo;
              });
            mergeResult.maintenanceRecords.added++;
          }

          for (const maintenanceItemData of backupData.data.maintenanceItems) {
            await database
              .get<MaintenanceItem>('maintenance_items')
              .create((maintenanceItem) => {
                maintenanceItem.name = maintenanceItemData.name;
                maintenanceItem.maintenanceKm =
                  maintenanceItemData.maintenanceKm;
                maintenanceItem.maintenanceMonth =
                  maintenanceItemData.maintenanceMonth;
              });
            mergeResult.maintenanceItems.added++;
          }

          for (const maintenancePlanData of backupData.data.maintenancePlans) {
            await database
              .get<MaintenancePlan>('maintenance_plans')
              .create((maintenancePlan) => {
                maintenancePlan.vehicleId = maintenancePlanData.vehicleId;
                maintenancePlan.plannedDate = maintenancePlanData.plannedDate;
                maintenancePlan.itemId = maintenancePlanData.itemId;
                maintenancePlan.memo = maintenancePlanData.memo;
              });
            mergeResult.maintenancePlans.added++;
          }

          for (const paymentMethodData of backupData.data.paymentMethods) {
            await database
              .get<PaymentMethod>('payment_methods')
              .create((paymentMethod) => {
                paymentMethod.name = paymentMethodData.name;
                paymentMethod.type = paymentMethodData.type;
              });
            mergeResult.paymentMethods.added++;
          }

          for (const stationData of backupData.data.stations) {
            await database.get<Station>('stations').create((station) => {
              station.name = stationData.name;
              station.type = stationData.type;
            });
            mergeResult.stations.added++;
          }

          for (const shopData of backupData.data.shops) {
            await database.get<Shop>('shops').create((shop) => {
              shop.name = shopData.name;
            });
            mergeResult.shops.added++;
          }
        } else {
          // 스마트 병합 방식
          await this.mergeVehicles(
            backupData.data.vehicles,
            mergeResult,
            options,
          );
          await this.mergeFuelRecords(
            backupData.data.fuelRecords,
            mergeResult,
            options,
          );
          await this.mergeMaintenanceRecords(
            backupData.data.maintenanceRecords,
            mergeResult,
            options,
          );
          await this.mergeMaintenanceItems(
            backupData.data.maintenanceItems,
            mergeResult,
            options,
          );
          await this.mergeMaintenancePlans(
            backupData.data.maintenancePlans,
            mergeResult,
            options,
          );
          await this.mergePaymentMethods(
            backupData.data.paymentMethods,
            mergeResult,
            options,
          );
          await this.mergeStations(
            backupData.data.stations,
            mergeResult,
            options,
          );
          await this.mergeShops(backupData.data.shops, mergeResult);
        }
      });

      return {
        success: true,
        mergeResult,
      };
    } catch (error) {
      console.error('데이터 병합 실패:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '데이터 병합에 실패했습니다.',
      };
    }
  }

  // ID 매핑을 사용한 복원 메서드
  private static async restoreWithIdMapping(
    backupData: BackupData,
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: MergeOptions,
  ) {
    const restoreOrder = getRestoreOrder();

    for (const tableName of restoreOrder) {
      switch (tableName) {
        case 'vehicles':
          await this.restoreVehiclesWithMapping(
            backupData.data.vehicles,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'paymentMethods':
          await this.restorePaymentMethodsWithMapping(
            backupData.data.paymentMethods,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'stations':
          await this.restoreStationsWithMapping(
            backupData.data.stations,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'shops':
          await this.restoreShopsWithMapping(
            backupData.data.shops,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'maintenanceItems':
          await this.restoreMaintenanceItemsWithMapping(
            backupData.data.maintenanceItems,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'fuelRecords':
          await this.restoreFuelRecordsWithMapping(
            backupData.data.fuelRecords,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'maintenanceRecords':
          await this.restoreMaintenanceRecordsWithMapping(
            backupData.data.maintenanceRecords,
            idMapping,
            mergeResult,
            options,
          );
          break;
        case 'maintenancePlans':
          await this.restoreMaintenancePlansWithMapping(
            backupData.data.maintenancePlans,
            idMapping,
            mergeResult,
            options,
          );
          break;
      }
    }
  }

  // 차량 복원 (ID 매핑 포함)
  private static async restoreVehiclesWithMapping(
    backupVehicles: VehicleBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: MergeOptions,
  ) {
    for (const backupVehicle of backupVehicles) {
      const newVehicle = await database
        .get<Vehicle>('vehicles')
        .create((vehicle) => {
          vehicle.type = backupVehicle.type;
          vehicle.nickname = backupVehicle.nickname;
          vehicle.manufacturer = backupVehicle.manufacturer;
          vehicle.model = backupVehicle.model;
          vehicle.isDefault = backupVehicle.isDefault;
          vehicle.odometer = backupVehicle.odometer;
        });

      // ID 매핑 추가
      addIdMapping(backupVehicle.id, newVehicle.id, 'vehicles', idMapping);
      mergeResult.vehicles.added++;
    }
  }

  // 연료 기록 복원 (ID 매핑 포함)
  private static async restoreFuelRecordsWithMapping(
    backupRecords: FuelRecordBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: MergeOptions,
  ) {
    for (const backupRecord of backupRecords) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupRecord, idMapping);

      const newRecord = await database
        .get<FuelRecord>('fuel_records')
        .create((fuelRecord) => {
          fuelRecord.vehicleId = updatedData.vehicleId as string;
          fuelRecord.date = backupRecord.date;
          fuelRecord.totalCost = backupRecord.totalCost;
          fuelRecord.unitPrice = backupRecord.unitPrice;
          fuelRecord.amount = backupRecord.amount;
          fuelRecord.paymentMethodId = updatedData.paymentMethodId as string;
          fuelRecord.paymentName = backupRecord.paymentName;
          fuelRecord.paymentType = backupRecord.paymentType;
          fuelRecord.stationId = updatedData.stationId as string;
          fuelRecord.stationName = backupRecord.stationName;
          fuelRecord.memo = backupRecord.memo;
          fuelRecord.odometer = backupRecord.odometer;
        });

      // ID 매핑 추가
      addIdMapping(backupRecord.id, newRecord.id, 'fuelRecords', idMapping);
      mergeResult.fuelRecords.added++;
    }
  }

  // 개별 테이블 병합 메서드들
  private static async mergeVehicles(
    backupVehicles: VehicleBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingVehicles = await database
      .get<Vehicle>('vehicles')
      .query()
      .fetch();

    for (const backupVehicle of backupVehicles) {
      const existingVehicle = existingVehicles.find(
        (v) =>
          v.nickname === backupVehicle.nickname &&
          v.manufacturer === backupVehicle.manufacturer &&
          v.model === backupVehicle.model,
      );

      if (!existingVehicle) {
        // 새 차량 추가
        await database.get<Vehicle>('vehicles').create((vehicle) => {
          vehicle.type = backupVehicle.type;
          vehicle.nickname = backupVehicle.nickname;
          vehicle.manufacturer = backupVehicle.manufacturer;
          vehicle.model = backupVehicle.model;
          vehicle.isDefault = backupVehicle.isDefault;
          vehicle.odometer = backupVehicle.odometer;
        });
        mergeResult.vehicles.added++;
      } else {
        // 기존 차량 업데이트 (스마트 병합)
        if (options.strategy === 'smart') {
          // createdAt을 기준으로 최신 데이터 판단
          const shouldUpdate =
            backupVehicle.createdAt > existingVehicle.createdAt;
          if (shouldUpdate) {
            await existingVehicle.update((vehicle) => {
              vehicle.type = backupVehicle.type;
              vehicle.nickname = backupVehicle.nickname;
              vehicle.manufacturer = backupVehicle.manufacturer;
              vehicle.model = backupVehicle.model;
              vehicle.isDefault = backupVehicle.isDefault;
              vehicle.odometer = backupVehicle.odometer;
            });
            mergeResult.vehicles.updated++;
          } else {
            mergeResult.vehicles.skipped++;
          }
        } else if (options.strategy === 'backup_first') {
          await existingVehicle.update((vehicle) => {
            vehicle.type = backupVehicle.type;
            vehicle.nickname = backupVehicle.nickname;
            vehicle.manufacturer = backupVehicle.manufacturer;
            vehicle.model = backupVehicle.model;
            vehicle.isDefault = backupVehicle.isDefault;
            vehicle.odometer = backupVehicle.odometer;
          });
          mergeResult.vehicles.updated++;
        } else {
          mergeResult.vehicles.skipped++;
        }
      }
    }
  }

  private static async mergeFuelRecords(
    backupFuelRecords: FuelRecordBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingFuelRecords = await database
      .get<FuelRecord>('fuel_records')
      .query()
      .fetch();

    for (const backupRecord of backupFuelRecords) {
      const existingRecord = existingFuelRecords.find(
        (r) =>
          r.vehicleId === backupRecord.vehicleId &&
          r.date === backupRecord.date &&
          r.odometer === backupRecord.odometer,
      );

      if (!existingRecord) {
        await database.get<FuelRecord>('fuel_records').create((fuelRecord) => {
          fuelRecord.vehicleId = backupRecord.vehicleId;
          fuelRecord.date = backupRecord.date;
          fuelRecord.totalCost = backupRecord.totalCost;
          fuelRecord.unitPrice = backupRecord.unitPrice;
          fuelRecord.amount = backupRecord.amount;
          fuelRecord.paymentMethodId = backupRecord.paymentMethodId;
          fuelRecord.paymentName = backupRecord.paymentName;
          fuelRecord.paymentType = backupRecord.paymentType;
          fuelRecord.stationId = backupRecord.stationId;
          fuelRecord.stationName = backupRecord.stationName;
          fuelRecord.memo = backupRecord.memo;
          fuelRecord.odometer = backupRecord.odometer;
        });
        mergeResult.fuelRecords.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = backupRecord.paymentMethodId;
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = backupRecord.stationId;
            fuelRecord.stationName = backupRecord.stationName;
            fuelRecord.memo = backupRecord.memo;
          });
          mergeResult.fuelRecords.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = backupRecord.paymentMethodId;
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = backupRecord.stationId;
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

  // 나머지 병합 메서드들도 유사하게 구현...
  private static async mergeMaintenanceRecords(
    backupRecords: MaintenanceRecordBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingRecords = await database
      .get<MaintenanceRecord>('maintenance_records')
      .query()
      .fetch();

    for (const backupRecord of backupRecords) {
      const existingRecord = existingRecords.find(
        (r) =>
          r.vehicleId === backupRecord.vehicleId &&
          r.date === backupRecord.date &&
          r.maintenanceItemId === backupRecord.maintenanceItemId,
      );

      if (!existingRecord) {
        await database
          .get<MaintenanceRecord>('maintenance_records')
          .create((maintenanceRecord) => {
            maintenanceRecord.vehicleId = backupRecord.vehicleId;
            maintenanceRecord.date = backupRecord.date;
            maintenanceRecord.odometer = backupRecord.odometer;
            maintenanceRecord.maintenanceItemId =
              backupRecord.maintenanceItemId;
            maintenanceRecord.cost = backupRecord.cost;
            maintenanceRecord.isDiy = backupRecord.isDiy;
            maintenanceRecord.shopId = backupRecord.shopId;
            maintenanceRecord.shopName = backupRecord.shopName;
            maintenanceRecord.memo = backupRecord.memo;
          });
        mergeResult.maintenanceRecords.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((maintenanceRecord) => {
            maintenanceRecord.cost = backupRecord.cost;
            maintenanceRecord.isDiy = backupRecord.isDiy;
            maintenanceRecord.shopId = backupRecord.shopId;
            maintenanceRecord.shopName = backupRecord.shopName;
            maintenanceRecord.memo = backupRecord.memo;
          });
          mergeResult.maintenanceRecords.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingRecord.update((maintenanceRecord) => {
            maintenanceRecord.cost = backupRecord.cost;
            maintenanceRecord.isDiy = backupRecord.isDiy;
            maintenanceRecord.shopId = backupRecord.shopId;
            maintenanceRecord.shopName = backupRecord.shopName;
            maintenanceRecord.memo = backupRecord.memo;
          });
          mergeResult.maintenanceRecords.updated++;
        } else {
          mergeResult.maintenanceRecords.skipped++;
        }
      }
    }
  }

  private static async mergeMaintenanceItems(
    backupItems: MaintenanceItemBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingItems = await database
      .get<MaintenanceItem>('maintenance_items')
      .query()
      .fetch();

    for (const backupItem of backupItems) {
      const existingItem = existingItems.find(
        (i) => i.name === backupItem.name,
      );

      if (!existingItem) {
        await database
          .get<MaintenanceItem>('maintenance_items')
          .create((maintenanceItem) => {
            maintenanceItem.name = backupItem.name;
            maintenanceItem.maintenanceKm = backupItem.maintenanceKm;
            maintenanceItem.maintenanceMonth = backupItem.maintenanceMonth;
          });
        mergeResult.maintenanceItems.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupItem.createdAt > existingItem.createdAt
        ) {
          await existingItem.update((maintenanceItem) => {
            maintenanceItem.maintenanceKm = backupItem.maintenanceKm;
            maintenanceItem.maintenanceMonth = backupItem.maintenanceMonth;
          });
          mergeResult.maintenanceItems.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingItem.update((maintenanceItem) => {
            maintenanceItem.maintenanceKm = backupItem.maintenanceKm;
            maintenanceItem.maintenanceMonth = backupItem.maintenanceMonth;
          });
          mergeResult.maintenanceItems.updated++;
        } else {
          mergeResult.maintenanceItems.skipped++;
        }
      }
    }
  }

  private static async mergeMaintenancePlans(
    backupPlans: MaintenancePlanBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingPlans = await database
      .get<MaintenancePlan>('maintenance_plans')
      .query()
      .fetch();

    for (const backupPlan of backupPlans) {
      const existingPlan = existingPlans.find(
        (p) =>
          p.vehicleId === backupPlan.vehicleId &&
          p.itemId === backupPlan.itemId &&
          p.plannedDate === backupPlan.plannedDate,
      );

      if (!existingPlan) {
        await database
          .get<MaintenancePlan>('maintenance_plans')
          .create((maintenancePlan) => {
            maintenancePlan.vehicleId = backupPlan.vehicleId;
            maintenancePlan.plannedDate = backupPlan.plannedDate;
            maintenancePlan.itemId = backupPlan.itemId;
            maintenancePlan.memo = backupPlan.memo;
          });
        mergeResult.maintenancePlans.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupPlan.createdAt > existingPlan.createdAt
        ) {
          await existingPlan.update((maintenancePlan) => {
            maintenancePlan.memo = backupPlan.memo;
          });
          mergeResult.maintenancePlans.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingPlan.update((maintenancePlan) => {
            maintenancePlan.memo = backupPlan.memo;
          });
          mergeResult.maintenancePlans.updated++;
        } else {
          mergeResult.maintenancePlans.skipped++;
        }
      }
    }
  }

  private static async mergePaymentMethods(
    backupMethods: PaymentMethodBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingMethods = await database
      .get<PaymentMethod>('payment_methods')
      .query()
      .fetch();

    for (const backupMethod of backupMethods) {
      const existingMethod = existingMethods.find(
        (m) => m.name === backupMethod.name,
      );

      if (!existingMethod) {
        await database
          .get<PaymentMethod>('payment_methods')
          .create((paymentMethod) => {
            paymentMethod.name = backupMethod.name;
            paymentMethod.type = backupMethod.type;
          });
        mergeResult.paymentMethods.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupMethod.createdAt > existingMethod.createdAt
        ) {
          await existingMethod.update((paymentMethod) => {
            paymentMethod.type = backupMethod.type;
          });
          mergeResult.paymentMethods.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingMethod.update((paymentMethod) => {
            paymentMethod.type = backupMethod.type;
          });
          mergeResult.paymentMethods.updated++;
        } else {
          mergeResult.paymentMethods.skipped++;
        }
      }
    }
  }

  private static async mergeStations(
    backupStations: StationBackup[],
    mergeResult: MergeResult,
    options: MergeOptions,
  ) {
    const existingStations = await database
      .get<Station>('stations')
      .query()
      .fetch();

    for (const backupStation of backupStations) {
      const existingStation = existingStations.find(
        (s) => s.name === backupStation.name,
      );

      if (!existingStation) {
        await database.get<Station>('stations').create((station) => {
          station.name = backupStation.name;
          station.type = backupStation.type;
        });
        mergeResult.stations.added++;
      } else {
        if (
          options.strategy === 'smart' &&
          backupStation.createdAt > existingStation.createdAt
        ) {
          await existingStation.update((station) => {
            station.type = backupStation.type;
          });
          mergeResult.stations.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingStation.update((station) => {
            station.type = backupStation.type;
          });
          mergeResult.stations.updated++;
        } else {
          mergeResult.stations.skipped++;
        }
      }
    }
  }

  private static async mergeShops(
    backupShops: ShopBackup[],
    mergeResult: MergeResult,
  ) {
    const existingShops = await database.get<Shop>('shops').query().fetch();

    for (const backupShop of backupShops) {
      const existingShop = existingShops.find(
        (s) => s.name === backupShop.name,
      );

      if (!existingShop) {
        await database.get<Shop>('shops').create((shop) => {
          shop.name = backupShop.name;
        });
        mergeResult.shops.added++;
      } else {
        // Shop은 name만 있으므로 중복 시 스킵
        mergeResult.shops.skipped++;
      }
    }
  }
}

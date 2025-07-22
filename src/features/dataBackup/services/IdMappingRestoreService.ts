import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { database } from '@/database';
import {
  BackupData,
  RestoreResult,
  RestoreOptions,
  RestoreIdMapping,
  RestoreTableOrder,
  VehicleBackup,
  FuelRecordBackup,
  MaintenanceRecordBackup,
  MaintenanceItemBackup,
  MaintenancePlanBackup,
  PaymentMethodBackup,
  StationBackup,
  ShopBackup,
} from '../types/backup.types';
import {
  createEmptyIdMapping,
  addIdMapping,
  updateForeignKeyReferences,
  getRestoreOrder,
  getTableDependencies,
} from '../utils/idMappingUtils';
import Vehicle from '@/shared/models/Vehicle';
import FuelRecord from '@/shared/models/FuelRecord';
import MaintenanceRecord from '@/shared/models/MaintenanceRecord';
import MaintenanceItem from '@/shared/models/MaintenanceItem';
import MaintenancePlan from '@/shared/models/MaintenancePlan';
import PaymentMethod from '@/shared/models/PaymentMethod';
import Station from '@/shared/models/Station';
import Shop from '@/shared/models/Shop';

export class IdMappingRestoreService {
  // 백업 파일 선택
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

  // 백업 파일 검증
  static async validateBackupFile(fileUri: string): Promise<BackupData> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const backupData: BackupData = JSON.parse(fileContent);

      if (!backupData.version || !backupData.data) {
        throw new Error('잘못된 백업 파일 형식입니다.');
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

  // ID 매핑을 사용한 복원
  static async restoreFromBackup(
    backupData: BackupData,
    options: RestoreOptions = { strategy: 'smart' },
  ): Promise<RestoreResult> {
    try {
      const mergeResult = {
        vehicles: { added: 0, updated: 0, skipped: 0 },
        fuelRecords: { added: 0, updated: 0, skipped: 0 },
        maintenanceRecords: { added: 0, updated: 0, skipped: 0 },
        maintenanceItems: { added: 0, updated: 0, skipped: 0 },
        maintenancePlans: { added: 0, updated: 0, skipped: 0 },
        paymentMethods: { added: 0, updated: 0, skipped: 0 },
        stations: { added: 0, updated: 0, skipped: 0 },
        shops: { added: 0, updated: 0, skipped: 0 },
      };

      // ID 매핑 초기화
      const idMapping = createEmptyIdMapping();

      await database.write(async () => {
        if (options.strategy === 'replace_all') {
          // 모든 데이터 삭제 후 복원
          await this.clearAllData();
          await this.restoreWithIdMapping(
            backupData,
            idMapping,
            mergeResult,
            options,
          );
        } else {
          // 스마트 병합
          await this.mergeWithIdMapping(
            backupData,
            idMapping,
            mergeResult,
            options,
          );
        }
      });

      return { success: true, mergeResult };
    } catch (error) {
      console.error('복원 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '복원에 실패했습니다.',
      };
    }
  }

  // 모든 데이터 삭제
  private static async clearAllData() {
    await database.get('vehicles').query().destroyAllPermanently();
    await database.get('fuel_records').query().destroyAllPermanently();
    await database.get('maintenance_records').query().destroyAllPermanently();
    await database.get('maintenance_items').query().destroyAllPermanently();
    await database.get('maintenance_plans').query().destroyAllPermanently();
    await database.get('payment_methods').query().destroyAllPermanently();
    await database.get('stations').query().destroyAllPermanently();
    await database.get('shops').query().destroyAllPermanently();
  }

  // ID 매핑을 사용한 복원
  private static async restoreWithIdMapping(
    backupData: BackupData,
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const restoreOrder = getRestoreOrder();

    for (const tableName of restoreOrder) {
      await this.restoreTable(
        tableName,
        backupData,
        idMapping,
        mergeResult,
        options,
      );
    }
  }

  // ID 매핑을 사용한 병합
  private static async mergeWithIdMapping(
    backupData: BackupData,
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const restoreOrder = getRestoreOrder();

    for (const tableName of restoreOrder) {
      await this.mergeTable(
        tableName,
        backupData,
        idMapping,
        mergeResult,
        options,
      );
    }
  }

  // 테이블 복원
  private static async restoreTable(
    tableName: RestoreTableOrder,
    backupData: BackupData,
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    switch (tableName) {
      case 'vehicles':
        await this.restoreVehicles(
          backupData.data.vehicles,
          idMapping,
          mergeResult,
        );
        break;
      case 'paymentMethods':
        await this.restorePaymentMethods(
          backupData.data.paymentMethods,
          idMapping,
          mergeResult,
        );
        break;
      case 'stations':
        await this.restoreStations(
          backupData.data.stations,
          idMapping,
          mergeResult,
        );
        break;
      case 'shops':
        await this.restoreShops(backupData.data.shops, idMapping, mergeResult);
        break;
      case 'maintenanceItems':
        await this.restoreMaintenanceItems(
          backupData.data.maintenanceItems,
          idMapping,
          mergeResult,
        );
        break;
      case 'fuelRecords':
        await this.restoreFuelRecords(
          backupData.data.fuelRecords,
          idMapping,
          mergeResult,
        );
        break;
      case 'maintenanceRecords':
        await this.restoreMaintenanceRecords(
          backupData.data.maintenanceRecords,
          idMapping,
          mergeResult,
        );
        break;
      case 'maintenancePlans':
        await this.restoreMaintenancePlans(
          backupData.data.maintenancePlans,
          idMapping,
          mergeResult,
        );
        break;
    }
  }

  // 테이블 병합
  private static async mergeTable(
    tableName: RestoreTableOrder,
    backupData: BackupData,
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    switch (tableName) {
      case 'vehicles':
        await this.mergeVehicles(
          backupData.data.vehicles,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'paymentMethods':
        await this.mergePaymentMethods(
          backupData.data.paymentMethods,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'stations':
        await this.mergeStations(
          backupData.data.stations,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'shops':
        await this.mergeShops(
          backupData.data.shops,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'maintenanceItems':
        await this.mergeMaintenanceItems(
          backupData.data.maintenanceItems,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'fuelRecords':
        await this.mergeFuelRecords(
          backupData.data.fuelRecords,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'maintenanceRecords':
        await this.mergeMaintenanceRecords(
          backupData.data.maintenanceRecords,
          idMapping,
          mergeResult,
          options,
        );
        break;
      case 'maintenancePlans':
        await this.mergeMaintenancePlans(
          backupData.data.maintenancePlans,
          idMapping,
          mergeResult,
          options,
        );
        break;
    }
  }

  // 차량 복원
  private static async restoreVehicles(
    backupVehicles: VehicleBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
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

      addIdMapping(backupVehicle.id, newVehicle.id, 'vehicles', idMapping);
      mergeResult.vehicles.added++;
    }
  }

  // 결제수단 복원
  private static async restorePaymentMethods(
    backupMethods: PaymentMethodBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupMethod of backupMethods) {
      const newMethod = await database
        .get<PaymentMethod>('payment_methods')
        .create((method) => {
          method.name = backupMethod.name;
          method.type = backupMethod.type;
        });

      addIdMapping(backupMethod.id, newMethod.id, 'paymentMethods', idMapping);
      mergeResult.paymentMethods.added++;
    }
  }

  // 주유소 복원
  private static async restoreStations(
    backupStations: StationBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupStation of backupStations) {
      const newStation = await database
        .get<Station>('stations')
        .create((station) => {
          station.name = backupStation.name;
          station.type = backupStation.type;
        });

      addIdMapping(backupStation.id, newStation.id, 'stations', idMapping);
      mergeResult.stations.added++;
    }
  }

  // 정비소 복원
  private static async restoreShops(
    backupShops: ShopBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupShop of backupShops) {
      const newShop = await database.get<Shop>('shops').create((shop) => {
        shop.name = backupShop.name;
      });

      addIdMapping(backupShop.id, newShop.id, 'shops', idMapping);
      mergeResult.shops.added++;
    }
  }

  // 정비항목 복원
  private static async restoreMaintenanceItems(
    backupItems: MaintenanceItemBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupItem of backupItems) {
      const newItem = await database
        .get<MaintenanceItem>('maintenance_items')
        .create((item) => {
          item.name = backupItem.name;
          item.maintenanceKm = backupItem.maintenanceKm;
          item.maintenanceMonth = backupItem.maintenanceMonth;
        });

      addIdMapping(backupItem.id, newItem.id, 'maintenanceItems', idMapping);
      mergeResult.maintenanceItems.added++;
    }
  }

  // 연료기록 복원 (외래키 참조 업데이트)
  private static async restoreFuelRecords(
    backupRecords: FuelRecordBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
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

      addIdMapping(backupRecord.id, newRecord.id, 'fuelRecords', idMapping);
      mergeResult.fuelRecords.added++;
    }
  }

  // 정비기록 복원 (외래키 참조 업데이트)
  private static async restoreMaintenanceRecords(
    backupRecords: MaintenanceRecordBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupRecord of backupRecords) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupRecord, idMapping);

      const newRecord = await database
        .get<MaintenanceRecord>('maintenance_records')
        .create((record) => {
          record.vehicleId = updatedData.vehicleId as string;
          record.date = backupRecord.date;
          record.odometer = backupRecord.odometer;
          record.maintenanceItemId = updatedData.maintenanceItemId as string;
          record.cost = backupRecord.cost;
          record.isDiy = backupRecord.isDiy;
          record.shopId = updatedData.shopId as string;
          record.shopName = backupRecord.shopName;
          record.memo = backupRecord.memo;
        });

      addIdMapping(
        backupRecord.id,
        newRecord.id,
        'maintenanceRecords',
        idMapping,
      );
      mergeResult.maintenanceRecords.added++;
    }
  }

  // 정비계획 복원 (외래키 참조 업데이트)
  private static async restoreMaintenancePlans(
    backupPlans: MaintenancePlanBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
  ) {
    for (const backupPlan of backupPlans) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupPlan, idMapping);

      const newPlan = await database
        .get<MaintenancePlan>('maintenance_plans')
        .create((plan) => {
          plan.vehicleId = updatedData.vehicleId as string;
          plan.plannedDate = backupPlan.plannedDate;
          plan.itemId = updatedData.itemId as string;
          plan.memo = backupPlan.memo;
        });

      addIdMapping(backupPlan.id, newPlan.id, 'maintenancePlans', idMapping);
      mergeResult.maintenancePlans.added++;
    }
  }

  // 병합 메서드들 (기존 로직과 유사하지만 ID 매핑 포함)
  private static async mergeVehicles(
    backupVehicles: VehicleBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
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

        addIdMapping(backupVehicle.id, newVehicle.id, 'vehicles', idMapping);
        mergeResult.vehicles.added++;
      } else {
        addIdMapping(
          backupVehicle.id,
          existingVehicle.id,
          'vehicles',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupVehicle.createdAt > existingVehicle.createdAt
        ) {
          await existingVehicle.update((vehicle) => {
            vehicle.type = backupVehicle.type;
            vehicle.isDefault = backupVehicle.isDefault;
            vehicle.odometer = backupVehicle.odometer;
          });
          mergeResult.vehicles.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingVehicle.update((vehicle) => {
            vehicle.type = backupVehicle.type;
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

  // 나머지 병합 메서드들도 유사하게 구현...
  private static async mergePaymentMethods(
    backupMethods: PaymentMethodBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
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
        const newMethod = await database
          .get<PaymentMethod>('payment_methods')
          .create((method) => {
            method.name = backupMethod.name;
            method.type = backupMethod.type;
          });

        addIdMapping(
          backupMethod.id,
          newMethod.id,
          'paymentMethods',
          idMapping,
        );
        mergeResult.paymentMethods.added++;
      } else {
        addIdMapping(
          backupMethod.id,
          existingMethod.id,
          'paymentMethods',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupMethod.createdAt > existingMethod.createdAt
        ) {
          await existingMethod.update((method) => {
            method.type = backupMethod.type;
          });
          mergeResult.paymentMethods.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingMethod.update((method) => {
            method.type = backupMethod.type;
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
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
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
        const newStation = await database
          .get<Station>('stations')
          .create((station) => {
            station.name = backupStation.name;
            station.type = backupStation.type;
          });

        addIdMapping(backupStation.id, newStation.id, 'stations', idMapping);
        mergeResult.stations.added++;
      } else {
        addIdMapping(
          backupStation.id,
          existingStation.id,
          'stations',
          idMapping,
        );

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
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const existingShops = await database.get<Shop>('shops').query().fetch();

    for (const backupShop of backupShops) {
      const existingShop = existingShops.find(
        (s) => s.name === backupShop.name,
      );

      if (!existingShop) {
        const newShop = await database.get<Shop>('shops').create((shop) => {
          shop.name = backupShop.name;
        });

        addIdMapping(backupShop.id, newShop.id, 'shops', idMapping);
        mergeResult.shops.added++;
      } else {
        addIdMapping(backupShop.id, existingShop.id, 'shops', idMapping);
        mergeResult.shops.skipped++;
      }
    }
  }

  private static async mergeMaintenanceItems(
    backupItems: MaintenanceItemBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
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
        const newItem = await database
          .get<MaintenanceItem>('maintenance_items')
          .create((item) => {
            item.name = backupItem.name;
            item.maintenanceKm = backupItem.maintenanceKm;
            item.maintenanceMonth = backupItem.maintenanceMonth;
          });

        addIdMapping(backupItem.id, newItem.id, 'maintenanceItems', idMapping);
        mergeResult.maintenanceItems.added++;
      } else {
        addIdMapping(
          backupItem.id,
          existingItem.id,
          'maintenanceItems',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupItem.createdAt > existingItem.createdAt
        ) {
          await existingItem.update((item) => {
            item.maintenanceKm = backupItem.maintenanceKm;
            item.maintenanceMonth = backupItem.maintenanceMonth;
          });
          mergeResult.maintenanceItems.updated++;
        } else if (options.strategy === 'backup_first') {
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

  private static async mergeFuelRecords(
    backupRecords: FuelRecordBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const existingRecords = await database
      .get<FuelRecord>('fuel_records')
      .query()
      .fetch();

    for (const backupRecord of backupRecords) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupRecord, idMapping);

      const existingRecord = existingRecords.find(
        (r) =>
          r.vehicleId === updatedData.vehicleId &&
          r.date === backupRecord.date &&
          r.odometer === backupRecord.odometer,
      );

      if (!existingRecord) {
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

        addIdMapping(backupRecord.id, newRecord.id, 'fuelRecords', idMapping);
        mergeResult.fuelRecords.added++;
      } else {
        addIdMapping(
          backupRecord.id,
          existingRecord.id,
          'fuelRecords',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = updatedData.paymentMethodId as string;
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = updatedData.stationId as string;
            fuelRecord.stationName = backupRecord.stationName;
            fuelRecord.memo = backupRecord.memo;
          });
          mergeResult.fuelRecords.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingRecord.update((fuelRecord) => {
            fuelRecord.totalCost = backupRecord.totalCost;
            fuelRecord.unitPrice = backupRecord.unitPrice;
            fuelRecord.amount = backupRecord.amount;
            fuelRecord.paymentMethodId = updatedData.paymentMethodId as string;
            fuelRecord.paymentName = backupRecord.paymentName;
            fuelRecord.paymentType = backupRecord.paymentType;
            fuelRecord.stationId = updatedData.stationId as string;
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

  private static async mergeMaintenanceRecords(
    backupRecords: MaintenanceRecordBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const existingRecords = await database
      .get<MaintenanceRecord>('maintenance_records')
      .query()
      .fetch();

    for (const backupRecord of backupRecords) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupRecord, idMapping);

      const existingRecord = existingRecords.find(
        (r) =>
          r.vehicleId === updatedData.vehicleId &&
          r.date === backupRecord.date &&
          r.maintenanceItemId === updatedData.maintenanceItemId,
      );

      if (!existingRecord) {
        const newRecord = await database
          .get<MaintenanceRecord>('maintenance_records')
          .create((record) => {
            record.vehicleId = updatedData.vehicleId as string;
            record.date = backupRecord.date;
            record.odometer = backupRecord.odometer;
            record.maintenanceItemId = updatedData.maintenanceItemId as string;
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = updatedData.shopId as string;
            record.shopName = backupRecord.shopName;
            record.memo = backupRecord.memo;
          });

        addIdMapping(
          backupRecord.id,
          newRecord.id,
          'maintenanceRecords',
          idMapping,
        );
        mergeResult.maintenanceRecords.added++;
      } else {
        addIdMapping(
          backupRecord.id,
          existingRecord.id,
          'maintenanceRecords',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupRecord.createdAt > existingRecord.createdAt
        ) {
          await existingRecord.update((record) => {
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = updatedData.shopId as string;
            record.shopName = backupRecord.shopName;
            record.memo = backupRecord.memo;
          });
          mergeResult.maintenanceRecords.updated++;
        } else if (options.strategy === 'backup_first') {
          await existingRecord.update((record) => {
            record.cost = backupRecord.cost;
            record.isDiy = backupRecord.isDiy;
            record.shopId = updatedData.shopId as string;
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

  private static async mergeMaintenancePlans(
    backupPlans: MaintenancePlanBackup[],
    idMapping: RestoreIdMapping,
    mergeResult: any,
    options: RestoreOptions,
  ) {
    const existingPlans = await database
      .get<MaintenancePlan>('maintenance_plans')
      .query()
      .fetch();

    for (const backupPlan of backupPlans) {
      // 외래키 참조 업데이트
      const updatedData = updateForeignKeyReferences(backupPlan, idMapping);

      const existingPlan = existingPlans.find(
        (p) =>
          p.vehicleId === updatedData.vehicleId &&
          p.itemId === updatedData.itemId &&
          p.plannedDate === backupPlan.plannedDate,
      );

      if (!existingPlan) {
        const newPlan = await database
          .get<MaintenancePlan>('maintenance_plans')
          .create((plan) => {
            plan.vehicleId = updatedData.vehicleId as string;
            plan.plannedDate = backupPlan.plannedDate;
            plan.itemId = updatedData.itemId as string;
            plan.memo = backupPlan.memo;
          });

        addIdMapping(backupPlan.id, newPlan.id, 'maintenancePlans', idMapping);
        mergeResult.maintenancePlans.added++;
      } else {
        addIdMapping(
          backupPlan.id,
          existingPlan.id,
          'maintenancePlans',
          idMapping,
        );

        if (
          options.strategy === 'smart' &&
          backupPlan.createdAt > existingPlan.createdAt
        ) {
          await existingPlan.update((plan) => {
            plan.memo = backupPlan.memo;
          });
          mergeResult.maintenancePlans.updated++;
        } else if (options.strategy === 'backup_first') {
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

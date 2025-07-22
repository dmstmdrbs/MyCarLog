import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Constants from 'expo-constants';

import {
  vehicleRepository,
  type CreateVehicleData,
} from '@/shared/repositories/VehicleRepository';
import { maintenanceItemRepository } from '@/shared/repositories/MaintenanceItemRepository';
import { fuelRecordRepository } from '@/shared/repositories/FuelRecordRepository';
import {
  maintenanceRecordRepository,
  type CreateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';
import { maintenancePlanRepository } from '@/shared/repositories/MaintenancePlanRepository';
import { paymentMethodRepository } from '@/shared/repositories/PaymentMethodRepository';
import { stationRepository } from '@/shared/repositories/StationRepository';
import { shopRepository } from '@/shared/repositories/ShopRepository';

// 백업 데이터 타입 정의
interface MaintenanceItemBackup {
  id: string;
  name: string;
  maintenanceKm?: number;
  maintenanceMonth?: number;
  createdAt: number;
}

interface PaymentMethodBackup {
  id: string;
  name: string;
  type: 'credit' | 'cash' | 'giftcard' | 'etc';
  createdAt: number;
}

interface StationBackup {
  id: string;
  name: string;
  type: 'gas' | 'ev';
  createdAt: number;
}

interface ShopBackup {
  id: string;
  name: string;
  createdAt: number;
}

interface VehicleBackup {
  id: string;
  type: 'ICE' | 'EV';
  nickname: string;
  manufacturer: string;
  model: string;
  isDefault: boolean;
  odometer: number;
  createdAt: number;
}

interface FuelRecordBackup {
  id: string;
  vehicleId: string;
  date: number;
  totalCost: number;
  unitPrice: number;
  amount: number;
  paymentMethodId: string;
  paymentName: string;
  paymentType: 'credit' | 'cash' | 'giftcard' | 'etc';
  stationId: string;
  stationName: string;
  memo: string;
  odometer: number;
  createdAt: number;
}

interface MaintenanceRecordBackup {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  maintenanceItemId: string;
  cost: number;
  isDiy: boolean;
  shopId: string;
  shopName: string;
  memo: string;
  createdAt: number;
}

interface MaintenancePlanBackup {
  id: string;
  vehicleId: string;
  plannedDate: number;
  itemId: string;
  memo: string;
  createdAt: number;
}

interface ReferenceMappings {
  maintenanceItems: { [originalId: string]: string };
  paymentMethods: { [originalId: string]: string };
  stations: { [originalId: string]: string };
  shops: { [originalId: string]: string };
}

interface RestoreResult {
  success: boolean;
  error?: string;
  newVehicleId?: string;
  newVehicleName?: string;
  mappings?: ReferenceMappings;
  stats?: {
    maintenanceItemsAdded: number;
    paymentMethodsAdded: number;
    stationsAdded: number;
    shopsAdded: number;
    fuelRecordsAdded: number;
    maintenanceRecordsAdded: number;
    maintenancePlansAdded: number;
  };
}

interface VehicleBackupData {
  version: string;
  createdAt: number;
  appVersion: string;

  // 계정 귀속 데이터 (항상 포함)
  accountData: {
    maintenanceItems: MaintenanceItemBackup[];
    paymentMethods: PaymentMethodBackup[];
    stations: StationBackup[];
    shops: ShopBackup[];
  };

  // 선택된 차량 데이터
  selectedVehicle: {
    vehicle: VehicleBackup;
    fuelRecords: FuelRecordBackup[];
    maintenanceRecords: MaintenanceRecordBackup[];
    maintenancePlans: MaintenancePlanBackup[];
  };

  // 참조 매핑 정보 (복원 시 사용)
  referenceMapping: {
    originalIds: {
      vehicleId: string;
      maintenanceItemIds: string[];
      paymentMethodIds: string[];
      stationIds: string[];
      shopIds: string[];
    };
  };
}

export class VehicleBackupService {
  // 차량별 백업 생성
  static async createVehicleBackup(
    vehicleId: string,
  ): Promise<{ success: boolean; fileUri?: string; error?: string }> {
    try {
      // 차량 정보 조회
      const vehicle = await vehicleRepository.findById(vehicleId);
      if (!vehicle) {
        return { success: false, error: '차량을 찾을 수 없습니다.' };
      }

      // 백업 데이터 생성
      const backupData: VehicleBackupData = {
        version: '1.0',
        createdAt: Date.now(),
        appVersion: Constants.expoConfig?.version || '1.0.0',

        accountData: {
          maintenanceItems: [],
          paymentMethods: [],
          stations: [],
          shops: [],
        },

        selectedVehicle: {
          vehicle: {
            id: '',
            type: 'ICE',
            nickname: '',
            manufacturer: '',
            model: '',
            isDefault: false,
            odometer: 0,
            createdAt: 0,
          },
          fuelRecords: [],
          maintenanceRecords: [],
          maintenancePlans: [],
        },

        referenceMapping: {
          originalIds: {
            vehicleId: '',
            maintenanceItemIds: [],
            paymentMethodIds: [],
            stationIds: [],
            shopIds: [],
          },
        },
      };

      // 1. 계정 귀속 데이터 백업 (모든 데이터)
      backupData.accountData = await this.backupAccountData();

      // 2. 선택된 차량 데이터 백업
      backupData.selectedVehicle = await this.backupVehicleData(vehicleId);

      // 3. 참조 매핑 정보 저장
      backupData.referenceMapping =
        await this.createReferenceMapping(backupData);

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

  // 계정 귀속 데이터 백업
  private static async backupAccountData() {
    const maintenanceItems = await maintenanceItemRepository.findAll();
    const paymentMethods = await paymentMethodRepository.findAll();
    const stations = await stationRepository.findAll();
    const shops = await shopRepository.findAll();

    return {
      maintenanceItems: maintenanceItems.map((item) => ({
        id: item.id,
        name: item.name,
        maintenanceKm: item.maintenanceKm,
        maintenanceMonth: item.maintenanceMonth,
        createdAt: item.createdAt,
      })),
      paymentMethods: paymentMethods.map((method) => ({
        id: method.id,
        name: method.name,
        type: method.type,
        createdAt: method.createdAt,
      })),
      stations: stations.map((station) => ({
        id: station.id,
        name: station.name,
        type: station.type,
        createdAt: station.createdAt,
      })),
      shops: shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        createdAt: shop.createdAt,
      })),
    };
  }

  // 차량 데이터 백업
  private static async backupVehicleData(vehicleId: string) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle) {
      throw new Error('차량을 찾을 수 없습니다.');
    }

    const fuelRecords = await fuelRecordRepository.findByVehicleId(vehicleId);
    const maintenanceRecords =
      await maintenanceRecordRepository.findByVehicleId(vehicleId);
    const maintenancePlans =
      await maintenancePlanRepository.findByVehicleId(vehicleId);

    return {
      vehicle: {
        id: vehicle.id,
        type: vehicle.type,
        nickname: vehicle.nickname,
        manufacturer: vehicle.manufacturer,
        model: vehicle.model,
        isDefault: vehicle.isDefault,
        odometer: vehicle.odometer,
        createdAt: vehicle.createdAt,
      },
      fuelRecords: fuelRecords.map((record) => ({
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
      })),
      maintenanceRecords: maintenanceRecords.map((record) => ({
        id: record.id,
        vehicleId: record.vehicleId,
        date: record.date,
        odometer: record.odometer,
        maintenanceItemId: record.maintenanceItemId,
        cost: record.cost,
        isDiy: record.isDiy,
        shopId: record.shopId,
        shopName: record.shopName,
        memo: record.memo,
        createdAt: record.createdAt,
      })),
      maintenancePlans: maintenancePlans.map(
        (plan: {
          id: string;
          vehicleId: string;
          plannedDate: number;
          itemId: string;
          memo: string;
          createdAt: number;
        }) => ({
          id: plan.id,
          vehicleId: plan.vehicleId,
          plannedDate: plan.plannedDate,
          itemId: plan.itemId,
          memo: plan.memo,
          createdAt: plan.createdAt,
        }),
      ),
    };
  }

  // 참조 매핑 정보 생성
  private static async createReferenceMapping(backupData: VehicleBackupData) {
    const originalIds = {
      vehicleId: backupData.selectedVehicle.vehicle.id,
      maintenanceItemIds: backupData.accountData.maintenanceItems.map(
        (item) => item.id,
      ),
      paymentMethodIds: backupData.accountData.paymentMethods.map(
        (method) => method.id,
      ),
      stationIds: backupData.accountData.stations.map((station) => station.id),
      shopIds: backupData.accountData.shops.map((shop) => shop.id),
    };

    return { originalIds };
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

      if (
        !backupData.version ||
        !backupData.selectedVehicle?.vehicle ||
        !backupData.accountData
      ) {
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
  ): Promise<RestoreResult> {
    try {
      const result: RestoreResult = {
        success: true,
        newVehicleId: '',
        newVehicleName: '',
        mappings: {
          maintenanceItems: {},
          paymentMethods: {},
          stations: {},
          shops: {},
        },
        stats: {
          maintenanceItemsAdded: 0,
          paymentMethodsAdded: 0,
          stationsAdded: 0,
          shopsAdded: 0,
          fuelRecordsAdded: 0,
          maintenanceRecordsAdded: 0,
          maintenancePlansAdded: 0,
        },
      };

      // 1단계: 계정 귀속 데이터 복구 (참조 관계 매핑 생성)
      result.mappings = await this.restoreAccountData(
        backupData.accountData,
        result.stats!,
      );

      // 2단계: 새 차량 생성
      const newVehicle = await this.createNewVehicle(
        backupData.selectedVehicle.vehicle,
      );
      result.newVehicleId = newVehicle.id;
      result.newVehicleName = newVehicle.nickname;

      // 3단계: 차량 관련 데이터 복구 (매핑된 ID 사용)
      await this.restoreVehicleData(
        backupData.selectedVehicle,
        newVehicle.id,
        result.mappings!,
        result.stats!,
      );

      return result;
    } catch (error) {
      console.error('차량별 백업 복원 실패:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '복원에 실패했습니다.',
      };
    }
  }

  // 계정 귀속 데이터 복구 (참조 매핑 생성)
  private static async restoreAccountData(
    accountData: {
      maintenanceItems: MaintenanceItemBackup[];
      paymentMethods: PaymentMethodBackup[];
      stations: StationBackup[];
      shops: ShopBackup[];
    },
    stats: {
      maintenanceItemsAdded: number;
      paymentMethodsAdded: number;
      stationsAdded: number;
      shopsAdded: number;
      fuelRecordsAdded: number;
      maintenanceRecordsAdded: number;
      maintenancePlansAdded: number;
    },
  ): Promise<ReferenceMappings> {
    const mappings: ReferenceMappings = {
      maintenanceItems: {},
      paymentMethods: {},
      stations: {},
      shops: {},
    };

    // 정비 항목 복구 (이름 기반 매핑)
    for (const backupItem of accountData.maintenanceItems) {
      const existingItem = await this.findOrCreateMaintenanceItem(backupItem);
      mappings.maintenanceItems[backupItem.id] = existingItem.id;
      if (existingItem.isNew) stats.maintenanceItemsAdded++;
    }

    // 결제 수단 복구 (이름 기반 매핑)
    for (const backupMethod of accountData.paymentMethods) {
      const existingMethod = await this.findOrCreatePaymentMethod(backupMethod);
      mappings.paymentMethods[backupMethod.id] = existingMethod.id;
      if (existingMethod.isNew) stats.paymentMethodsAdded++;
    }

    // 주유소 복구 (이름 기반 매핑)
    for (const backupStation of accountData.stations) {
      const existingStation = await this.findOrCreateStation(backupStation);
      mappings.stations[backupStation.id] = existingStation.id;
      if (existingStation.isNew) stats.stationsAdded++;
    }

    // 정비소 복구 (이름 기반 매핑)
    for (const backupShop of accountData.shops) {
      const existingShop = await this.findOrCreateShop(backupShop);
      mappings.shops[backupShop.id] = existingShop.id;
      if (existingShop.isNew) stats.shopsAdded++;
    }

    return mappings;
  }

  // 정비 항목 찾기 또는 생성
  private static async findOrCreateMaintenanceItem(
    backupItem: MaintenanceItemBackup,
  ) {
    const existingItem = await maintenanceItemRepository.findByName(
      backupItem.name,
    );

    if (existingItem) {
      return { id: existingItem.id, isNew: false };
    } else {
      const newItem = await maintenanceItemRepository.create({
        name: backupItem.name,
        maintenanceKm: backupItem.maintenanceKm,
        maintenanceMonth: backupItem.maintenanceMonth,
      });
      return { id: newItem.id, isNew: true };
    }
  }

  // 결제 수단 찾기 또는 생성
  private static async findOrCreatePaymentMethod(
    backupMethod: PaymentMethodBackup,
  ) {
    const existingMethod = await paymentMethodRepository.findByName(
      backupMethod.name,
    );

    if (existingMethod) {
      return { id: existingMethod.id, isNew: false };
    } else {
      const newMethod = await paymentMethodRepository.create({
        name: backupMethod.name,
        type: backupMethod.type,
      });
      return { id: newMethod.id, isNew: true };
    }
  }

  // 주유소 찾기 또는 생성
  private static async findOrCreateStation(backupStation: StationBackup) {
    const existingStation = await stationRepository.findByName(
      backupStation.name,
    );

    if (existingStation) {
      return { id: existingStation.id, isNew: false };
    } else {
      const newStation = await stationRepository.create({
        name: backupStation.name,
        type: backupStation.type,
      });
      return { id: newStation.id, isNew: true };
    }
  }

  // 정비소 찾기 또는 생성
  private static async findOrCreateShop(backupShop: ShopBackup) {
    const existingShop = await shopRepository.findByName(backupShop.name);

    if (existingShop) {
      return { id: existingShop.id, isNew: false };
    } else {
      const newShop = await shopRepository.create({
        name: backupShop.name,
      });
      return { id: newShop.id, isNew: true };
    }
  }

  // 새 차량 생성
  private static async createNewVehicle(backupVehicle: VehicleBackup) {
    const createVehicleData: CreateVehicleData = {
      type: backupVehicle.type,
      nickname: backupVehicle.nickname,
      manufacturer: backupVehicle.manufacturer,
      model: backupVehicle.model,
      isDefault: false, // 새로 생성된 차량은 기본값이 아님
    };

    const newVehicle = await vehicleRepository.create(createVehicleData);

    // odometer는 별도로 업데이트 (CreateVehicleData에 포함되지 않음)
    await vehicleRepository.update(newVehicle.id, {
      odometer: backupVehicle.odometer,
    });

    return newVehicle;
  }

  // 차량 데이터 복구 (매핑된 ID 사용)
  private static async restoreVehicleData(
    vehicleData: {
      fuelRecords: FuelRecordBackup[];
      maintenanceRecords: MaintenanceRecordBackup[];
      maintenancePlans: MaintenancePlanBackup[];
    },
    newVehicleId: string,
    mappings: ReferenceMappings,
    stats: {
      fuelRecordsAdded: number;
      maintenanceRecordsAdded: number;
      maintenancePlansAdded: number;
    },
  ) {
    // 연료 기록 복구
    for (const backupRecord of vehicleData.fuelRecords) {
      await fuelRecordRepository.create({
        vehicleId: newVehicleId,
        date: backupRecord.date,
        totalCost: backupRecord.totalCost,
        unitPrice: backupRecord.unitPrice,
        amount: backupRecord.amount,
        paymentMethodId: mappings.paymentMethods[backupRecord.paymentMethodId],
        paymentName: backupRecord.paymentName,
        paymentType: backupRecord.paymentType,
        stationId: mappings.stations[backupRecord.stationId],
        stationName: backupRecord.stationName,
        memo: backupRecord.memo,
        odometer: backupRecord.odometer,
      });
      stats.fuelRecordsAdded++;
    }

    // 정비 기록 복구
    for (const backupRecord of vehicleData.maintenanceRecords) {
      const createData: CreateMaintenanceRecordData = {
        vehicleId: newVehicleId,
        date: backupRecord.date,
        odometer: backupRecord.odometer,
        maintenanceItemId:
          mappings.maintenanceItems[backupRecord.maintenanceItemId],
        cost: backupRecord.cost,
        isDiy: backupRecord.isDiy,
        shopId: mappings.shops[backupRecord.shopId],
        shopName: backupRecord.shopName,
        memo: backupRecord.memo,
        paymentMethodId: '', // 기본값 설정
        paymentName: '', // 기본값 설정
        paymentType: 'cash', // 기본값 설정
      };
      await maintenanceRecordRepository.create(createData);
      stats.maintenanceRecordsAdded++;
    }

    // 정비 계획 복구
    for (const backupPlan of vehicleData.maintenancePlans) {
      await maintenancePlanRepository.create({
        vehicleId: newVehicleId,
        plannedDate: backupPlan.plannedDate,
        itemId: mappings.maintenanceItems[backupPlan.itemId],
        memo: backupPlan.memo,
      });
      stats.maintenancePlansAdded++;
    }
  }
}

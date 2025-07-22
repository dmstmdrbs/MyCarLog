// 백업 데이터의 전체 구조
export interface BackupData {
  version: string;
  createdAt: number;
  appVersion: string;
  data: {
    vehicles: VehicleBackup[];
    fuelRecords: FuelRecordBackup[];
    maintenanceRecords: MaintenanceRecordBackup[];
    maintenanceItems: MaintenanceItemBackup[];
    maintenancePlans: MaintenancePlanBackup[];
    paymentMethods: PaymentMethodBackup[];
    stations: StationBackup[];
    shops: ShopBackup[];
  };
}

// 각 모델별 백업 타입
export interface VehicleBackup {
  id: string;
  type: 'ICE' | 'EV';
  nickname: string;
  manufacturer: string;
  model: string;
  isDefault: boolean;
  odometer: number;
  createdAt: number;
  updatedAt: number;
}

export interface FuelRecordBackup {
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
  updatedAt: number;
}

// 정비 기록 백업 데이터
export interface MaintenanceRecordBackup {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  maintenanceItemId: string;
  maintenanceItemName?: string; // 정비항목 이름 추가
  cost: number;
  isDiy: boolean;
  shopId: string;
  shopName: string;
  memo: string;
  createdAt: number;
  updatedAt: number;
}

export interface MaintenanceItemBackup {
  id: string;
  name: string;
  maintenanceKm?: number;
  maintenanceMonth?: number;
  createdAt: number;
  updatedAt: number;
}

// 정비 계획 백업 데이터
export interface MaintenancePlanBackup {
  id: string;
  vehicleId: string;
  plannedDate: number;
  itemId: string;
  itemName?: string; // 정비항목 이름 추가
  memo: string;
  createdAt: number;
  updatedAt: number;
}

export interface PaymentMethodBackup {
  id: string;
  name: string;
  type: 'credit' | 'cash' | 'giftcard' | 'etc';
  createdAt: number;
  updatedAt: number;
}

export interface StationBackup {
  id: string;
  name: string;
  type: 'gas' | 'ev';
  createdAt: number;
  updatedAt: number;
}

export interface ShopBackup {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// 백업 결과 타입
export interface BackupResult {
  success: boolean;
  fileUri?: string;
  error?: string;
  dataCount?: {
    vehicles: number;
    fuelRecords: number;
    maintenanceRecords: number;
    maintenanceItems: number;
    maintenancePlans: number;
    paymentMethods: number;
    stations: number;
    shops: number;
  };
}

// 복원 결과 타입
export interface RestoreResult {
  success: boolean;
  error?: string;
  restoredCount?: {
    vehicles: number;
    fuelRecords: number;
    maintenanceRecords: number;
    maintenanceItems: number;
    maintenancePlans: number;
    paymentMethods: number;
    stations: number;
    shops: number;
  };
  mergeResult?: {
    vehicles: { added: number; updated: number; skipped: number };
    fuelRecords: { added: number; updated: number; skipped: number };
    maintenanceRecords: { added: number; updated: number; skipped: number };
    maintenanceItems: { added: number; updated: number; skipped: number };
    maintenancePlans: { added: number; updated: number; skipped: number };
    paymentMethods: { added: number; updated: number; skipped: number };
    stations: { added: number; updated: number; skipped: number };
    shops: { added: number; updated: number; skipped: number };
  };
}

export type MergeStrategy =
  | 'smart'
  | 'backup_first'
  | 'existing_first'
  | 'replace_all';

export interface MergeOptions {
  strategy: MergeStrategy;
  onConflict?: 'skip' | 'backup' | 'existing' | 'ask_user';
}

// ID 매핑 정보 (백업 ID -> 새로 생성된 ID)
export interface IdMapping {
  [backupId: string]: string;
}

// 복원 시 ID 매핑 정보
export interface RestoreIdMapping {
  vehicles: IdMapping;
  fuelRecords: IdMapping;
  maintenanceRecords: IdMapping;
  maintenanceItems: IdMapping;
  maintenancePlans: IdMapping;
  paymentMethods: IdMapping;
  stations: IdMapping;
  shops: IdMapping;
}

// 복원 순서 정의
export type RestoreTableOrder =
  | 'vehicles'
  | 'paymentMethods'
  | 'stations'
  | 'shops'
  | 'maintenanceItems'
  | 'fuelRecords'
  | 'maintenanceRecords'
  | 'maintenancePlans';

// 복원 옵션
export interface RestoreOptions {
  strategy: MergeStrategy;
  idMapping?: RestoreIdMapping;
}

// 차량별 백업 데이터 구조
export interface VehicleBackupData {
  version: string;
  createdAt: number;
  appVersion: string;
  vehicleId: string;
  vehicleName: string;
  vehicleInfo: {
    type: 'ICE' | 'EV';
    nickname: string;
    manufacturer: string;
    model: string;
    odometer: number;
  };
  data: {
    fuelRecords: FuelRecordBackup[];
    maintenanceRecords: MaintenanceRecordBackup[];
    maintenancePlans: MaintenancePlanBackup[];
    maintenanceItems: MaintenanceItemBackup[];
  };
}

// 차량별 복원 옵션
export interface VehicleRestoreOptions {
  createNewVehicle: boolean; // 새 차량 생성 여부
  mergeStrategy: MergeStrategy;
}

// 차량별 복원 결과
export interface VehicleRestoreResult {
  success: boolean;
  error?: string;
  targetVehicleId?: string;
  targetVehicleName?: string;
  mergeResult?: {
    fuelRecords: { added: number; updated: number; skipped: number };
    maintenanceRecords: { added: number; updated: number; skipped: number };
    maintenancePlans: { added: number; updated: number; skipped: number };
    maintenanceItems: { added: number; updated: number; skipped: number };
  };
}

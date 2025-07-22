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

export type MergeStrategy =
  | 'smart'
  | 'backup_first'
  | 'existing_first'
  | 'replace_all';

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

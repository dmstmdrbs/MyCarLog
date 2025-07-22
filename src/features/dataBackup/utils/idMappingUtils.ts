import { RestoreIdMapping, RestoreTableOrder } from '../types/backup.types';

/**
 * ID 매핑 정보를 초기화합니다.
 */
export const createEmptyIdMapping = (): RestoreIdMapping => ({
  vehicles: {},
  fuelRecords: {},
  maintenanceRecords: {},
  maintenanceItems: {},
  maintenancePlans: {},
  paymentMethods: {},
  stations: {},
  shops: {},
});

/**
 * 백업 ID를 새 ID로 변환합니다.
 */
export const mapBackupId = (
  backupId: string,
  tableName: keyof RestoreIdMapping,
  idMapping: RestoreIdMapping,
): string => {
  return idMapping[tableName][backupId] || backupId;
};

/**
 * 백업 ID를 새 ID로 변환하되, 매핑이 없으면 null을 반환합니다.
 */
export const mapBackupIdOrNull = (
  backupId: string,
  tableName: keyof RestoreIdMapping,
  idMapping: RestoreIdMapping,
): string | null => {
  return idMapping[tableName][backupId] || null;
};

/**
 * 새로 생성된 ID를 매핑에 추가합니다.
 */
export const addIdMapping = (
  backupId: string,
  newId: string,
  tableName: keyof RestoreIdMapping,
  idMapping: RestoreIdMapping,
): void => {
  idMapping[tableName][backupId] = newId;
};

/**
 * 외래키 참조를 업데이트합니다.
 */
export const updateForeignKeyReferences = (
  data: Record<string, unknown>,
  idMapping: RestoreIdMapping,
): Record<string, unknown> => {
  const updatedData = { ...data };

  // vehicleId 참조 업데이트
  if (updatedData.vehicleId && typeof updatedData.vehicleId === 'string') {
    updatedData.vehicleId = mapBackupId(
      updatedData.vehicleId as string,
      'vehicles',
      idMapping,
    );
  }

  // paymentMethodId 참조 업데이트
  if (
    updatedData.paymentMethodId &&
    typeof updatedData.paymentMethodId === 'string'
  ) {
    updatedData.paymentMethodId = mapBackupId(
      updatedData.paymentMethodId as string,
      'paymentMethods',
      idMapping,
    );
  }

  // stationId 참조 업데이트
  if (updatedData.stationId && typeof updatedData.stationId === 'string') {
    updatedData.stationId = mapBackupId(
      updatedData.stationId as string,
      'stations',
      idMapping,
    );
  }

  // shopId 참조 업데이트
  if (updatedData.shopId && typeof updatedData.shopId === 'string') {
    updatedData.shopId = mapBackupId(
      updatedData.shopId as string,
      'shops',
      idMapping,
    );
  }

  // maintenanceItemId 참조 업데이트
  if (
    updatedData.maintenanceItemId &&
    typeof updatedData.maintenanceItemId === 'string'
  ) {
    updatedData.maintenanceItemId = mapBackupId(
      updatedData.maintenanceItemId as string,
      'maintenanceItems',
      idMapping,
    );
  }

  // itemId 참조 업데이트 (MaintenancePlan)
  if (updatedData.itemId && typeof updatedData.itemId === 'string') {
    updatedData.itemId = mapBackupId(
      updatedData.itemId as string,
      'maintenanceItems',
      idMapping,
    );
  }

  return updatedData;
};

/**
 * 복원 순서를 정의합니다 (의존성 순서대로).
 */
export const getRestoreOrder = (): RestoreTableOrder[] => [
  'vehicles',
  'paymentMethods',
  'stations',
  'shops',
  'maintenanceItems',
  'fuelRecords',
  'maintenanceRecords',
  'maintenancePlans',
];

/**
 * 테이블의 의존성을 확인합니다.
 */
export const getTableDependencies = (
  tableName: RestoreTableOrder,
): RestoreTableOrder[] => {
  switch (tableName) {
    case 'vehicles':
      return [];
    case 'paymentMethods':
      return [];
    case 'stations':
      return [];
    case 'shops':
      return [];
    case 'maintenanceItems':
      return [];
    case 'fuelRecords':
      return ['vehicles', 'paymentMethods', 'stations'];
    case 'maintenanceRecords':
      return ['vehicles', 'maintenanceItems', 'shops'];
    case 'maintenancePlans':
      return ['vehicles', 'maintenanceItems'];
    default:
      return [];
  }
};

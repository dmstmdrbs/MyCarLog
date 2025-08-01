/**
 * Query Keys for TanStack Query
 *
 * 계층적 구조로 설계하여 효율적인 캐시 무효화(invalidation)를 지원합니다.
 *
 * 예시:
 * - vehicles: ['vehicles'] - 모든 차량 목록
 * - vehicles: ['vehicles', vehicleId] - 특정 차량
 * - fuelRecords: ['fuelRecords', vehicleId] - 특정 차량의 연료 기록
 */

export const queryKeys = {
  // Vehicle 관련 쿼리
  vehicles: {
    vehicles: () => ['vehicles'],
    vehicle: (id: string) => ['vehicle', id],
    defaultVehicle: () => ['vehicles', 'default'],
    stats: (vehicleId: string) => ['vehicle', vehicleId, 'stats'],
  },

  // FuelRecord 관련 쿼리
  fuelRecords: {
    all: () => ['fuelRecords'] as const,
    list: (vehicleId: string) => ['fuelRecords', 'list', vehicleId] as const,
    byMonth: (vehicleId: string, year: number, month: number) =>
      ['fuelRecords', 'list', vehicleId, 'month', year, month] as const,
    byDate: (vehicleId: string, date: number) => {
      const year = new Date(date).getFullYear();
      const month = new Date(date).getMonth() + 1;
      const day = new Date(date).getDate();

      return [
        'fuelRecords',
        'list',
        vehicleId,
        'year',
        year,
        'month',
        month,
        'day',
        day,
      ] as const;
    },
    byDateRange: (vehicleId: string, startDate: number, endDate: number) =>
      [
        'fuelRecords',
        'list',
        vehicleId,
        'dateRange',
        startDate,
        endDate,
      ] as const,
    detail: (id: string) => ['fuelRecords', 'detail', id] as const,
    // 통계 관련
    monthlyStats: (vehicleId: string, year: number, month: number) =>
      ['fuelRecords', 'list', vehicleId, 'stats', year, month] as const,
    // 관련 데이터
    recentStations: (vehicleId: string, limit?: number) =>
      ['fuelRecords', 'list', vehicleId, 'recentStations', limit] as const,
    monthlyStatsWithComparisons: (
      vehicleId: string,
      year: number,
      month: number,
    ) =>
      [
        'fuelRecords',
        'list',
        vehicleId,
        'stats',
        year,
        month,
        'comparison',
      ] as const,
    yearlyStats: (vehicleId: string, year: number) =>
      ['fuelRecords', 'list', vehicleId, 'year', year, 'stats'] as const,
  },

  // PaymentMethod 관련 쿼리
  paymentMethods: {
    all: () => ['paymentMethods'] as const,
    lists: () => [...queryKeys.paymentMethods.all(), 'list'] as const,
    list: (filters?: { type?: 'credit' | 'cash' | 'giftcard' | 'etc' }) =>
      [...queryKeys.paymentMethods.lists(), filters] as const,
    details: () => [...queryKeys.paymentMethods.all(), 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.paymentMethods.details(), id] as const,
    stats: (vehicleId: string, year: number, month: number) =>
      [
        'paymentMethods',
        'list',
        vehicleId,
        'month',
        year,
        month,
        'stats',
      ] as const,
  },

  // Station 관련 쿼리
  stations: {
    all: () => ['stations'] as const,
    lists: () => [...queryKeys.stations.all(), 'list'] as const,
    list: (filters?: { type?: 'gas' | 'ev' }) =>
      [...queryKeys.stations.lists(), filters] as const,
    search: (searchTerm: string) =>
      [...queryKeys.stations.lists(), 'search', searchTerm] as const,
    details: () => [...queryKeys.stations.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.stations.details(), id] as const,
    stats: () => [...queryKeys.stations.all(), 'stats'] as const,
    recent: (limit?: number) =>
      [...queryKeys.stations.lists(), 'recent', limit] as const,
  },

  // MaintenanceItem 관련 쿼리
  maintenanceItems: {
    all: () => ['maintenanceItems'] as const,
    lists: () => [...queryKeys.maintenanceItems.all(), 'list'] as const,
    details: () => [...queryKeys.maintenanceItems.all(), 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.maintenanceItems.details(), id] as const,
  },
} as const;

/**
 * 특정 영역의 캐시를 무효화할 때 사용하는 헬퍼 함수들
 */
export const invalidationHelpers = {
  // 차량 관련 모든 캐시 무효화
  invalidateVehicles: () => queryKeys.vehicles.vehicles(),

  invalidateVehicle: (vehicleId: string) =>
    queryKeys.vehicles.vehicle(vehicleId),

  invalidateDefaultVehicle: () => queryKeys.vehicles.defaultVehicle(),

  // 특정 차량의 연료 기록 관련 캐시 무효화
  invalidateFuelRecords: (vehicleId: string) =>
    queryKeys.fuelRecords.list(vehicleId),

  // 결제 수단 관련 모든 캐시 무효화
  invalidatePaymentMethods: () => queryKeys.paymentMethods.all(),

  // 주유소 관련 모든 캐시 무효화
  invalidateStations: () => queryKeys.stations.all(),

  // 정비 항목 관련 모든 캐시 무효화
  invalidateMaintenanceItems: () => queryKeys.maintenanceItems.all(),
};

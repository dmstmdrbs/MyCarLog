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
    lists: () => [...queryKeys.fuelRecords.all(), 'list'] as const,
    list: (vehicleId: string) =>
      [...queryKeys.fuelRecords.lists(), vehicleId] as const,
    byMonth: (vehicleId: string, year: number, month: number) =>
      [...queryKeys.fuelRecords.list(vehicleId), 'month', year, month] as const,
    byDateRange: (vehicleId: string, startDate: number, endDate: number) =>
      [
        ...queryKeys.fuelRecords.list(vehicleId),
        'dateRange',
        startDate,
        endDate,
      ] as const,
    details: () => [...queryKeys.fuelRecords.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.fuelRecords.details(), id] as const,

    // 통계 관련
    stats: (vehicleId: string) =>
      [...queryKeys.fuelRecords.list(vehicleId), 'stats'] as const,
    monthlyStats: (vehicleId: string, year: number, month: number) =>
      [
        ...queryKeys.fuelRecords.byMonth(vehicleId, year, month),
        'stats',
      ] as const,
    totalCost: (vehicleId: string) =>
      [...queryKeys.fuelRecords.stats(vehicleId), 'totalCost'] as const,
    totalAmount: (vehicleId: string) =>
      [...queryKeys.fuelRecords.stats(vehicleId), 'totalAmount'] as const,

    // 관련 데이터
    recentStations: (vehicleId: string, limit?: number) =>
      [
        ...queryKeys.fuelRecords.list(vehicleId),
        'recentStations',
        limit,
      ] as const,
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
    stats: () => [...queryKeys.paymentMethods.all(), 'stats'] as const,
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

  // 특정 차량의 연료 기록 관련 캐시 무효화
  invalidateFuelRecords: (vehicleId?: string) =>
    vehicleId
      ? queryKeys.fuelRecords.list(vehicleId)
      : queryKeys.fuelRecords.all(),

  // 결제 수단 관련 모든 캐시 무효화
  invalidatePaymentMethods: () => queryKeys.paymentMethods.all(),

  // 주유소 관련 모든 캐시 무효화
  invalidateStations: () => queryKeys.stations.all(),

  // 정비 항목 관련 모든 캐시 무효화
  invalidateMaintenanceItems: () => queryKeys.maintenanceItems.all(),
};

import { useFuelRecordsByDateRange } from '@/features/fuelRecord';
import { useMaintenanceRecordsByDate } from '@/features/maintenance/hooks/useMaintenanceRecordQueries';
import { useVehicleProfileSelector } from '@/features/vehicle';
import { FuelRecordType } from '@/shared/models/FuelRecord';
import { MaintenanceRecordType } from '@/shared/models/MaintenanceRecord';
import { format, subDays } from 'date-fns';
import { useMemo } from 'react';

type FuelRecord = FuelRecordType & {
  type: 'fuel';
  date: string;
  cost: number;
};

type MaintenanceRecord = MaintenanceRecordType & {
  type: 'maintenance';
  cost: number;
};

export type RecentRecord = FuelRecord | MaintenanceRecord;

const getRecordDate = (record: RecentRecord): number => {
  if (record.type === 'fuel') {
    return typeof record.date === 'number'
      ? record.date
      : new Date(record.date).getTime();
  } else if (record.type === 'maintenance') {
    return typeof record.date === 'string'
      ? new Date(record.date).getTime()
      : record.date;
  }
  return 0;
};

export const useRecentRecords = () => {
  const { selectedVehicle } = useVehicleProfileSelector();

  const now = useMemo(() => new Date(), []);
  const startDate = useMemo(() => subDays(now, 7), [now]);
  const endDate = useMemo(() => now, [now]);

  const { data: fuelRecords } = useFuelRecordsByDateRange(
    selectedVehicle?.id ?? '',
    startDate.getTime(),
    endDate.getTime(),
  );
  const { data: maintenanceRecords } = useMaintenanceRecordsByDate(
    selectedVehicle?.id ?? '',
    startDate,
    endDate,
  );

  // 최근 기록(주유 + 정비) 합치고 날짜 내림차순 정렬
  const recentRecords = useMemo(() => {
    // fuelRecords, maintenanceRecords가 undefined일 수 있으니 기본값 처리
    const recentFuelRecords =
      fuelRecords?.map(
        (record) =>
          ({
            ...record,
            date: format(new Date(record.date), 'yyyy-MM-dd'),
            type: 'fuel' as const,
            cost: record.totalCost,
          }) as RecentRecord,
      ) ?? ([] as RecentRecord[]);

    const recentMaintenanceRecords =
      maintenanceRecords?.map(
        (record) =>
          ({
            ...record,
            type: 'maintenance' as const,
            cost: record.cost,
          }) as RecentRecord,
      ) ?? ([] as RecentRecord[]);

    const allRecords: RecentRecord[] = [
      ...recentFuelRecords,
      ...recentMaintenanceRecords,
    ];

    // 내림차순 정렬
    return allRecords.sort((a, b) => getRecordDate(b) - getRecordDate(a));
  }, [selectedVehicle?.id, fuelRecords, maintenanceRecords]);

  return { recentRecords };
};

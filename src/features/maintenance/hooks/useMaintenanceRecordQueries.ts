import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceRecordRepository } from '@/shared/repositories/MaintenanceRecordRepository';
import type {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';
import { getMonth, getYear } from 'date-fns';
import MaintenanceRecord, {
  MaintenanceRecordType,
} from '@/shared/models/MaintenanceRecord';
import { vehicleRepository } from '@/shared/repositories/VehicleRepository';
import { queryKeys } from '@/shared/queries/queryKeys';
import { VehicleType } from '@/shared/models/Vehicle';

const recordToType = (record: MaintenanceRecord): MaintenanceRecordType => {
  return {
    id: record.id,
    date: record.date,
    odometer: record.odometer,
    maintenanceItemId: record.maintenanceItemId,
    cost: record.cost,
    isDiy: record.isDiy,
    shopId: record.shopId,
    shopName: record.shopName,
    memo: record.memo,
    createdAt: record.createdAt,
    vehicleId: record.vehicleId,
  };
};
// 쿼리 키 생성 함수
const maintenanceRecordsKey = (vehicleId: string) => [
  'maintenanceRecords',
  vehicleId,
];
const maintenanceRecordKey = (vehicleId: string, recordId: string) => [
  'maintenanceRecord',
  vehicleId,
  recordId,
];

const maintenanceRecordsByDateKey = (
  vehicleId: string,
  year: number,
  month: number,
) => ['maintenanceRecords', vehicleId, 'maintenanceRecordsByDate', year, month];
// 차량별 정비 기록 목록 조회
export function useMaintenanceRecords(vehicleId: string) {
  return useQuery({
    queryKey: maintenanceRecordsKey(vehicleId),
    queryFn: () => maintenanceRecordRepository.findByVehicleId(vehicleId),
    enabled: !!vehicleId,
    staleTime: 0,
    select(data) {
      if (!data) return [];
      return data.map((record) => recordToType(record));
    },
  });
}

export function useMaintenanceRecord(vehicleId: string, recordId: string) {
  return useQuery({
    queryKey: maintenanceRecordKey(vehicleId, recordId),
    queryFn: () => maintenanceRecordRepository.findById(recordId),
    enabled: !!vehicleId && !!recordId,
    select(data) {
      if (!data) return null;
      return recordToType(data);
    },
  });
}

export function useMaintenanceRecordsByDate(
  vehicleId: string,
  startDate: Date,
  endDate: Date,
) {
  return useQuery({
    queryKey: maintenanceRecordsByDateKey(
      vehicleId,
      getYear(endDate),
      getMonth(endDate),
    ),
    queryFn: () =>
      maintenanceRecordRepository.findByDateRange(
        vehicleId,
        startDate,
        endDate,
      ),
    enabled: !!vehicleId && !!startDate && !!endDate,
    staleTime: 0, // 1분
    select(data) {
      if (!data) return [];
      return data.map((record) => recordToType(record));
    },
  });
}

// 정비 기록 생성
export function useCreateMaintenanceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<CreateMaintenanceRecordData, 'vehicleId'>,
    ) => {
      const record = await maintenanceRecordRepository.create({
        ...data,
        vehicleId,
      });

      await vehicleRepository.updateVehicle(record.vehicleId, {
        odometer: data.odometer,
      });

      return record;
    },
    onSuccess: (data) => {
      // 차량 정보 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.vehicles(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.vehicle(vehicleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.defaultVehicle(),
      });
      queryClient.setQueryData<VehicleType>(
        queryKeys.vehicles.vehicle(data.vehicleId),
        (vehicle) => {
          if (!vehicle) return vehicle;
          return { ...vehicle, odometer: data.odometer };
        },
      );
      queryClient.setQueryData<VehicleType[]>(
        queryKeys.vehicles.vehicles(),
        (vehicles) => {
          if (!vehicles) return vehicles;
          return vehicles.map((v) =>
            v.id === data.vehicleId ? { ...v, odometer: data.odometer } : v,
          );
        },
      );
      queryClient.invalidateQueries({
        queryKey: maintenanceRecordsByDateKey(
          vehicleId,
          getYear(data.date),
          getMonth(data.date),
        ),
      });
      queryClient.invalidateQueries({
        queryKey: maintenanceRecordsKey(vehicleId),
      });
    },
  });
}

// 정비 기록 수정
export function useUpdateMaintenanceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      data: UpdateMaintenanceRecordData;
    }) => {
      const { id, data } = params;
      const record = await maintenanceRecordRepository.update(id, data);
      await vehicleRepository.updateVehicle(record.vehicleId, {
        odometer: data.odometer,
      });

      return record;
    },
    onSuccess: (data) => {
      // 차량 정보 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.vehicles(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.vehicle(vehicleId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.defaultVehicle(),
      });
      queryClient.setQueryData<VehicleType>(
        queryKeys.vehicles.vehicle(data.vehicleId),
        (vehicle) => {
          if (!vehicle) return vehicle;
          return { ...vehicle, odometer: data.odometer };
        },
      );
      queryClient.setQueryData<VehicleType[]>(
        queryKeys.vehicles.vehicles(),
        (vehicles) => {
          if (!vehicles) return vehicles;
          return vehicles.map((v) =>
            v.id === data.vehicleId ? { ...v, odometer: data.odometer } : v,
          );
        },
      );
      queryClient.invalidateQueries({
        queryKey: maintenanceRecordsKey(vehicleId),
      });
    },
  });
}

// 정비 기록 삭제
export function useDeleteMaintenanceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => maintenanceRecordRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: maintenanceRecordsKey(vehicleId),
      });
    },
  });
}

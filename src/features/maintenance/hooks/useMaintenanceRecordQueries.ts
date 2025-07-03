import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceRecordRepository } from '@/shared/repositories/MaintenanceRecordRepository';
import type {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';

// 쿼리 키 생성 함수
const maintenanceRecordsKey = (vehicleId: string) => [
  'maintenanceRecords',
  vehicleId,
];

// 차량별 정비 기록 목록 조회
export function useMaintenanceRecords(vehicleId: string) {
  return useQuery({
    queryKey: maintenanceRecordsKey(vehicleId),
    queryFn: () => maintenanceRecordRepository.findByVehicleId(vehicleId),
    enabled: !!vehicleId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

// 정비 기록 생성
export function useCreateMaintenanceRecord(vehicleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceRecordData) =>
      maintenanceRecordRepository.create(data),
    onSuccess: () => {
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
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMaintenanceRecordData;
    }) => maintenanceRecordRepository.update(id, data),
    onSuccess: () => {
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

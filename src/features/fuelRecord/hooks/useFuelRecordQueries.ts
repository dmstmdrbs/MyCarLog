import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidationHelpers } from '@shared/queries/queryKeys';
import { fuelRecordRepository } from '@shared/repositories';
import {
  CreateFuelRecordData,
  UpdateFuelRecordData,
  FuelRecordType,
  MonthlyFuelStats,
} from '@shared/models/FuelRecord';

/**
 * 특정 차량의 연료 기록 목록을 조회하는 Query Hook
 */
export const useFuelRecords = (vehicleId: string) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.list(vehicleId),
    queryFn: () => fuelRecordRepository.findByVehicleId(vehicleId),
    enabled: !!vehicleId,
    staleTime: 1000 * 60 * 2, // 2분간 fresh
  });
};

/**
 * 특정 차량의 월별 연료 기록을 조회하는 Query Hook
 */
export const useFuelRecordsByMonth = (
  vehicleId: string,
  year: number,
  month: number,
) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.byMonth(vehicleId, year, month),
    queryFn: () => fuelRecordRepository.findByMonth(vehicleId, year, month),
    enabled: !!vehicleId && !!year && !!month,
    staleTime: 1000 * 60 * 10, // 10분간 fresh (월별 데이터는 덜 자주 변경됨)
  });
};

export const useFuelRecordsByDateRange = (
  vehicleId: string,
  startDate: number,
  endDate: number,
) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.byDateRange(vehicleId, startDate, endDate),
    queryFn: () =>
      fuelRecordRepository.findByDateRange(vehicleId, startDate, endDate),
    enabled: !!vehicleId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 10, // 10분간 fresh
  });
};

/**
 * 특정 연료 기록을 조회하는 Query Hook
 */
export const useFuelRecord = (recordId: string) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.detail(recordId),
    queryFn: () => fuelRecordRepository.findById(recordId),
    enabled: !!recordId,
    staleTime: 1000 * 60 * 10, // 10분간 fresh
  });
};

/**
 * 특정 차량의 월별 연료 통계를 조회하는 Query Hook
 */
export const useFuelRecordMonthlyStats = (
  vehicleId: string,
  year: number,
  month: number,
) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.monthlyStats(vehicleId, year, month),
    queryFn: async (): Promise<MonthlyFuelStats> => {
      const stats = await fuelRecordRepository.getMonthlyStats(
        vehicleId,
        year,
        month,
      );
      return {
        year,
        month,
        totalCost: stats.totalCost,
        totalAmount: stats.totalAmount,
        averagePrice: stats.avgUnitPrice,
        recordCount: stats.recordCount,
      };
    },
    enabled: !!vehicleId && !!year && !!month,
    staleTime: 1000 * 60 * 15, // 15분간 fresh (통계는 덜 자주 변경됨)
  });
};

/**
 * 특정 차량의 최근 사용 주유소를 조회하는 Query Hook
 */
export const useRecentStations = (vehicleId: string, limit: number = 5) => {
  return useQuery({
    queryKey: queryKeys.fuelRecords.recentStations(vehicleId, limit),
    queryFn: () => fuelRecordRepository.getRecentStations(vehicleId, limit),
    enabled: !!vehicleId,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
  });
};

/**
 * 연료 기록 생성 Mutation Hook
 */
export const useCreateFuelRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFuelRecordData) =>
      fuelRecordRepository.create(data),
    onSuccess: (newRecord) => {
      // 해당 차량의 연료 기록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateFuelRecords(
          newRecord.vehicleId,
        ),
      });

      // 새 레코드를 개별 캐시에 설정
      queryClient.setQueryData(
        queryKeys.fuelRecords.detail(newRecord.id),
        newRecord,
      );

      // 월별 통계 캐시 무효화
      const recordDate = new Date(newRecord.date);
      queryClient.invalidateQueries({
        queryKey: queryKeys.fuelRecords.monthlyStats(
          newRecord.vehicleId,
          recordDate.getFullYear(),
          recordDate.getMonth() + 1,
        ),
      });

      // 최근 주유소 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: queryKeys.fuelRecords.recentStations(newRecord.vehicleId),
      });
    },
    onError: (error) => {
      console.error('연료 기록 생성 실패:', error);
    },
  });
};

/**
 * 연료 기록 수정 Mutation Hook
 */
export const useUpdateFuelRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFuelRecordData }) =>
      fuelRecordRepository.update(id, data),
    onSuccess: (updatedRecord) => {
      // 해당 차량의 연료 기록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateFuelRecords(
          updatedRecord.vehicleId,
        ),
      });

      // 수정된 레코드의 개별 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.fuelRecords.detail(updatedRecord.id),
        updatedRecord,
      );

      // 월별 통계 캐시 무효화
      const recordDate = new Date(updatedRecord.date);
      queryClient.invalidateQueries({
        queryKey: queryKeys.fuelRecords.monthlyStats(
          updatedRecord.vehicleId,
          recordDate.getFullYear(),
          recordDate.getMonth() + 1,
        ),
      });
    },
    onError: (error) => {
      console.error('연료 기록 수정 실패:', error);
    },
  });
};

/**
 * 연료 기록 삭제 Mutation Hook
 */
export const useDeleteFuelRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => fuelRecordRepository.delete(recordId),
    onMutate: async (recordId) => {
      // 삭제 전 기록 정보를 가져와 캐시 무효화에 사용
      const record = queryClient.getQueryData<FuelRecordType>(
        queryKeys.fuelRecords.detail(recordId),
      );
      return { record };
    },
    onSuccess: (_, recordId, context) => {
      const { record } = context || {};

      if (record) {
        // 해당 차량의 연료 기록 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: invalidationHelpers.invalidateFuelRecords(record.vehicleId),
        });

        // 월별 통계 캐시 무효화
        const recordDate = new Date(record.date);
        queryClient.invalidateQueries({
          queryKey: queryKeys.fuelRecords.monthlyStats(
            record.vehicleId,
            recordDate.getFullYear(),
            recordDate.getMonth() + 1,
          ),
        });
      }

      // 삭제된 레코드의 개별 캐시 제거
      queryClient.removeQueries({
        queryKey: queryKeys.fuelRecords.detail(recordId),
      });
    },
    onError: (error) => {
      console.error('연료 기록 삭제 실패:', error);
    },
  });
};

/**
 * 낙관적 업데이트를 사용한 연료 기록 수정 Hook
 */
export const useOptimisticUpdateFuelRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFuelRecordData }) =>
      fuelRecordRepository.update(id, data),

    // 낙관적 업데이트
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.fuelRecords.detail(id),
      });

      const previousRecord = queryClient.getQueryData<FuelRecordType>(
        queryKeys.fuelRecords.detail(id),
      );

      if (previousRecord) {
        const optimisticRecord = { ...previousRecord, ...data };
        queryClient.setQueryData(
          queryKeys.fuelRecords.detail(id),
          optimisticRecord,
        );
      }

      return { previousRecord };
    },

    onError: (error, { id }, context) => {
      if (context?.previousRecord) {
        queryClient.setQueryData(
          queryKeys.fuelRecords.detail(id),
          context.previousRecord,
        );
      }
      console.error('연료 기록 수정 실패:', error);
    },

    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.fuelRecords.detail(id),
      });
    },
  });
};

/**
 * 연료 기록 일괄 생성 Mutation Hook
 * 여러 개의 연료 기록을 한 번에 생성할 때 사용
 */
export const useBulkCreateFuelRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: CreateFuelRecordData[]) => {
      const results = [];
      for (const recordData of records) {
        const result = await fuelRecordRepository.create(recordData);
        results.push(result);
      }
      return results;
    },
    onSuccess: (newRecords) => {
      // 관련된 모든 차량의 캐시 무효화
      const vehicleIds = [
        ...new Set(newRecords.map((record) => record.vehicleId)),
      ];

      vehicleIds.forEach((vehicleId) => {
        queryClient.invalidateQueries({
          queryKey: invalidationHelpers.invalidateFuelRecords(vehicleId),
        });
      });

      // 각 레코드를 개별 캐시에 설정
      newRecords.forEach((record) => {
        queryClient.setQueryData(
          queryKeys.fuelRecords.detail(record.id),
          record,
        );
      });
    },
    onError: (error) => {
      console.error('연료 기록 일괄 생성 실패:', error);
    },
  });
};

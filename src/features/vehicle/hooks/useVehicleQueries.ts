import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidationHelpers } from '@shared/queries/queryKeys';
import { VehicleRepository } from '@shared/repositories';
import {
  CreateVehicleData,
  UpdateVehicleData,
  VehicleType,
} from '@shared/models/Vehicle';

// Repository 인스턴스
const vehicleRepository = new VehicleRepository();

/**
 * 모든 차량 목록을 조회하는 Query Hook
 */
export const useVehicles = () => {
  return useQuery({
    queryKey: queryKeys.vehicles.vehicles(),
    queryFn: async () => {
      return vehicleRepository.findAll();
    },
    staleTime: 0,
    initialData: [],
  });
};

/**
 * 기본 차량을 조회하는 Query Hook
 */
export const useDefaultVehicle = () => {
  return useQuery({
    queryKey: queryKeys.vehicles.defaultVehicle(),
    queryFn: () => vehicleRepository.findDefaultVehicle(),
    staleTime: 0,
    initialData: undefined,
  });
};

/**
 * 특정 차량을 조회하는 Query Hook
 */
export const useVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: queryKeys.vehicles.vehicle(vehicleId),
    queryFn: () => vehicleRepository.findById(vehicleId),
    enabled: !!vehicleId, // vehicleId가 있을 때만 실행
    staleTime: 0,
  });
};

/**
 * 차량 생성 Mutation Hook
 */
export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVehicleData) =>
      vehicleRepository.createVehicle(data),
    onSuccess: (newVehicle) => {
      // 차량 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateVehicles(),
      });

      // 새로 생성된 차량이 기본 차량이라면 기본 차량 캐시도 업데이트
      if (newVehicle.isDefault) {
        queryClient.setQueryData(
          queryKeys.vehicles.defaultVehicle(),
          newVehicle,
        );
      }

      // 새 차량을 개별 캐시에 설정
      queryClient.setQueryData(
        queryKeys.vehicles.vehicle(newVehicle.id),
        newVehicle,
      );
    },
    onError: (error) => {
      console.error('차량 생성 실패:', error);
    },
  });
};

/**
 * 차량 수정 Mutation Hook
 */
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleData }) =>
      vehicleRepository.updateVehicle(id, data),
    onSuccess: async (updatedVehicle, { id }) => {
      // 차량 목록 캐시 무효화
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: invalidationHelpers.invalidateVehicle(id),
        }),
        queryClient.invalidateQueries({
          queryKey: invalidationHelpers.invalidateVehicles(),
        }),
      ]);

      // 수정된 차량의 개별 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.vehicles.vehicle(updatedVehicle.id),
        updatedVehicle,
      );

      // 기본 차량이 변경된 경우 기본 차량 캐시 업데이트
      if (updatedVehicle.isDefault) {
        queryClient.setQueryData(
          queryKeys.vehicles.defaultVehicle(),
          updatedVehicle,
        );
      }
    },
    onError: (error) => {
      console.error('차량 수정 실패:', error);
    },
  });
};

/**
 * 차량 삭제 Mutation Hook
 */
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) =>
      vehicleRepository.deleteVehicle(vehicleId),
    onSuccess: (_, deletedVehicleId) => {
      // 삭제된 차량의 개별 캐시 제거
      queryClient.removeQueries({
        queryKey: queryKeys.vehicles.vehicle(deletedVehicleId),
      });

      // 삭제된 차량과 관련된 연료 기록 캐시도 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateFuelRecords(deletedVehicleId),
      });
      // 차량 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateVehicles(),
      });
    },
    onError: (error) => {
      console.error('차량 삭제 실패:', error);
    },
  });
};

/**
 * 기본 차량 설정 Mutation Hook
 */
export const useSetDefaultVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) =>
      vehicleRepository.setAsDefault(vehicleId),
    onSuccess: (updatedVehicle) => {
      // 차량 목록 캐시 무효화 (다른 차량들의 isDefault가 변경되므로)
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateVehicles(),
      });

      // 새 기본 차량 캐시 설정
      queryClient.setQueryData(
        queryKeys.vehicles.defaultVehicle(),
        updatedVehicle,
      );

      queryClient.setQueryData(
        queryKeys.vehicles.vehicle(updatedVehicle.id),
        updatedVehicle,
      );
    },
    onError: (error) => {
      console.error('기본 차량 설정 실패:', error);
    },
  });
};

/**
 * 낙관적 업데이트를 사용한 차량 수정 Hook
 * UI 반응성을 높이기 위해 사용
 */
export const useOptimisticUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleData }) =>
      vehicleRepository.updateVehicle(id, data),

    // 낙관적 업데이트
    onMutate: async ({ id, data }) => {
      // 진행 중인 쿼리들을 취소하여 낙관적 업데이트를 덮어쓰지 않도록 함
      await queryClient.cancelQueries({
        queryKey: queryKeys.vehicles.vehicle(id),
      });

      // 이전 값을 백업
      const previousVehicle = queryClient.getQueryData<VehicleType>(
        queryKeys.vehicles.vehicle(id),
      );

      // 낙관적으로 새 값을 설정
      if (previousVehicle) {
        const optimisticVehicle = { ...previousVehicle, ...data };
        queryClient.setQueryData(
          queryKeys.vehicles.vehicle(id),
          optimisticVehicle,
        );
      }

      // 백업 데이터 반환 (rollback에 사용)
      return { previousVehicle };
    },

    // 에러 발생 시 rollback
    onError: (error, { id }, context) => {
      if (context?.previousVehicle) {
        queryClient.setQueryData(
          queryKeys.vehicles.vehicle(id),
          context.previousVehicle,
        );
      }
      console.error('차량 수정 실패:', error);
    },

    // 성공 시 최신 데이터로 갱신
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vehicles.vehicle(id),
      });
    },
  });
};

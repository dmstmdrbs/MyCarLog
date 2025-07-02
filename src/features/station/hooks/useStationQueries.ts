import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidationHelpers } from '@shared/queries/queryKeys';
import { StationRepository } from '@shared/repositories';
import { CreateStationData, UpdateStationData } from '@shared/models/Station';

// Repository 인스턴스
const stationRepository = new StationRepository();

/**
 * 모든 주유소 목록을 조회하는 Query Hook
 */
export const useStations = (filters?: { type?: 'gas' | 'ev' }) => {
  return useQuery({
    queryKey: queryKeys.stations.list(filters),
    queryFn: async () => {
      if (filters?.type) {
        return stationRepository.findByType(filters.type);
      }
      return stationRepository.findAll();
    },
    staleTime: 1000 * 60 * 15, // 15분간 fresh (주유소는 자주 변경되지 않음)
    initialData: [],
  });
};

/**
 * 주유소 검색 Query Hook
 */
export const useStationSearch = (searchTerm: string) => {
  return useQuery({
    queryKey: queryKeys.stations.search(searchTerm),
    queryFn: () => stationRepository.searchByName(searchTerm),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5분간 fresh
  });
};

/**
 * 특정 주유소를 조회하는 Query Hook
 */
export const useStation = (stationId: string) => {
  return useQuery({
    queryKey: queryKeys.stations.detail(stationId),
    queryFn: () => stationRepository.findById(stationId),
    enabled: !!stationId,
    staleTime: 1000 * 60 * 15, // 15분간 fresh
  });
};

/**
 * 최근 사용한 주유소 목록을 조회하는 Query Hook
 */
export const useRecentStations = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.stations.recent(limit),
    queryFn: async () => {
      const stations = await stationRepository.findAll();
      // 최근 생성된 순으로 정렬
      return stations.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    },
    staleTime: 1000 * 60 * 5, // 5분간 fresh
  });
};

/**
 * 주유소 통계를 조회하는 Query Hook
 */
export const useStationStats = () => {
  return useQuery({
    queryKey: queryKeys.stations.stats(),
    queryFn: async () => {
      const stations = await stationRepository.findAll();
      return {
        total: stations.length,
        gasCount: stations.filter((s) => s.type === 'gas').length,
        evCount: stations.filter((s) => s.type === 'ev').length,
      };
    },
    staleTime: 1000 * 60 * 15, // 15분간 fresh
  });
};

/**
 * 주유소 생성 Mutation Hook
 */
export const useCreateStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStationData) => stationRepository.create(data),
    onSuccess: (newStation) => {
      // 주유소 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateStations(),
      });

      // 새 주유소를 개별 캐시에 설정
      queryClient.setQueryData(
        queryKeys.stations.detail(newStation.id),
        newStation,
      );
    },
    onError: (error) => {
      console.error('주유소 생성 실패:', error);
    },
  });
};

/**
 * 주유소 수정 Mutation Hook
 */
export const useUpdateStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStationData }) =>
      stationRepository.update(id, data),
    onSuccess: (updatedStation) => {
      // 주유소 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateStations(),
      });

      // 수정된 주유소의 개별 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.stations.detail(updatedStation.id),
        updatedStation,
      );
    },
    onError: (error) => {
      console.error('주유소 수정 실패:', error);
    },
  });
};

/**
 * 주유소 삭제 Mutation Hook
 */
export const useDeleteStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stationId: string) => stationRepository.delete(stationId),
    onSuccess: (_, deletedStationId) => {
      // 주유소 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidateStations(),
      });

      // 삭제된 주유소의 개별 캐시 제거
      queryClient.removeQueries({
        queryKey: queryKeys.stations.detail(deletedStationId),
      });
    },
    onError: (error) => {
      console.error('주유소 삭제 실패:', error);
    },
  });
};

/**
 * 주유소 이름 검증 Hook (중복 이름 체크)
 */
export const useValidateStationName = (name: string, excludeId?: string) => {
  return useQuery({
    queryKey: ['stations', 'validate', name, excludeId],
    queryFn: async () => {
      const stations = await stationRepository.findAll();
      const existingStation = stations.find(
        (s) =>
          s.name.toLowerCase() === name.toLowerCase() && s.id !== excludeId,
      );
      return !existingStation; // 중복이 없으면 true, 있으면 false
    },
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 5, // 5초간 fresh (빠른 검증을 위해)
  });
};

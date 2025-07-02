import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateMaintenanceItemData,
  maintenanceItemRepository,
  UpdateMaintenanceItemData,
} from '@shared/repositories';
import { queryKeys } from '@/shared/queries/queryKeys';

export const useMaintenanceQueries = () => {
  return useQuery({
    queryKey: queryKeys.maintenanceItems.lists(),
    queryFn: () => maintenanceItemRepository.findAll(),
  });
};

export const useMaintenanceItemQueries = (id: string) => {
  return useQuery({
    queryKey: queryKeys.maintenanceItems.detail(id),
    queryFn: () => maintenanceItemRepository.findById(id),
  });
};

export const useCreateMaintenanceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceItemData) => {
      return maintenanceItemRepository.create(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.detail(data.id),
      });
    },
  });
};

export const useUpdateMaintenanceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMaintenanceItemData;
    }) => {
      return maintenanceItemRepository.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.detail(data.id),
      });
    },
  });
};

export const useDeleteMaintenanceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return maintenanceItemRepository.delete(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.maintenanceItems.detail(id),
      });
    },
  });
};

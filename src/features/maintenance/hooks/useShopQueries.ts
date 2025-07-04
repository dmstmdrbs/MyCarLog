import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopRepository } from '@/shared/repositories/ShopRepository';
import Shop from '@/shared/models/Shop';

export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: () => shopRepository.findAll(),
  });
};

export const useShop = (id: string) => {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopRepository.findById(id),
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: Shop['name']) => shopRepository.createShop(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Shop) => shopRepository.updateShop(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopRepository.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

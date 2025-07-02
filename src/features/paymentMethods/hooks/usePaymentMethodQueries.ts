import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryKeys,
  invalidationHelpers,
} from '../../../shared/queries/queryKeys';
import {
  CreatePaymentMethodData,
  UpdatePaymentMethodData,
} from '../../../shared/models/PaymentMethod';
import { paymentMethodRepository } from '@/shared/repositories';

/**
 * 모든 결제 수단 목록을 조회하는 Query Hook
 */
export const usePaymentMethods = (filters?: {
  type?: 'credit' | 'cash' | 'giftcard' | 'etc';
}) => {
  return useQuery({
    queryKey: queryKeys.paymentMethods.list(filters),
    queryFn: async () => {
      if (filters?.type) {
        return paymentMethodRepository.findByType(filters.type);
      }
      return paymentMethodRepository.findAll();
    },
    staleTime: 1000 * 60 * 10, // 10분간 fresh (결제 수단은 자주 변경되지 않음)
  });
};

/**
 * 특정 결제 수단을 조회하는 Query Hook
 */
export const usePaymentMethod = (paymentMethodId: string) => {
  return useQuery({
    queryKey: queryKeys.paymentMethods.detail(paymentMethodId),
    queryFn: () => paymentMethodRepository.findById(paymentMethodId),
    enabled: !!paymentMethodId,
    staleTime: 1000 * 60 * 15, // 15분간 fresh
  });
};

/**
 * 결제 수단 통계를 조회하는 Query Hook
 */
export const usePaymentMethodStats = () => {
  return useQuery({
    queryKey: queryKeys.paymentMethods.stats(),
    queryFn: async () => {
      const paymentMethods = await paymentMethodRepository.findAll();
      return {
        total: paymentMethods.length,
        creditCount: paymentMethods.filter((pm) => pm.type === 'credit').length,
        cashCount: paymentMethods.filter((pm) => pm.type === 'cash').length,
        giftcardCount: paymentMethods.filter((pm) => pm.type === 'giftcard')
          .length,
        etcCount: paymentMethods.filter((pm) => pm.type === 'etc').length,
      };
    },
    staleTime: 1000 * 60 * 15, // 15분간 fresh
  });
};

/**
 * 결제 수단 생성 Mutation Hook
 */
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentMethodData) =>
      paymentMethodRepository.create(data),
    onSuccess: (newPaymentMethod) => {
      // 결제 수단 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidatePaymentMethods(),
      });

      // 새 결제 수단을 개별 캐시에 설정
      queryClient.setQueryData(
        queryKeys.paymentMethods.detail(newPaymentMethod.id),
        newPaymentMethod,
      );
    },
    onError: (error) => {
      console.error('결제 수단 생성 실패:', error);
    },
  });
};

/**
 * 결제 수단 수정 Mutation Hook
 */
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentMethodData }) =>
      paymentMethodRepository.update(id, data),
    onSuccess: (updatedPaymentMethod) => {
      // 결제 수단 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidatePaymentMethods(),
      });

      // 수정된 결제 수단의 개별 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.paymentMethods.detail(updatedPaymentMethod.id),
        updatedPaymentMethod,
      );
    },
    onError: (error) => {
      console.error('결제 수단 수정 실패:', error);
    },
  });
};

/**
 * 결제 수단 삭제 Mutation Hook
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentMethodRepository.delete(paymentMethodId),
    onSuccess: (_, deletedPaymentMethodId) => {
      // 결제 수단 목록 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: invalidationHelpers.invalidatePaymentMethods(),
      });

      // 삭제된 결제 수단의 개별 캐시 제거
      queryClient.removeQueries({
        queryKey: queryKeys.paymentMethods.detail(deletedPaymentMethodId),
      });
    },
    onError: (error) => {
      console.error('결제 수단 삭제 실패:', error);
    },
  });
};

/**
 * 결제 수단 검증 Hook (중복 이름 체크)
 */
export const useValidatePaymentMethodName = (
  name: string,
  excludeId?: string,
) => {
  return useQuery({
    queryKey: ['paymentMethods', 'validate', name, excludeId],
    queryFn: async () => {
      const paymentMethods = await paymentMethodRepository.findAll();
      const existingPaymentMethod = paymentMethods.find(
        (pm) =>
          pm.name.toLowerCase() === name.toLowerCase() && pm.id !== excludeId,
      );
      return !existingPaymentMethod; // 중복이 없으면 true, 있으면 false
    },
    enabled: !!name && name.length > 0,
    staleTime: 1000 * 5, // 5초간 fresh (빠른 검증을 위해)
  });
};

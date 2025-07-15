import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queries/queryKeys';
import { useCallback } from 'react';
import { fuelRecordRepository } from '@/shared/repositories/FuelRecordRepository';

export const useMonthlyStats = (
  vehicleId: string,
  year: number,
  month: number,
) => {
  // 월별 통계
  const getMonthlyStats = useCallback(async () => {
    return await fuelRecordRepository.getMonthlyStats(vehicleId, year, month);
  }, [vehicleId, year, month]);

  return useQuery({
    queryKey: queryKeys.fuelRecords.monthlyStats(vehicleId, year, month),
    queryFn: getMonthlyStats,
    staleTime: 0,
  });
};

export const usePaymentStats = (
  vehicleId: string,
  year: number,
  month: number,
) => {
  // 결제 수단별 통계
  const getPaymentStats = useCallback(async () => {
    return await fuelRecordRepository.getPaymentStatsByMonth(
      vehicleId,
      year,
      month,
    );
  }, [vehicleId, year, month]);

  return useQuery({
    queryKey: queryKeys.paymentMethods.stats(vehicleId, year, month),
    queryFn: getPaymentStats,
    staleTime: 0,
  });
};

export const useMonthlyStatsWithComparisons = (
  vehicleId: string,
  year: number,
  month: number,
) => {
  // 월별 비교 통계
  const getMonthlyStatsWithComparisons = useCallback(async () => {
    return await fuelRecordRepository.getMonthlyStatsWithComparisons(
      vehicleId,
      year,
      month,
    );
  }, [vehicleId, year, month]);

  return useQuery({
    queryKey: queryKeys.fuelRecords.monthlyStatsWithComparisons(
      vehicleId,
      year,
      month,
    ),
    queryFn: getMonthlyStatsWithComparisons,
    staleTime: 0,
  });
};

export const useYearlyStats = (vehicleId: string, year: number) => {
  // 연간 통계
  const getYearlyStats = useCallback(async () => {
    return await fuelRecordRepository.getYearlyStats(vehicleId, year);
  }, [vehicleId, year]);

  return useQuery({
    queryKey: queryKeys.fuelRecords.yearlyStats(vehicleId, year),
    queryFn: getYearlyStats,
    staleTime: 0,
  });
};

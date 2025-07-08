import { useCallback } from 'react';
import { fuelRecordRepository } from '@/shared/repositories/FuelRecordRepository';

// 실제 구현에서는 vehicleId, year, month 등 파라미터를 받아서 쿼리
export function useFuelStatistics(
  vehicleId: string,
  year: number,
  month: number,
) {
  // 월별 통계
  const getMonthlyStats = useCallback(async () => {
    return await fuelRecordRepository.getMonthlyStats(vehicleId, year, month);
  }, [vehicleId, year, month]);

  // 결제 수단별 통계
  const getPaymentStats = useCallback(async () => {
    return await fuelRecordRepository.getPaymentStatsByMonth(
      vehicleId,
      year,
      month,
    );
  }, [vehicleId, year, month]);

  // 월별 비교 통계
  const getMonthlyStatsWithComparisons = useCallback(async () => {
    return await fuelRecordRepository.getMonthlyStatsWithComparisons(
      vehicleId,
      year,
      month,
    );
  }, [vehicleId, year, month]);

  // 연간 통계
  const getYearlyStats = useCallback(async () => {
    return await fuelRecordRepository.getYearlyStats(vehicleId, year);
  }, [vehicleId, year]);

  return {
    getMonthlyStats,
    getPaymentStats,
    getMonthlyStatsWithComparisons,
    getYearlyStats,
  };
}

import { useQuery } from '@tanstack/react-query';
import { useFuelStatistics } from './useFuelStatistics';

interface UseFuelStatisticQueriesProps {
  vehicleId: string;
  year: number;
  month: number;
}

export function useFuelStatisticQueries({
  vehicleId,
  year,
  month,
}: UseFuelStatisticQueriesProps) {
  const {
    getMonthlyStats,
    getPaymentStats,
    getMonthlyStatsWithComparisons,
    getYearlyStats,
  } = useFuelStatistics(vehicleId, year, month);

  const monthlyStatsQuery = useQuery({
    queryKey: ['fuelStats', vehicleId, year, month],
    queryFn: getMonthlyStats,
    staleTime: 0,
  });

  const paymentStatsQuery = useQuery({
    queryKey: ['fuelPaymentStats', vehicleId, year, month],
    queryFn: getPaymentStats,
    staleTime: 0,
  });

  const comparisonStatsQuery = useQuery({
    queryKey: ['fuelStatsComparison', vehicleId, year, month],
    queryFn: getMonthlyStatsWithComparisons,
    staleTime: 0,
  });

  const yearlyStatsQuery = useQuery({
    queryKey: ['fuelYearlyStats', vehicleId, year],
    queryFn: getYearlyStats,
    staleTime: 0,
  });

  return {
    monthlyStatsQuery,
    paymentStatsQuery,
    comparisonStatsQuery,
    yearlyStatsQuery,
  };
}

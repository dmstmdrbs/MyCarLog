import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import { useFuelStatisticQueries } from '@/features/fuelStatistics';

import { Button, ButtonText } from '@shared/components/ui/button';
import { ChevronDownIcon, Icon } from '@shared/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel } from '@shared/components/ui/menu';
import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import {
  MonthlyStatsCard,
  MonthlyStatsCardSkeleton,
} from './ui/MonthlyStatsCard';
import {
  PaymentStatsBarChart,
  PaymentStatsBarChartSkeleton,
} from './ui/PaymentStatsBarChart';
import { YearlyStatsLineChart } from './ui/YearlyStatsLineChart';
import {
  ComparisonStatsCard,
  ComparisonStatsCardSkeleton,
} from './ui/ComparisonStatsCard';
import { VStack } from '@/shared/components/ui/vstack';
import { HStack } from '@/shared/components/ui/hstack';
import { Skeleton } from '@/shared/components/ui/skeleton';

// 최근 5년 생성
const now = new Date();
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

type Props = {
  vehicleId: string;
};

const useDebounce = (value: boolean, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export const FuelStatisticsView = ({ vehicleId }: Props) => {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const {
    monthlyStatsQuery,
    paymentStatsQuery,
    comparisonStatsQuery,
    yearlyStatsQuery,
  } = useFuelStatisticQueries({ vehicleId, year, month });

  const { data: monthlyStats, isLoading: monthlyStatsLoading } =
    monthlyStatsQuery;
  const { data: paymentStats, isLoading: paymentStatsLoading } =
    paymentStatsQuery;
  const { data: comparisonStats, isLoading: comparisonStatsLoading } =
    comparisonStatsQuery;
  const { data: yearlyStats, isLoading: yearlyStatsLoading } = yearlyStatsQuery;

  const debouncedMonthlyStatsLoading = useDebounce(monthlyStatsLoading, 300);
  const debouncedPaymentStatsLoading = useDebounce(paymentStatsLoading, 300);
  const debouncedComparisonStatsLoading = useDebounce(
    comparisonStatsLoading,
    300,
  );
  const debouncedYearlyStatsLoading = useDebounce(yearlyStatsLoading, 300);

  return (
    <VStack className="flex-1 h-full bg-background-light">
      <HStack className="flex-row justify-end h-18 p-2">
        <Box className="flex-row mb-2 space-x-2 gap-1 h-12 w-full items-center justify-end">
          <Menu
            trigger={(_props) => (
              <Button
                {..._props}
                className="px-3 py-2 border-b rounded h-12 w-18"
                variant="link"
              >
                <ButtonText className="flex-row items-center gap-1 text-lg h-full">
                  {year}년
                </ButtonText>
                <Icon as={ChevronDownIcon} className="text-gray-500" />
              </Button>
            )}
          >
            {years.map((y) => (
              <MenuItem
                key={y}
                onPress={() => {
                  setYear(y);
                }}
                textValue={`${y}년`}
                className="min-w-16"
              >
                <MenuItemLabel className="w-16">
                  <Text>{y}년</Text>
                </MenuItemLabel>
              </MenuItem>
            ))}
          </Menu>
          <Menu
            placement="bottom right"
            trigger={(_props) => (
              <Button
                {..._props}
                className="px-3 py-2 border-b rounded h-12 w-18"
                variant="link"
              >
                <ButtonText className="flex-row items-center gap-1 text-lg h-full">
                  {month}월
                </ButtonText>
                <Icon as={ChevronDownIcon} className="text-gray-500" />
              </Button>
            )}
          >
            {months.map((m) => (
              <MenuItem
                key={m}
                onPress={() => {
                  setMonth(m);
                }}
                textValue={`${m}월`}
                className="min-w-16"
              >
                <MenuItemLabel className="w-16">
                  <Text>{m}월</Text>
                </MenuItemLabel>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </HStack>

      <ScrollView className="flex-1 bg-white p-2">
        {/* 월별 주유 통계 카드 */}
        <Box className="h-24 w-full">
          {debouncedMonthlyStatsLoading || monthlyStatsQuery.error ? (
            <MonthlyStatsCardSkeleton />
          ) : (
            <MonthlyStatsCard
              totalCost={monthlyStats?.totalCost ?? 0}
              totalAmount={monthlyStats?.totalAmount ?? 0}
              avgUnitPrice={monthlyStats?.avgUnitPrice ?? 0}
              recordCount={monthlyStats?.recordCount ?? 0}
            />
          )}
        </Box>

        {/* 결제 수단별 지출 통계 차트 */}
        {debouncedPaymentStatsLoading || paymentStatsQuery.error ? (
          <PaymentStatsBarChartSkeleton />
        ) : (
          <PaymentStatsBarChart paymentStats={paymentStats ?? []} />
        )}

        <Box className="h-24 w-full mb-2">
          {/* 전월/전년 대비 통계 카드 */}
          {debouncedComparisonStatsLoading || comparisonStatsQuery.error ? (
            <ComparisonStatsCardSkeleton />
          ) : comparisonStats ? (
            <ComparisonStatsCard
              current={comparisonStats.current.totalCost ?? 0}
              prevMonth={comparisonStats.prevMonth.totalCost ?? 0}
              prevYear={comparisonStats.prevYear.totalCost ?? 0}
            />
          ) : null}
        </Box>

        <Box className="h-24 w-full mb-2">
          {/* 연간 통계 (월별) 라인차트 */}
          {debouncedYearlyStatsLoading || yearlyStatsQuery.error ? (
            <Skeleton className="h-56 rounded-xl w-full" />
          ) : (
            <YearlyStatsLineChart yearlyStats={yearlyStats ?? []} />
          )}
        </Box>
      </ScrollView>
    </VStack>
  );
};

import { useState } from 'react';
import { ScrollView } from 'react-native';

import { useFuelStatisticQueries } from '@/features/fuelStatistics';

import { Button, ButtonText } from '@shared/components/ui/button';
import { formatNumber } from '@shared/utils/format';
import { ChevronDownIcon, Icon } from '@shared/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel } from '@shared/components/ui/menu';
import { Box } from '@shared/components/ui/box';
import { Spinner } from '@shared/components/ui/spinner';
import { Text } from '@shared/components/ui/text';

// 최근 5년 생성
const now = new Date();
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

type Props = {
  vehicleId: string;
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

  return (
    <Box className="flex-1 p-4 space-y-4 bg-white">
      <Box className="flex-row justify-end">
        <Box className="flex-row mb-2 space-x-2 gap-1 h-12 w-full items-center justify-end">
          <Menu
            trigger={(_props, _state) => (
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
            trigger={(_props, _state) => (
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
      </Box>

      <ScrollView>
        <Text className="font-bold text-lg mb-2">월별 주유 통계</Text>
        {monthlyStatsLoading ? (
          <Text>
            <Spinner />
          </Text>
        ) : monthlyStatsQuery.error ? (
          <Text>에러!</Text>
        ) : monthlyStats ? (
          <Box>
            <Text>총 주유비: {formatNumber(monthlyStats?.totalCost ?? 0)}</Text>
            <Text>
              총 주유량: {formatNumber(monthlyStats?.totalAmount ?? 0)}
            </Text>
            <Text>
              평균 단가: {formatNumber(monthlyStats?.avgUnitPrice ?? 0)}
            </Text>
            <Text>
              주유 횟수: {formatNumber(monthlyStats?.recordCount ?? 0)}
            </Text>
          </Box>
        ) : (
          <Text>-</Text>
        )}

        <Text className="font-bold text-lg mt-4 mb-2">
          결제 수단별 지출 통계
        </Text>
        {paymentStatsLoading ? (
          <Text>
            <Spinner />
          </Text>
        ) : paymentStatsQuery.error ? (
          <Text>에러!</Text>
        ) : paymentStats?.length === 0 ? (
          <Text>-</Text>
        ) : (
          paymentStats?.map((stat, i) => (
            <Text key={i}>
              {stat.paymentType}: {formatNumber(stat.totalCost)}원 (
              {formatNumber(stat.usageCount)}회)
            </Text>
          ))
        )}

        <Text className="font-bold text-lg mt-4 mb-2">전월/전년 대비 통계</Text>
        {comparisonStatsLoading ? (
          <Text>
            <Spinner />
          </Text>
        ) : comparisonStatsQuery.error ? (
          <Text>에러!</Text>
        ) : comparisonStats ? (
          <Box>
            <Text>
              이번달: {formatNumber(comparisonStats?.current.totalCost ?? 0)}원
            </Text>
            <Text>
              전월: {formatNumber(comparisonStats?.prevMonth.totalCost ?? 0)}원
            </Text>
            <Text>
              전년동월: {formatNumber(comparisonStats?.prevYear.totalCost ?? 0)}
              원
            </Text>
          </Box>
        ) : (
          <Text>-</Text>
        )}

        <Text className="font-bold text-lg mt-4 mb-2">연간 통계 (월별)</Text>
        {yearlyStatsLoading ? (
          <Text>
            <Spinner />
          </Text>
        ) : yearlyStatsQuery.error ? (
          <Text>에러!</Text>
        ) : yearlyStats?.length === 0 ? (
          <Text>-</Text>
        ) : (
          yearlyStats?.map((stat, i) => (
            <Text key={i}>
              {stat.month}월: {formatNumber(stat.totalCost)}원 /{' '}
              {formatNumber(stat.totalAmount)}L /{' '}
              {formatNumber(stat.recordCount)}회
            </Text>
          ))
        )}
      </ScrollView>
    </Box>
  );
};

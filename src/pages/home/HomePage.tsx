import { useSelectedVehicle } from '@/features/vehicle';
import PageLayout from '@/shared/components/layout/PageLayout';

import { Center } from '@/shared/components/ui/center';
import { Heading } from '@/shared/components/ui/heading';
import { HStack } from '@/shared/components/ui/hstack';
import { Text } from '@/shared/components/ui/text';
import { VStack } from '@/shared/components/ui/vstack';
import { ProfileCard } from '@/widgets/vehicle/ProfileCard';
import { ScrollView } from 'react-native';
import { Divider } from '@/shared/components/ui/divider';
import { RecentRecords, useRecentRecords } from '@/widgets/home';
import { cn } from '@/shared/utils/cn';
import { formatNumber } from '@/shared/utils/format';
import { useMaintenanceRecordsByDate } from '@/features/maintenance/hooks/useMaintenanceRecordQueries';
import { useMemo } from 'react';
import { useFuelRecordsByDateRange } from '@/features/fuelRecord';

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <VStack
      className={cn(
        'p-4 bg-white rounded-lg border border-gray-100',
        className,
      )}
      space="md"
    >
      {children}
    </VStack>
  );
};

const CardHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <HStack className="justify-between">
      <Heading size="xl">{title}</Heading>
      {children}
    </HStack>
  );
};

const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <VStack space="md">{children}</VStack>;
};

export const HomePage = () => {
  const { selectedVehicle } = useSelectedVehicle();

  const { recentRecords } = useRecentRecords();

  const now = new Date();
  const localYear = now.getFullYear(); // 로컬 시간 기준 연도
  // 로컬 시간 기준으로 연도 시작/끝
  const firstDateOfYear = new Date(localYear, 0, 1, 0, 0, 0, 0);
  const lastDateOfYear = new Date(localYear, 11, 31, 23, 59, 59, 999);

  const { data: fuelRecords } = useFuelRecordsByDateRange(
    selectedVehicle?.id ?? '',
    firstDateOfYear.getTime(),
    lastDateOfYear.getTime(),
  );

  const { data: maintenanceRecords } = useMaintenanceRecordsByDate(
    selectedVehicle?.id ?? '',
    firstDateOfYear,
    lastDateOfYear,
  );

  const totalMaintenanceCost = useMemo(
    () =>
      maintenanceRecords?.reduce<number>(
        (acc, record) => acc + record.cost,
        0,
      ) ?? 0,
    [maintenanceRecords],
  );

  const totalFuelCost = useMemo(
    () =>
      fuelRecords?.reduce<number>((acc, record) => acc + record.totalCost, 0) ??
      0,
    [fuelRecords],
  );

  const totalYearCost = useMemo(
    () => totalMaintenanceCost + totalFuelCost,
    [totalMaintenanceCost, totalFuelCost],
  );

  return (
    <PageLayout>
      <ScrollView className="flex-1">
        <VStack space="md" className="p-4">
          <Card className="h-40 w-full p-0">
            <ProfileCard vehicle={selectedVehicle} />
          </Card>
          <Card>
            <CardHeader title="올해 지출 요약" />
            <Divider orientation="horizontal" />
            <VStack space="lg">
              <HStack className="items-center justify-center">
                <HStack className="items-center">
                  <Text className="text-gray-700" size="lg">
                    {localYear}년 {selectedVehicle?.nickname}에게{' '}
                    <Text className="font-bold text-primary-500" size="2xl">
                      {formatNumber(totalYearCost)}원
                    </Text>{' '}
                    지출했어요
                  </Text>
                </HStack>
              </HStack>

              <HStack className="p-4 gap-4 justify-evenly flex">
                <VStack className="items-center">
                  <Text size="lg">⛽️</Text>
                  <Text className="font-bold" size="lg">
                    {formatNumber(totalFuelCost)}원
                  </Text>
                  <Text className="text-gray-600" size="md">
                    주유
                  </Text>
                </VStack>
                <VStack className="items-center">
                  <Text size="lg">🔧</Text>
                  <Text className="font-bold" size="lg">
                    {formatNumber(totalMaintenanceCost)}원
                  </Text>
                  <Text className="text-gray-600" size="md">
                    정비
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>
          <Card>
            <CardHeader title="최근 관리 내역" />
            <Divider orientation="horizontal" />
            <CardContent>
              {recentRecords.length === 0 && (
                <Center>
                  <Text className="text-gray-400">
                    최근 7일간 관리 내역이 없습니다.
                  </Text>
                </Center>
              )}

              <RecentRecords records={recentRecords} />
            </CardContent>
          </Card>
        </VStack>
      </ScrollView>
    </PageLayout>
  );
};

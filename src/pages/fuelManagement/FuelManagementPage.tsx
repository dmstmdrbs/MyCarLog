import PageLayout from '@shared/components/layout/PageLayout';

import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { useSelectedVehicle } from '@features/vehicle';
import { Box } from '@/shared/components/ui/box';
import { Spinner } from '@/shared/components/ui/spinner';
import { FuelCalendarView } from '@/widgets/fuelManagement/FuelCalendarView';
import { FuelStatisticsView, Tab, TabItem } from '@/widgets/fuelManagement';
import { Icon } from '@/shared/components/ui/icon';
import { CalendarDaysIcon, ChartBarIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { FloatingAddButton } from '@/shared/components/FloatingAddButton';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FuelStackParamList } from './navigator';
import { FuelRecordList } from '@/widgets/fuelManagement/ui/FuelRecordList';
import { useFuelRecordsByDate } from '@/features/fuelRecord/hooks/useFuelRecordQueries';
import { getFuelUnit, getFuelUnitPrice } from '@/shared/utils/unitUtils';
import { Heading } from '@/shared/components/ui/heading';
import { Pressable } from 'react-native';
import {
  MonthlyStatsCard,
  MonthlyStatsCardSkeleton,
} from '@/widgets/fuelManagement/ui/MonthlyStatsCard';
import { useMonthlyStats } from '@/features/fuelStatistics';
import { VStack } from '@/shared/components/ui/vstack';
import { Text } from '@/shared/components/ui/text';
import { useCurrentDate } from '@/shared/hooks/useCurrentDate';

export type FuelManagementPageProps = NativeStackScreenProps<
  FuelStackParamList,
  'FuelMain'
>;

export const FuelManagementPage = ({ navigation }: FuelManagementPageProps) => {
  const { currentDate, setCurrentDate } = useCurrentDate();
  // 기본 차량이 있으면 그 차량, 없으면 첫 번째 차량, 둘 다 없으면 안내
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'statistics'>(
    'calendar',
  );
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );
  const {
    data: monthlyStats,
    isLoading: monthlyStatsLoading,
    isError: monthlyStatsError,
  } = useMonthlyStats(
    vehicle?.id || '',
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
  );

  const { data: fuelRecordsByDate } = useFuelRecordsByDate(
    selectedVehicle?.id || '',
    currentDate.getTime(),
  );

  const navigateToFuelRecord = useCallback(() => {
    if (!vehicle) return;

    navigation.navigate('FuelRecord', {
      vehicleId: vehicle.id,
      targetDate: format(currentDate, 'yyyy-MM-dd'),
    });
  }, [navigation, vehicle, currentDate]);

  if (vehicleLoading || !vehicle) {
    return (
      <PageLayout>
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
        </Box>
      </PageLayout>
    );
  }

  const unit = getFuelUnit(vehicle?.type);
  const unitPrice = getFuelUnitPrice(vehicle?.type);

  const { totalCost, totalAmount, avgUnitPrice, recordCount } =
    monthlyStats ?? {};
  return (
    <PageLayout>
      <Tab>
        <TabItem
          isActive={selectedTab === 'calendar'}
          label="캘린더"
          icon={
            <Icon
              as={CalendarDaysIcon}
              className={cn(
                selectedTab === 'calendar' ? 'text-white' : 'text-gray-600',
              )}
            />
          }
          onPress={() => setSelectedTab('calendar')}
        />
        <TabItem
          isActive={selectedTab === 'statistics'}
          label="통계"
          icon={
            <Icon
              as={ChartBarIcon}
              className={cn(
                selectedTab === 'statistics' ? 'text-white' : 'text-gray-600',
              )}
            />
          }
          onPress={() => setSelectedTab('statistics')}
        />
      </Tab>
      {selectedTab === 'calendar' && (
        <VStack className="flex-1">
          {/* 월별 통계 카드 */}
          <VStack>
            {monthlyStatsLoading ? (
              <MonthlyStatsCardSkeleton />
            ) : monthlyStatsError ? (
              <Box className="flex-1 justify-center items-center h-24">
                <Text>Error</Text>
              </Box>
            ) : monthlyStats ? (
              <MonthlyStatsCard
                totalCost={totalCost ?? 0}
                totalAmount={totalAmount ?? 0}
                avgUnitPrice={avgUnitPrice ?? 0}
                recordCount={recordCount ?? 0}
                hideIcon={true}
              />
            ) : null}

            <VStack className="max-h-1/2" space="sm">
              <Pressable
                onPress={() => setCalendarCollapsed((prev) => !prev)}
                className=" self-end px-4 py-1"
              >
                <Text>
                  {calendarCollapsed ? '캘린더 펼치기 ▲' : '캘린더 접기 ▼'}
                </Text>
              </Pressable>
              {!calendarCollapsed && (
                <FuelCalendarView
                  vehicleId={vehicle.id}
                  onDateChange={setCurrentDate}
                />
              )}
            </VStack>
          </VStack>
          <VStack className="flex-1">
            <Heading size="sm" className="px-4 py-2">
              {format(currentDate, 'yyyy-MM-dd')} 주유 내역
            </Heading>
            <Box className="py-0 flex-1 bg-white">
              <FuelRecordList
                fuelRecords={fuelRecordsByDate ?? []}
                unit={unit}
                unitPrice={unitPrice}
              />
            </Box>
          </VStack>
          <FloatingAddButton onPress={navigateToFuelRecord} />
        </VStack>
      )}
      {selectedTab === 'statistics' && (
        <FuelStatisticsView vehicleId={vehicle.id} />
      )}
    </PageLayout>
  );
};

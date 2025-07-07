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
import { useFuelRecordsByDateRange } from '@/features/fuelRecord/hooks/useFuelRecordQueries';
import { getFuelUnit, getFuelUnitPrice } from '@/shared/utils/unitUtils';
import { Heading } from '@/shared/components/ui/heading';
import { Pressable, Text } from 'react-native';
import { MonthlyStatsCard } from '@/widgets/fuelManagement/ui/MonthlyStatsCard';
import { useFuelStatisticQueries } from '@/features/fuelStatistics';
import { VStack } from '@/shared/components/ui/vstack';
import { Divider } from '@/shared/components/ui/divider';

type FuelManagementPageProps = NativeStackScreenProps<
  FuelStackParamList,
  'FuelMain'
>;

export const FuelManagementPage = ({ navigation }: FuelManagementPageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // 기본 차량이 있으면 그 차량, 없으면 첫 번째 차량, 둘 다 없으면 안내
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'statistics'>(
    'calendar',
  );
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );
  const { monthlyStatsQuery } = useFuelStatisticQueries({
    vehicleId: vehicle?.id || '',
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  });
  const { data: monthlyStats } = monthlyStatsQuery;

  const { data: fuelRecordsByDate } = useFuelRecordsByDateRange(
    vehicle?.id || '',
    currentDate.getTime(),
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
        <VStack className="flex-1 gap-4">
          {/* 월별 통계 카드 */}
          <VStack>
            {monthlyStats && (
              <MonthlyStatsCard
                totalCost={monthlyStats.totalCost ?? 0}
                totalAmount={monthlyStats.totalAmount ?? 0}
                avgUnitPrice={monthlyStats.avgUnitPrice ?? 0}
                recordCount={monthlyStats.recordCount ?? 0}
                hideIcon={true}
              />
            )}
            {monthlyStatsQuery.isLoading && (
              <Box className="flex-1 justify-center items-center h-24">
                <Spinner size="large" />
              </Box>
            )}
            {monthlyStatsQuery.isError && (
              <Box className="flex-1 justify-center items-center h-24">
                <Text>Error</Text>
              </Box>
            )}
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
          <Box className="flex flex-col px-4 flex-1 ">
            <Heading
              size="sm"
              className="bg-white py-3 border-b border-gray-200"
            >
              {format(currentDate, 'yyyy-MM-dd')} 주유 내역
            </Heading>
            <FuelRecordList
              fuelRecords={fuelRecordsByDate ?? []}
              unit={unit}
              unitPrice={unitPrice}
            />
          </Box>
          <FloatingAddButton onPress={navigateToFuelRecord} />
        </VStack>
      )}
      {selectedTab === 'statistics' && (
        <FuelStatisticsView vehicleId={vehicle.id} />
      )}
    </PageLayout>
  );
};

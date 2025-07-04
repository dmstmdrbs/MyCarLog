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

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );
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
        <Box className="flex-1">
          <FuelCalendarView
            vehicleId={vehicle.id}
            onDateChange={setCurrentDate}
          />
          <Box className="flex-1 mt-4 flex flex-col gap-2 px-4">
            <Heading size="sm">
              {format(currentDate, 'yyyy-MM-dd')} 주유 내역
            </Heading>
            <FuelRecordList
              fuelRecords={fuelRecordsByDate ?? []}
              unit={unit}
              unitPrice={unitPrice}
            />
          </Box>
          <FloatingAddButton onPress={navigateToFuelRecord} />
        </Box>
      )}
      {selectedTab === 'statistics' && (
        <FuelStatisticsView vehicleId={vehicle.id} />
      )}
    </PageLayout>
  );
};

import PageLayout from '@shared/components/layout/PageLayout';

import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { useSelectedVehicle } from '@features/vehicle';
import { Box } from '@/shared/components/ui/box';
import { Spinner } from '@/shared/components/ui/spinner';
import { FuelCalendarView } from '@/widgets/fuelManagement/FuelCalendarView';
import { FuelStatisticsView, Tab, TabItem } from '@/widgets/fuelManagement';
import { Icon } from '@/shared/components/ui/icon';
import { CalendarDaysIcon, ChartBarIcon } from 'lucide-react-native';
import { Fragment, useCallback, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { FloatingAddButton } from '@/shared/components/FloatingAddButton';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FuelStackParamList } from './navigator';

export const FuelManagementPage = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<FuelStackParamList, 'FuelRecord'>
    >();

  // 기본 차량이 있으면 그 차량, 없으면 첫 번째 차량, 둘 다 없으면 안내
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'statistics'>(
    'calendar',
  );

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );

  const [currentDate, setCurrentDate] = useState(new Date());

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
        <Fragment>
          <FuelCalendarView
            vehicleId={vehicle.id}
            onDateChange={setCurrentDate}
          />

          <FloatingAddButton onPress={navigateToFuelRecord} />
        </Fragment>
      )}
      {selectedTab === 'statistics' && (
        <FuelStatisticsView vehicleId={vehicle.id} />
      )}
    </PageLayout>
  );
};

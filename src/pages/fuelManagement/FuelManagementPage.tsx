import PageLayout from '@shared/components/layout/PageLayout';

import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { useSelectedVehicle } from '@features/vehicle';
import { Box } from '@/shared/components/ui/box';
import { Spinner } from '@/shared/components/ui/spinner';
import { FuelCalendarView } from '@/widgets/fuelManagement/FuelCalendarView';
import { FuelStatisticsView, Tab, TabItem } from '@/widgets/fuelManagement';
import { Icon } from '@/shared/components/ui/icon';
import { CalendarDaysIcon, ChartBarIcon } from 'lucide-react-native';
import { useState } from 'react';

export const FuelManagementPage = () => {
  // 기본 차량이 있으면 그 차량, 없으면 첫 번째 차량, 둘 다 없으면 안내
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'statistics'>(
    'calendar',
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );

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
          label="캘린더"
          icon={<Icon as={CalendarDaysIcon} />}
          onPress={() => setSelectedTab('calendar')}
        />
        <TabItem
          label="통계"
          icon={<Icon as={ChartBarIcon} />}
          onPress={() => setSelectedTab('statistics')}
        />
      </Tab>
      {selectedTab === 'calendar' && (
        <FuelCalendarView
          vehicleId={vehicle.id}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
      )}
      {selectedTab === 'statistics' && <FuelStatisticsView />}
    </PageLayout>
  );
};

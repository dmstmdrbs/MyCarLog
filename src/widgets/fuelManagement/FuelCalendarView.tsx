import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { DateData } from 'react-native-calendars';
import {
  useFuelRecordMonthlyStats,
  useFuelRecordsByDateRange,
} from '@/features/fuelRecord';
import { useState } from 'react';

import { format } from 'date-fns';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FuelStackParamList } from '@pages/fuelManagement/navigator';
import { useVehicle } from '@features/vehicle';
import { MonthlyStatsCard } from './MonthlyStatsCard';
import { FuelRecordList } from './FuelRecordList';
import { FloatingAddButton } from './FloatingAddButton';
import { FuelCalendar } from './FuelCalendar';
import { paymentMethodMap } from './paymentMethodMap';
import { getFuelUnit, getFuelUnitPrice } from './unitUtils';

type Props = {
  vehicleId: string;
};

export const FuelCalendarView = ({ vehicleId }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: vehicle } = useVehicle(vehicleId);
  const {
    data: monthlyStats,
    isLoading: monthlyStatsLoading,
    isError: monthlyStatsError,
  } = useFuelRecordMonthlyStats(vehicleId, currentYear, currentMonth);

  const { data: fuelRecordsByDate } = useFuelRecordsByDateRange(
    vehicleId,
    currentDate.getTime(),
    currentDate.getTime(),
  );

  const navigation =
    useNavigation<
      NativeStackNavigationProp<FuelStackParamList, 'FuelRecord'>
    >();

  const navigateToFuelRecord = () => {
    navigation.navigate('FuelRecord', {
      vehicleId: vehicleId,
      targetDate: format(currentDate, 'yyyy-MM-dd'),
    });
  };

  const handleDayPress = (day: any) => {
    setCurrentDate(new Date(day.dateString));
  };

  const handleMonthChange = (date: DateData) => {
    setCurrentDate(new Date(date.dateString));
  };

  if (monthlyStatsLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (monthlyStatsError) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Error</Text>
      </Box>
    );
  }

  if (!monthlyStats) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>No data</Text>
      </Box>
    );
  }

  const unit = getFuelUnit(vehicle?.type);
  const unitPrice = getFuelUnitPrice(vehicle?.type);

  return (
    // 월별 캘린더 뷰
    <Box className="flex-1">
      {/* 월별 통계 카드 */}
      <MonthlyStatsCard
        totalCost={monthlyStats.totalCost}
        totalAmount={monthlyStats.totalAmount}
        unit={unit}
      />

      {/* 캘린더 */}
      <FuelCalendar
        currentDate={currentDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={{
          [format(currentDate, 'yyyy-MM-dd')]: {
            selected: true,
            selectedColor: '#3B82F6',
          },
        }}
      />
      <Box className="flex-1">
        <Text className="text-md text-gray-500 mx-4 mt-4 mb-2 font-bold">
          {format(currentDate, 'yyyy-MM-dd')} 주유 내역
        </Text>
        <FuelRecordList
          fuelRecords={fuelRecordsByDate ?? []}
          unit={unit}
          unitPrice={unitPrice}
          paymentMethodMap={paymentMethodMap}
        />
      </Box>
      <FloatingAddButton onPress={navigateToFuelRecord} />
    </Box>
  );
};

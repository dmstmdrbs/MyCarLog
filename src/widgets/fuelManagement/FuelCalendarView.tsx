import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DateData } from 'react-native-calendars';

import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import {
  useFuelRecordsByDateRange,
  useFuelRecordsByMonth,
} from '@/features/fuelRecord';
import { useVehicle } from '@features/vehicle';
import { useFuelStatisticQueries } from '@/features/fuelStatistics';

import { MonthlyStatsCard } from './ui/MonthlyStatsCard';
import { FuelRecordList } from './ui/FuelRecordList';
import { Calendar } from '@shared/components/Calendar';
import { paymentMethodMap } from './constants/paymentMethodMap';
import { getFuelUnit, getFuelUnitPrice } from './utils/unitUtils';
import { MarkedDates } from 'react-native-calendars/src/types';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { calendarTheme } from '../../shared/constants/calendar';
import { Heading } from '@/shared/components/ui/heading';

type Props = {
  vehicleId: string;
  onDateChange?: (date: Date) => void;
};

export const FuelCalendarView = ({ vehicleId, onDateChange }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: vehicle } = useVehicle(vehicleId);
  const { monthlyStatsQuery } = useFuelStatisticQueries({
    vehicleId,
    year: currentYear,
    month: currentMonth,
  });
  const { data: monthlyStats } = monthlyStatsQuery;

  const { data: fuelRecordsByDate } = useFuelRecordsByDateRange(
    vehicleId,
    currentDate.getTime(),
    currentDate.getTime(),
  );

  const { data: fuelRecords } = useFuelRecordsByMonth(
    vehicleId,
    currentYear,
    currentMonth,
  );
  const records = useMemo(() => {
    return (
      fuelRecords?.map((record) =>
        format(new Date(record.date), 'yyyy-MM-dd'),
      ) ?? []
    );
  }, [fuelRecords]);

  const markedDates: MarkedDates = useMemo(() => {
    const selectedColor = calendarTheme.selectedColor;
    const dotColor = calendarTheme.accentColor1;
    return {
      [format(currentDate, 'yyyy-MM-dd')]: {
        selected: true,
        selectedColor,
      },
      ...(records.reduce<Record<string, MarkingProps>>((acc, record) => {
        const dot = {
          key: 'fuel',
          color: dotColor,
          selectedColor,
        };
        acc[record] = {
          dots: [dot],
          selected: currentDate.getTime() === new Date(record).getTime(),
          selectedColor,
        };
        return acc;
      }, {} as MarkedDates) ?? ({} as MarkedDates)),
    };
  }, [currentDate, records]);

  const handleDayPress = (day: DateData) => {
    setCurrentDate(new Date(day.dateString));
    onDateChange?.(new Date(day.dateString));
  };

  const handleMonthChange = (date: DateData) => {
    setCurrentDate(new Date(date.dateString));
    onDateChange?.(new Date(date.dateString));
  };

  if (monthlyStatsQuery.isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (monthlyStatsQuery.isError) {
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
        totalCost={monthlyStats.totalCost ?? 0}
        totalAmount={monthlyStats.totalAmount ?? 0}
        avgUnitPrice={monthlyStats.avgUnitPrice ?? 0}
        recordCount={monthlyStats.recordCount ?? 0}
        hideIcon={true}
      />

      {/* 캘린더 */}
      <Calendar
        currentDate={currentDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
      />
      <Box className="flex-1 mt-4 flex flex-col gap-2 px-4">
        <Heading size="md">
          {format(currentDate, 'yyyy-MM-dd')} 주유 내역
        </Heading>
        <FuelRecordList
          fuelRecords={fuelRecordsByDate ?? []}
          unit={unit}
          unitPrice={unitPrice}
          paymentMethodMap={paymentMethodMap}
        />
      </Box>
    </Box>
  );
};

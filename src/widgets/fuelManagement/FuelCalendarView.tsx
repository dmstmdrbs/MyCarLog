import { Fragment, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { DateData } from 'react-native-calendars';

import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { useFuelRecordsByMonth } from '@/features/fuelRecord';

import { useFuelStatisticQueries } from '@/features/fuelStatistics';

import { MonthlyStatsCard } from './ui/MonthlyStatsCard';

import { Calendar } from '@shared/components/Calendar';

import { MarkedDates } from 'react-native-calendars/src/types';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { calendarTheme } from '../../shared/constants/calendar';

type Props = {
  vehicleId: string;
  onDateChange?: (date: Date) => void;
};

export const FuelCalendarView = ({ vehicleId, onDateChange }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { monthlyStatsQuery } = useFuelStatisticQueries({
    vehicleId,
    year: currentYear,
    month: currentMonth,
  });
  const { data: monthlyStats } = monthlyStatsQuery;

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

  return (
    // 월별 캘린더 뷰
    <Fragment>
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
    </Fragment>
  );
};

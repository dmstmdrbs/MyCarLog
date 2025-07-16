import { Fragment, useMemo } from 'react';
import { format } from 'date-fns';
import { DateData } from 'react-native-calendars';

import { useFuelRecordsByMonth } from '@/features/fuelRecord';

import { Calendar } from '@shared/components/Calendar';

import { MarkedDates } from 'react-native-calendars/src/types';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { calendarTheme } from '../../shared/constants/calendar';
import { useCurrentDate } from '@/shared/hooks/useCurrentDate';

type Props = {
  initialDate: Date;
  vehicleId: string;
  onDateChange?: (date: Date) => void;
};

export const FuelCalendarView = ({
  initialDate,
  vehicleId,
  onDateChange,
}: Props) => {
  const { currentDate, setCurrentDate, dateString, year, month, timestamp } =
    useCurrentDate(initialDate);

  const { data: fuelRecords } = useFuelRecordsByMonth(vehicleId, year, month);
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
      [dateString]: {
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
  }, [currentDate, dateString, timestamp, records]);

  const handleDayPress = (day: DateData) => {
    setCurrentDate(new Date(day.dateString));
    onDateChange?.(new Date(day.dateString));
  };

  const handleMonthChange = (date: DateData) => {
    setCurrentDate(new Date(date.dateString));
    onDateChange?.(new Date(date.dateString));
  };

  return (
    // 월별 캘린더 뷰
    <Fragment>
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

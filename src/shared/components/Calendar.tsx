import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { calendarTheme } from '@/shared/constants/calendar';

interface FuelCalendarProps {
  currentDate: Date;
  onDayPress: (day: DateData) => void;
  onMonthChange?: (date: DateData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markedDates: Record<string, any>;
  enableSwipeMonths?: boolean;
}

export const Calendar = ({
  currentDate,
  onDayPress,
  onMonthChange,
  markedDates,
  enableSwipeMonths = false,
}: FuelCalendarProps) => {
  return (
    <RNCalendar
      onMonthChange={onMonthChange}
      monthFormat="yyyy년 MM월"
      initialDate={format(currentDate, 'yyyy-MM-dd')}
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="multi-dot"
      enableSwipeMonths={enableSwipeMonths}
      theme={{
        todayTextColor: calendarTheme.todayTextColor,
        dayTextColor: calendarTheme.dayTextColor,
        textDisabledColor: calendarTheme.textDisabledColor,
        arrowColor: calendarTheme.arrowColor,
      }}
    />
  );
};

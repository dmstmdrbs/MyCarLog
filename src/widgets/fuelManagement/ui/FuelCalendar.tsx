import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';

interface FuelCalendarProps {
  currentDate: Date;
  onDayPress: (day: DateData) => void;
  onMonthChange: (date: DateData) => void;
  markedDates: Record<string, any>;
}

export const FuelCalendar = ({
  currentDate,
  onDayPress,
  onMonthChange,
  markedDates,
}: FuelCalendarProps) => (
  <Calendar
    onMonthChange={onMonthChange}
    monthFormat="yyyy년 MM월"
    initialDate={format(currentDate, 'yyyy-MM-dd')}
    onDayPress={onDayPress}
    markedDates={markedDates}
    markingType="multi-dot"
    theme={{
      selectedDayBackgroundColor: '#3B82F6',
      selectedDayTextColor: '#ffffff',
      todayTextColor: '#3B82F6',
      dayTextColor: '#2D3748',
      textDisabledColor: '#CBD5E0',
    }}
  />
);

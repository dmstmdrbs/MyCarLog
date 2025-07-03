import { Calendar, DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { Icon } from '@/shared/components/ui/icon';
import { Circle } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { useEffect } from 'react';

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
}: FuelCalendarProps) => {
  useEffect(() => {
    console.log('markedDates', markedDates);
  }, [markedDates]);

  return (
    <Calendar
      onMonthChange={onMonthChange}
      monthFormat="yyyy년 MM월"
      initialDate={format(currentDate, 'yyyy-MM-dd')}
      onDayPress={onDayPress}
      markedDates={markedDates}
      markingType="multi-dot"
      enableSwipeMonths
      theme={{
        selectedDayBackgroundColor: '#3B82F6',
        selectedDayTextColor: '#0A4D68',
        todayTextColor: '#3B82F6',
        dayTextColor: '#2D3748',
        textDisabledColor: '#CBD5E0',
        arrowColor: '#0A4D68',
      }}
    />
  );
};

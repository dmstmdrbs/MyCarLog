import React from 'react';
import { FlatList } from 'react-native';
import {
  useMaintenanceRecords,
  useDeleteMaintenanceRecord,
} from '@/features/maintenance/hooks/useMaintenanceRecordQueries';
import { Box } from '@/shared/components/ui/box';
import { Heading } from '@/shared/components/ui/heading';
import { Text } from '@/shared/components/ui/text';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Divider } from '@/shared/components/ui/divider';
import { Spinner } from '@/shared/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogCloseButton,
  AlertDialogBackdrop,
} from '@/shared/components/ui/alert-dialog';
import { FloatingAddButton } from '@/shared/components/FloatingAddButton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaintenanceStackParamList } from './navigator';
import { useSelectedVehicle } from '@features/vehicle';
import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { Calendar } from '@/shared/components/Calendar';
import { useMemo, useState } from 'react';
import { DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { MarkedDates } from 'react-native-calendars/src/types';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { calendarTheme } from '@/shared/constants/calendar';

export const MaintenanceManagementPage = () => {
  const { selectedVehicle } = useSelectedVehicle();
  const vehicleId = selectedVehicle?.id || '';

  const { data: vehicle } = useVehicle(vehicleId);
  const { data: records, isLoading, error } = useMaintenanceRecords(vehicleId);
  const deleteMutation = useDeleteMaintenanceRecord(vehicleId);

  const [currentDate, setCurrentDate] = useState(new Date());
  // 삭제 다이얼로그 상태
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const navigation =
    useNavigation<
      NativeStackNavigationProp<MaintenanceStackParamList, 'MaintenanceMain'>
    >();

  const navigateToMaintenanceRecord = () => {
    if (!vehicle) return;
    navigation.navigate('MaintenanceRecord', {
      vehicleId: vehicle?.id || '',
      targetDate: format(currentDate, 'yyyy-MM-dd'),
    });
  };

  const handleDateChange = (day: DateData) => {
    setCurrentDate(new Date(day.dateString));
  };

  const markedDates: MarkedDates = useMemo(() => {
    const selectedColor = calendarTheme.selectedColor;
    const dotColor = calendarTheme.accentColor1;
    return {
      [format(currentDate, 'yyyy-MM-dd')]: {
        selected: true,
        selectedColor,
      },
      ...(records?.reduce<Record<string, MarkingProps>>((acc, record) => {
        const dot = {
          key: 'maintenance',
          color: dotColor,
          selectedColor,
        };
        acc[record.date] = {
          dots: [dot],
          selected: currentDate.getTime() === new Date(record.date).getTime(),
          selectedColor: '#C8E0E6',
        };
        return acc;
      }, {} as MarkedDates) ?? ({} as MarkedDates)),
    };
  }, [currentDate, records]);

  return (
    <Box className="flex-1 bg-white p-4">
      <Calendar
        currentDate={currentDate}
        onDayPress={handleDateChange}
        onMonthChange={handleDateChange}
        markedDates={markedDates}
      />

      <Divider orientation="horizontal" />
      <Box className="flex-1 mt-4 flex flex-col gap-2">
        <Heading size="md" className="mb-4">
          정비 기록
        </Heading>
        {isLoading && (
          <Box className="items-center justify-center flex-1">
            <Spinner />
          </Box>
        )}
        {error && (
          <Text className="text-error-600 mb-2">
            에러가 발생했습니다: {String(error)}
          </Text>
        )}
        {!isLoading && !error && (!records || records.length === 0) && (
          <Box className="flex-1 items-center justify-center bg-background-light">
            <Text className="text-typography-500 text-center">
              정비 기록이 없습니다.
            </Text>
          </Box>
        )}
        {Array.isArray(records) && records.length > 0 && (
          <FlatList
            data={Array.isArray(records) ? records : []}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={({ item }) => (
              <Box className="py-3 flex-row items-center justify-between">
                <Box>
                  <Text className="font-bold">
                    {item && typeof item.date === 'number'
                      ? new Date(item.date).toLocaleDateString()
                      : ''}
                  </Text>
                  <Text className="text-typography-700">
                    항목: {item?.maintenanceItemId ?? ''}
                  </Text>
                  <Text className="text-typography-700">
                    비용:{' '}
                    {typeof item?.cost === 'number'
                      ? item.cost.toLocaleString()
                      : ''}
                    원
                  </Text>
                  {item?.shopName ? (
                    <Text className="text-typography-500">
                      업체: {item.shopName}
                    </Text>
                  ) : null}
                  {item?.memo ? (
                    <Text className="text-typography-500">
                      메모: {item.memo}
                    </Text>
                  ) : null}
                </Box>
                <Button
                  action="negative"
                  size="sm"
                  onPress={() => setDeleteId(item.id)}
                  className="ml-2"
                >
                  <ButtonText>삭제</ButtonText>
                </Button>
              </Box>
            )}
            ListFooterComponent={<Box style={{ height: 24 }} />}
          />
        )}
      </Box>
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>정말 삭제하시겠습니까?</AlertDialogHeader>
          <AlertDialogBody>
            이 정비 기록을 삭제하면 복구할 수 없습니다.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" onPress={() => setDeleteId(null)}>
              <ButtonText>취소</ButtonText>
            </Button>
            <Button
              action="negative"
              onPress={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              <ButtonText>삭제</ButtonText>
            </Button>
          </AlertDialogFooter>
          <AlertDialogCloseButton />
        </AlertDialogContent>
      </AlertDialog>
      <FloatingAddButton onPress={navigateToMaintenanceRecord} />
    </Box>
  );
};

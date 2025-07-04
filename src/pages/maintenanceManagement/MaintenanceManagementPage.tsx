import React, { memo, useCallback, useLayoutEffect } from 'react';
import { FlatList } from 'react-native';
import {
  useDeleteMaintenanceRecord,
  useMaintenanceRecordsByDate,
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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaintenanceStackParamList } from './navigator';
import { useSelectedVehicle } from '@features/vehicle';
import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { Calendar } from '@/shared/components/Calendar';
import { useMemo } from 'react';
import { DateData } from 'react-native-calendars';
import { format } from 'date-fns';
import { MarkedDates } from 'react-native-calendars/src/types';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import { calendarTheme } from '@/shared/constants/calendar';
import PageLayout from '@/shared/components/layout/PageLayout';
import { formatNumber } from '@/shared/utils/format';
import { useMaintenanceItemQueries } from '@/features/maintenance/hooks/useMaintenanceItemQueries';

import { startOfMonth, endOfMonth } from 'date-fns';
import { Icon } from '@/shared/components/ui/icon';
import { TrashIcon } from 'lucide-react-native';
import MaintenanceRecord from '@/shared/models/MaintenanceRecord';

type MaintenanceManagementPageProps = NativeStackScreenProps<
  MaintenanceStackParamList,
  'MaintenanceMain'
>;

const MaintenanceRecordItem = ({
  recordItem,
  onPressDelete,
}: {
  recordItem: MaintenanceRecord;
  onPressDelete: (id: string) => void;
}) => {
  const { data: maintenanceItems } = useMaintenanceItemQueries();
  const maintenanceItem = useMemo(() => {
    return maintenanceItems?.find(
      (maintenanceItem) => maintenanceItem.id === recordItem.maintenanceItemId,
    );
  }, [maintenanceItems, recordItem.maintenanceItemId]);

  const handleDelete = useCallback(async () => {
    onPressDelete(recordItem.id);
  }, [recordItem.id, onPressDelete]);

  return (
    <Box className="py-3 flex-row items-center justify-between">
      <Box>
        <Text className="font-bold">
          {format(new Date(recordItem.date), 'yyyy년 MM월 dd일')}
        </Text>
        <Box className="flex-row items-center gap-1">
          <Heading size="sm" className="text-typography-500">
            항목:
          </Heading>
          <Text className="text-typography-700">
            {maintenanceItem?.name ?? ''}
          </Text>
        </Box>
        <Box className="flex-row items-center gap-1">
          <Heading size="sm" className="text-typography-500">
            비용:
          </Heading>
          <Text className="text-typography-700">
            {formatNumber(recordItem.cost)}원
          </Text>
          <Divider orientation="vertical" className="h-4" />
          {recordItem?.isDiy ? (
            <Text className="text-typography-700">자가 정비</Text>
          ) : recordItem?.shopName ? (
            <Text className="text-typography-700">{recordItem.shopName}</Text>
          ) : null}
        </Box>
        <Box>
          <Heading size="sm" className="text-typography-500">
            메모
          </Heading>
          <Box className="p-2">
            {recordItem?.memo ? (
              <Text className="text-typography-500">{recordItem.memo}</Text>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Button
        action="negative"
        size="sm"
        onPress={handleDelete}
        className="bg-transparent"
      >
        <ButtonText className="text-gray-300">
          <Icon as={TrashIcon} size="md" color="gray" />
        </ButtonText>
      </Button>
    </Box>
  );
};

const MemoizedMaintenanceRecordItem = memo(MaintenanceRecordItem);

export const MaintenanceManagementPage = ({
  route,
  navigation,
}: MaintenanceManagementPageProps) => {
  const selectedDateString = route.params?.selectedDateString;
  const { selectedVehicle } = useSelectedVehicle();
  const vehicleId = selectedVehicle?.id || '';

  const { data: vehicle } = useVehicle(vehicleId);

  useLayoutEffect(() => {
    if (!selectedDateString) {
      navigation.replaceParams({
        selectedDateString: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [selectedDateString, route.params]);

  const currentDate = useMemo(() => {
    return selectedDateString ? new Date(selectedDateString) : new Date();
  }, [selectedDateString]);

  const firstDayOfMonth = startOfMonth(new Date(currentDate));
  const lastDayOfMonth = endOfMonth(new Date(currentDate));

  const {
    data: records,
    isLoading,
    error,
  } = useMaintenanceRecordsByDate(vehicleId, firstDayOfMonth, lastDayOfMonth);

  console.log(firstDayOfMonth, lastDayOfMonth);
  console.log(records);
  const deleteMutation = useDeleteMaintenanceRecord(vehicleId);

  // 삭제 다이얼로그 상태
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const openDeleteDialog = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const navigateToMaintenanceRecord = () => {
    if (!vehicle) return;
    navigation.navigate('MaintenanceRecord', {
      vehicleId: vehicle?.id || '',
      targetDate: format(currentDate, 'yyyy-MM-dd'),
    });
  };

  const handleDateChange = (day: DateData) => {
    navigation.replaceParams({
      selectedDateString: format(new Date(day.dateString), 'yyyy-MM-dd'),
    });
  };

  const dayRecords = useMemo(() => {
    return records?.filter((record) => {
      return (
        new Date(record.date).getTime() >= currentDate.getTime() &&
        new Date(record.date).getTime() <=
          currentDate.getTime() + 24 * 60 * 60 * 1000 - 1
      );
    });
  }, [records, currentDate]);

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
          selectedColor,
        };
        return acc;
      }, {} as MarkedDates) ?? ({} as MarkedDates)),
    };
  }, [currentDate, records]);

  return (
    <PageLayout>
      <Calendar
        currentDate={currentDate}
        onDayPress={handleDateChange}
        onMonthChange={handleDateChange}
        markedDates={markedDates}
      />
      <Divider orientation="horizontal" />
      <Box className="flex-1 mt-4 flex flex-col gap-2 px-4">
        <Heading size="md">정비 기록</Heading>
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
        {Array.isArray(dayRecords) && dayRecords.length > 0 && (
          <FlatList
            className="bg-white"
            data={Array.isArray(dayRecords) ? dayRecords : []}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <Divider />}
            renderItem={({ item }) => (
              <MemoizedMaintenanceRecordItem
                recordItem={item}
                onPressDelete={openDeleteDialog}
              />
            )}
            ListFooterComponent={<Box style={{ height: 24 }} />}
          />
        )}
      </Box>
      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-4">
          <AlertDialogHeader className="p-2">
            <Text className="text-typography-700 text-lg font-bold">
              정말 삭제하시겠습니까?
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="p-2">
            <Text className="text-typography-500">
              이 정비 기록을 삭제하면 복구할 수 없습니다.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="mt-2 p-2">
            <Button
              variant="outline"
              onPress={() => setDeleteId(null)}
              className="bg-primary-500"
            >
              <ButtonText className="text-typography-100">취소</ButtonText>
            </Button>
            <Button
              action="negative"
              className="bg-gray-300"
              onPress={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              <ButtonText className="text-gray-500">삭제</ButtonText>
            </Button>
          </AlertDialogFooter>
          <AlertDialogCloseButton />
        </AlertDialogContent>
      </AlertDialog>
      <FloatingAddButton onPress={navigateToMaintenanceRecord} />
    </PageLayout>
  );
};

import { useCallback, useEffect, useReducer } from 'react';
import {
  useCreateMaintenanceRecord,
  useMaintenanceRecord,
  useUpdateMaintenanceRecord,
} from '@/features/maintenance/hooks/useMaintenanceRecordQueries';
import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import { FloatingSubmitButton } from '@/shared/components/FloatingSubmitButton';
import PageLayout from '@/shared/components/layout/PageLayout';
import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { MaintenanceRecordForm } from '@/widgets/maintenanceManagement';
import { ScrollView } from 'react-native';
import {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';
import { formatDate } from 'date-fns';
import { MaintenanceStackParamList } from './navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { reducer } from '@/features/maintenance/reducer/maintenanceReducer';
import { useCurrentDate } from '@/shared/hooks/useCurrentDate';

type MaintenanceRecordPageProps = NativeStackScreenProps<
  MaintenanceStackParamList,
  'MaintenanceRecord'
>;

export const MaintenanceRecordPage = ({
  route,
  navigation,
}: MaintenanceRecordPageProps) => {
  const { targetDate, recordId } = route.params;
  const { currentDate } = useCurrentDate(targetDate);
  const { selectedVehicle } = useSelectedVehicle();
  const vehicleId = selectedVehicle?.id || '';

  const { data: existingRecord } = useMaintenanceRecord(
    vehicleId,
    recordId ?? '',
  );
  const createMaintenanceRecord = useCreateMaintenanceRecord(vehicleId);
  const updateMaintenanceRecord = useUpdateMaintenanceRecord(vehicleId);

  const initialData: CreateMaintenanceRecordData | UpdateMaintenanceRecordData =
    {
      vehicleId: vehicleId,
      date: formatDate(currentDate, 'yyyy-MM-dd'),
      odometer: 0,
      isDiy: false,
      maintenanceItemId: '',
      paymentMethodId: '',
      paymentName: '',
      paymentType: 'credit',
      cost: 0,
      shopId: '',
      shopName: '',
      memo: '',
    };
  useEffect(() => {
    if (!recordId) return;

    if (existingRecord) {
      dispatch({ type: 'setExistingRecord', data: existingRecord });
    }
  }, [existingRecord, recordId]);

  const [formData, dispatch] = useReducer(reducer, initialData);

  const onSubmit = useCallback(
    async (data: CreateMaintenanceRecordData | UpdateMaintenanceRecordData) => {
      try {
        if (recordId) {
          await updateMaintenanceRecord.mutateAsync({
            id: recordId,
            data,
          });
        } else {
          await createMaintenanceRecord.mutateAsync(
            data as CreateMaintenanceRecordData,
          );
        }
        navigation.goBack();
      } catch (error) {
        console.log(error);
      }
    },
    [recordId],
  );

  return (
    <PageLayout>
      <Box className="flex-1 pb-8">
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Box className="px-4 py-6">
            <Box className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                정비 기록
              </Text>
              <Text className="text-sm text-gray-600">
                새로운 정비 내역을 기록해보세요
              </Text>
            </Box>
            <MaintenanceRecordForm
              formData={formData}
              dispatch={dispatch}
              onSubmit={onSubmit}
              currentDate={currentDate}
            />
          </Box>
        </ScrollView>
        {/* 하단 고정 저장 버튼 영역 - 동적 */}
        <FloatingSubmitButton
          onSubmit={() => onSubmit(formData)}
          buttonIcon={'💾'}
          buttonText="정비 기록 저장"
        />
      </Box>
    </PageLayout>
  );
};

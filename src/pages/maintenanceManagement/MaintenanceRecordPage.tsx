import { useMemo } from 'react';
import {
  // useDeleteMaintenanceRecord,
  useMaintenanceRecords,
} from '@/features/maintenance/hooks/useMaintenanceRecordQueries';
import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import { useVehicle } from '@/features/vehicle/hooks/useVehicleQueries';
import { FloatingSubmitButton } from '@/shared/components/FloatingSubmitButton';
import PageLayout from '@/shared/components/layout/PageLayout';
import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { MaintenanceRecordForm } from '@/widgets/maintenanceManagement';
import { useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native';

export const MaintenanceRecordPage = () => {
  const route = useRoute();
  const { targetDate } = route.params as { targetDate: string };
  const currentDate = useMemo(() => new Date(targetDate), [targetDate]);
  const { selectedVehicle } = useSelectedVehicle();
  const vehicleId = selectedVehicle?.id || '';

  const { data: vehicle } = useVehicle(vehicleId);
  const { data: records } = useMaintenanceRecords(vehicleId);
  // const deleteMutation = useDeleteMaintenanceRecord(vehicleId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = (data: any) => {
    console.log(vehicle?.id, vehicleId, data);
  };

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
              onSubmit={onSubmit}
              currentDate={currentDate}
            />
          </Box>
        </ScrollView>
        {/* 하단 고정 저장 버튼 영역 - 동적 */}
        <FloatingSubmitButton
          onSubmit={() => onSubmit(records)}
          buttonIcon={'💾'}
          buttonText="정비 기록 저장"
        />
      </Box>
    </PageLayout>
  );
};

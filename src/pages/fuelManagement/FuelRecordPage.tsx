import PageLayout from '@shared/components/layout/PageLayout';
import { useVehicle } from '@features/vehicle';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FuelStackParamList } from './navigator';
import { Box } from '@shared/components/ui/box';
import {
  EnergyRecordForm,
  type EnergyRecordFormData,
} from '@/widgets/fuelManagement';
import {
  useCreateFuelRecord,
  useFuelRecord,
  useUpdateFuelRecord,
} from '@features/fuelRecord/hooks/useFuelRecordQueries';
import { Spinner } from '@/shared/components/ui/spinner';
import { useMemo } from 'react';
import { PaymentMethodType } from '@/shared/models/PaymentMethod';

type Props = NativeStackScreenProps<FuelStackParamList, 'FuelRecord'>;

export function FuelRecordPage({ route, navigation }: Props) {
  const { vehicleId, targetDate, recordId } = route.params;
  const { data: fuelRecord } = useFuelRecord(recordId || '');
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(vehicleId);

  const createFuelRecordMutation = useCreateFuelRecord();
  const updateFuelRecordMutation = useUpdateFuelRecord();

  const handleAddFuelRecord = async (data: EnergyRecordFormData) => {
    if (recordId) {
      await updateFuelRecordMutation.mutateAsync({
        id: recordId,
        data: {
          ...data,
          date: new Date(data.date).getTime(), // string -> number(timestamp)
        },
      });
      navigation.goBack();
    } else {
      await createFuelRecordMutation.mutateAsync({
        ...data,
        vehicleId,
        date: new Date(data.date).getTime(), // string -> number(timestamp)
      });
      navigation.goBack();
    }
  };

  // 차량 정보가 로딩 중일 때
  if (vehicleLoading || !vehicle) {
    return (
      <PageLayout>
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
        </Box>
      </PageLayout>
    );
  }

  const initialFormData = useMemo(
    () => ({
      date: new Date(targetDate).getTime(),
      odometer: fuelRecord?.odometer || 0,
      totalCost: fuelRecord?.totalCost || 0,
      unitPrice: fuelRecord?.unitPrice || 0,
      amount: fuelRecord?.amount || 0,
      paymentMethodId: fuelRecord?.paymentMethodId || '',
      paymentName: fuelRecord?.paymentName || '',
      paymentType:
        fuelRecord?.paymentType || ('credit' as PaymentMethodType['type']),
      stationId: fuelRecord?.stationId || '',
      stationName: fuelRecord?.stationName || '',
      memo: fuelRecord?.memo || '',
    }),
    [targetDate, fuelRecord],
  );

  return (
    <PageLayout>
      {/* 메인 입력 폼 */}
      <EnergyRecordForm
        initialFormData={initialFormData}
        vehicleType={vehicle?.type}
        onSubmit={handleAddFuelRecord}
      />
    </PageLayout>
  );
}

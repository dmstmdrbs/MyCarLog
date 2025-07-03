import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Vehicle from '@shared/models/Vehicle';
import { Box } from '@shared/components/ui/box';
import { VehicleList } from '@features/vehicle';
import { useVehicles } from '@features/vehicle';
import { useInvalidateOnFocus } from '@shared/hooks/useInvalidateOnFocus';
import { FloatingAddButton } from '@/shared/components/FloatingAddButton';

export function SettingsVehicleProfilePage() {
  const { data: vehicles, refetch } = useVehicles();
  const navigation = useNavigation();

  useInvalidateOnFocus(refetch);

  // 차량 추가 페이지 이동
  const handleAdd = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any).navigate('SettingsVehicleProfileForm', {});
  }, [navigation]);

  // 차량 수정 페이지 이동
  const handleEdit = useCallback(
    (vehicle: Vehicle) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigation as any).navigate('SettingsVehicleProfileForm', {
        vehicleId: vehicle.id,
      });
    },
    [navigation],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 bg-white relative">
        <VehicleList vehicles={vehicles} onEdit={handleEdit} />
        <FloatingAddButton onPress={handleAdd} />
      </Box>
    </SafeAreaView>
  );
}

import React, { useCallback } from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Vehicle from '@shared/models/Vehicle';
import { Button, ButtonIcon } from '@shared/components/ui/button';
import { Box } from '@shared/components/ui/box';
import { AddIcon } from '@shared/components/ui/icon';
import { VehicleList } from '@features/vehicle';
import { useVehicles } from '@features/vehicle';
import { useInvalidateOnFocus } from '@shared/hooks/useInvalidateOnFocus';

export function SettingsVehicleProfilePage() {
  const { data: vehicles, refetch } = useVehicles();
  const navigation = useNavigation();

  useInvalidateOnFocus(refetch);

  // 차량 추가 페이지 이동
  const handleAdd = useCallback(() => {
    (navigation as any).navigate('SettingsVehicleProfileForm', {});
  }, [navigation]);

  // 차량 수정 페이지 이동
  const handleEdit = useCallback(
    (vehicle: Vehicle) => {
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
        <Button
          onPress={handleAdd}
          className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-primary-500"
          action="primary"
        >
          <ButtonIcon
            className="w-8 h-8 rounded-full"
            as={AddIcon}
          ></ButtonIcon>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

import React, { useCallback, useLayoutEffect } from 'react';
import Vehicle from '@shared/models/Vehicle';
import { Box } from '@shared/components/ui/box';
import { useDefaultVehicle, VehicleList } from '@features/vehicle';
import { useVehicles } from '@features/vehicle';
import { useInvalidateOnFocus } from '@shared/hooks/useInvalidateOnFocus';
import { FloatingAddButton } from '@/shared/components/FloatingAddButton';
import { SettingsStackParamList } from './navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import PageLayout from '@/shared/components/layout/PageLayout';

type SettingsVehicleProfilePageProps = NativeStackScreenProps<
  SettingsStackParamList,
  'SettingsVehicleProfile'
>;
export function SettingsVehicleProfilePage({
  navigation,
}: SettingsVehicleProfilePageProps) {
  const { data: defaultVehicle, isLoading: isDefaultVehicleLoading } =
    useDefaultVehicle();
  const isFocused = useIsFocused();
  const { data: vehicles, refetch } = useVehicles();

  useLayoutEffect(() => {
    if (isFocused && !isDefaultVehicleLoading && !defaultVehicle) {
      navigation.replace('SettingsVehicleProfileForm', {
        isInitial: true,
      });
    }
  }, [defaultVehicle, isDefaultVehicleLoading, isFocused]);

  useInvalidateOnFocus(refetch);

  // 차량 추가 페이지 이동
  const handleAdd = useCallback(() => {
    navigation.navigate('SettingsVehicleProfileForm', {
      isInitial: false,
    });
  }, [navigation]);

  // 차량 수정 페이지 이동
  const handleEdit = useCallback(
    (vehicle: Vehicle) => {
      navigation.navigate('SettingsVehicleProfileForm', {
        vehicleId: vehicle.id,
        isInitial: false,
      });
    },
    [navigation],
  );

  return (
    <PageLayout>
      <Box className="flex-1 bg-white relative">
        <VehicleList vehicles={vehicles} onEdit={handleEdit} />
        <FloatingAddButton onPress={handleAdd} />
      </Box>
    </PageLayout>
  );
}

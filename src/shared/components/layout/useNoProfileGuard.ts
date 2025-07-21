import { useDefaultVehicle, useVehicles } from '@/features/vehicle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'App';
import { useEffect } from 'react';

export const useNoProfileGuard = () => {
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useVehicles();
  const { data: defaultVehicle, isLoading: isDefaultVehicleLoading } =
    useDefaultVehicle();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // 로딩 중이 아니고, vehicles가 없거나 defaultVehicle이 없는 경우
    if (!isVehiclesLoading && !isDefaultVehicleLoading) {
      if (vehicles.length === 0 || !defaultVehicle) {
        navigation.navigate('설정', {
          screen: 'SettingsMain',
          params: {
            isInitial: true,
          },
        });
      }
    }
  }, [
    vehicles,
    defaultVehicle,
    isVehiclesLoading,
    isDefaultVehicleLoading,
    navigation,
  ]);

  return null;
};

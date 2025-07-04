import { useDefaultVehicle } from '@/features/vehicle';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'App';
import { useEffect } from 'react';

export const useNoProfileGuard = () => {
  const { data: defaultVehicle, isLoading: isDefaultVehicleLoading } =
    useDefaultVehicle();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!isDefaultVehicleLoading && !defaultVehicle) {
      navigation.navigate('설정', {
        screen: 'SettingsMain',
        params: {
          isInitial: true,
        },
      });
    }
  }, [defaultVehicle, isDefaultVehicleLoading, navigation]);

  return null;
};

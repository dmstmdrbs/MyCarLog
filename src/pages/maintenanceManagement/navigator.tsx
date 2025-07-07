import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { MaintenanceManagementPage } from './MaintenanceManagementPage';
import { MaintenanceRecordPage } from './MaintenanceRecordPage';
import { useAppStatus } from '@/shared/providers/AppStatusProvider';
import { useDefaultVehicle } from '@/features/vehicle';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { useLayoutEffect } from 'react';

export type MaintenanceStackParamList = {
  MaintenanceMain: {
    selectedDateString?: string;
  };
  MaintenanceRecord: {
    vehicleId: string;
    targetDate: string;
    recordId?: string;
  };
};

const MaintenanceStack =
  createNativeStackNavigator<MaintenanceStackParamList>();
export function MaintenanceStackScreen() {
  const { isAppLoading, isAppError } = useAppStatus();
  const { data: defaultVehicle, isLoading: isDefaultVehicleLoading } =
    useDefaultVehicle();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    if (isAppLoading || isAppError) return;

    if (!isDefaultVehicleLoading && !defaultVehicle) {
      navigation.navigate('설정', {
        screen: 'SettingsMain',
        params: {
          isInitial: true,
        },
      });
    }
  }, [
    isAppLoading,
    isAppError,
    defaultVehicle,
    isDefaultVehicleLoading,
    navigation,
  ]);

  return (
    <MaintenanceStack.Navigator>
      <MaintenanceStack.Screen
        name="MaintenanceMain"
        options={{
          title: '정비',
          headerRight: () => <VehicleProfileHeaderMenu />,
        }}
        component={MaintenanceManagementPage}
      />
      <MaintenanceStack.Screen
        name="MaintenanceRecord"
        options={{
          title: '정비 기록',
        }}
        component={MaintenanceRecordPage}
      />
    </MaintenanceStack.Navigator>
  );
}

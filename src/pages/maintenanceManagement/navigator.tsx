import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaintenanceManagementPage } from './MaintenanceManagementPage';
import { MaintenanceRecordPage } from './MaintenanceRecordPage';

export type MaintenanceStackParamList = {
  MaintenanceMain: undefined;
  MaintenanceRecord: {
    vehicleId: string;
    targetDate: string;
  };
};

const MaintenanceStack =
  createNativeStackNavigator<MaintenanceStackParamList>();
export function MaintenanceStackScreen() {
  return (
    <MaintenanceStack.Navigator>
      <MaintenanceStack.Screen
        name="MaintenanceMain"
        options={{
          title: '정비',
          headerRight: () => <VehicleProfileHeaderMenu />,
        }}
      >
        {() => <MaintenanceManagementPage />}
      </MaintenanceStack.Screen>
      <MaintenanceStack.Screen
        name="MaintenanceRecord"
        options={{
          title: '정비 기록',
        }}
      >
        {() => <MaintenanceRecordPage />}
      </MaintenanceStack.Screen>
    </MaintenanceStack.Navigator>
  );
}

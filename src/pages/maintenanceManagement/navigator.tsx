import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaintenanceManagementPage } from './MaintenanceManagementPage';

const MaintenanceStack = createNativeStackNavigator();
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
    </MaintenanceStack.Navigator>
  );
}

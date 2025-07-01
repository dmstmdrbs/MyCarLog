import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaintenanceManagementPage } from '../maintenanceManagement/MaintenanceManagementPage';
import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';

const DriveStack = createNativeStackNavigator();
export function DriveStackScreen() {
  return (
    <DriveStack.Navigator>
      <DriveStack.Screen
        name="DriveMain"
        options={{
          title: '운행',
          headerRight: () => <VehicleProfileHeaderMenu />,
        }}
      >
        {() => <MaintenanceManagementPage />}
      </DriveStack.Screen>
    </DriveStack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FuelManagementPage } from './FuelManagementPage';
import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';
import { FuelRecordPage } from './FuelRecordPage';

export type FuelStackParamList = {
  FuelMain: { vehicleId: string };
  FuelRecord: { vehicleId: string };
};

const FuelStack = createNativeStackNavigator<FuelStackParamList>();
export function FuelStackScreen() {
  return (
    <FuelStack.Navigator>
      <FuelStack.Screen
        name="FuelMain"
        options={{
          title: '주유',
          headerRight: () => <VehicleProfileHeaderMenu />,
        }}
        component={FuelManagementPage}
      />
      <FuelStack.Screen
        name="FuelRecord"
        options={{
          title: '주유 기록',
          headerBackTitle: '이전',
        }}
        component={FuelRecordPage}
      />
    </FuelStack.Navigator>
  );
}

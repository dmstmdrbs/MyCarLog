import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FuelManagementPage } from './FuelManagementPage';
import VehicleProfileHeaderMenu from '@shared/components/layout/VehicleProfileHeaderMenu';
import { FuelRecordPage } from './FuelRecordPage';
import { useSelectedVehicle } from '@features/vehicle';

export type FuelStackParamList = {
  FuelMain: { vehicleId: string };
  FuelRecord: { vehicleId: string };
};

const FuelStack = createNativeStackNavigator<FuelStackParamList>();
export function FuelStackScreen() {
  const { selectedVehicle } = useSelectedVehicle();
  const isEv = selectedVehicle?.type === 'EV';
  const title = isEv ? '충전' : '주유';
  return (
    <FuelStack.Navigator>
      <FuelStack.Screen
        name="FuelMain"
        options={{
          title,
          headerRight: () => <VehicleProfileHeaderMenu />,
        }}
        component={FuelManagementPage}
      />
      <FuelStack.Screen
        name="FuelRecord"
        options={{
          title: `${title} 기록`,
          headerBackTitle: '이전',
        }}
        component={FuelRecordPage}
      />
    </FuelStack.Navigator>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehicleProfileHeaderMenu } from '@/widgets/vehicle';
import { useSelectedVehicle } from '@features/vehicle';

import { FuelManagementPage } from './FuelManagementPage';
import { FuelRecordPage } from './FuelRecordPage';

export type FuelStackParamList = {
  FuelMain: { vehicleId: string };
  FuelRecord: { vehicleId: string; targetDate: string; recordId?: string };
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

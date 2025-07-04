import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GluestackUIProvider } from '@shared/components/ui/gluestack-ui-provider';
import { QueryProvider } from '@shared/providers/QueryProvider';

import { Icon } from '@/shared/components/ui/icon';
import { FuelIcon, SettingsIcon, WrenchIcon } from 'lucide-react-native';

import { MaintenanceStackScreen } from '@pages/maintenanceManagement';
import { FuelStackScreen } from '@pages/fuelManagement';
import { SettingsStackScreen } from '@pages/settings';
import { SelectedVehicleProvider, useSelectedVehicle } from '@features/vehicle';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStatusProvider } from 'AppStatusProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 각 Stack Navigator 정의

const Tab = createBottomTabNavigator();
export type RootStackParamList = {
  설정: {
    screen:
      | 'SettingsVehicleProfileForm'
      | 'SettingsMain'
      | 'SettingsVehicleProfile'
      | 'SettingsMaintenanceItem'
      | 'SettingsDataBackup';
    params: {
      isInitial?: boolean;
      vehicleId?: string;
    };
  };
  정비: {
    screen: 'MaintenanceStackScreen';
  };
};

const HomeTab = () => {
  const { selectedVehicle } = useSelectedVehicle();
  const isEV = selectedVehicle?.type === 'EV';

  return (
    <Tab.Navigator
      detachInactiveScreens={true}
      screenOptions={{
        tabBarStyle: !selectedVehicle ? { display: 'none' } : undefined,
        popToTopOnBlur: true,
      }}
    >
      <Tab.Screen
        name="정비"
        component={MaintenanceStackScreen}
        options={{
          popToTopOnBlur: true,
          headerShown: false,
          tabBarIcon: () => <Icon as={WrenchIcon} />,
        }}
      />
      <Tab.Screen
        name={isEV ? '충전' : '주유'}
        component={FuelStackScreen}
        options={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: () => <Icon as={FuelIcon} />,
        }}
      />
      {/* <Tab.Screen
        name="운행"
        component={DriveStackScreen}
        options={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: () => <Icon as={CarIcon} />,
        }}
      /> */}
      <Tab.Screen
        name="설정"
        component={SettingsStackScreen}
        options={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: () => <Icon as={SettingsIcon} />,
        }}
      />
    </Tab.Navigator>
  );
};

const NativeStack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <NativeStack.Navigator initialRouteName="HomeTab">
      <NativeStack.Screen
        name="HomeTab"
        component={HomeTab}
        options={{ headerShown: false }}
      />
    </NativeStack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStatusProvider>
        <QueryProvider>
          <SelectedVehicleProvider>
            <GluestackUIProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </GluestackUIProvider>
          </SelectedVehicleProvider>
        </QueryProvider>
      </AppStatusProvider>
    </SafeAreaProvider>
  );
}

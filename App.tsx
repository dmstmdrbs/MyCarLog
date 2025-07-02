import * as React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GluestackUIProvider } from '@shared/components/ui/gluestack-ui-provider';
import { QueryProvider } from '@shared/providers/QueryProvider';
import {
  seedDefaultMaintenanceItems,
  seedDefaultPaymentMethods,
} from '@/database/seedData';
import { useEffect } from 'react';

import { Icon } from '@/shared/components/ui/icon';
import {
  CarIcon,
  FuelIcon,
  SettingsIcon,
  WrenchIcon,
} from 'lucide-react-native';

import { MaintenanceStackScreen } from '@pages/maintenanceManagement';
import { FuelStackScreen } from '@pages/fuelManagement';
import { DriveStackScreen } from '@pages/driveManagement';
import { SettingsStackScreen } from '@pages/settings';
import { SelectedVehicleProvider, useSelectedVehicle } from '@features/vehicle';

// 각 Stack Navigator 정의

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { selectedVehicle } = useSelectedVehicle();
  const isEV = selectedVehicle?.type === 'EV';
  const fuelTitle = isEV ? '충전' : '주유';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: !selectedVehicle ? { display: 'none' } : undefined,
        }}
      >
        <Tab.Screen
          name="정비"
          component={MaintenanceStackScreen}
          options={{
            headerShown: false,
            tabBarIcon: () => <Icon as={WrenchIcon} />,
          }}
        />
        <Tab.Screen
          name={fuelTitle}
          component={FuelStackScreen}
          options={{
            headerShown: false,
            popToTopOnBlur: true,
            tabBarIcon: () => <Icon as={FuelIcon} />,
          }}
        />
        <Tab.Screen
          name="운행"
          component={DriveStackScreen}
          options={{
            headerShown: false,
            tabBarIcon: () => <Icon as={CarIcon} />,
          }}
        />
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
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    const initializeData = async () => {
      // 데이터베이스 초기화 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await seedDefaultMaintenanceItems();
      } catch (error) {
        console.error('Failed to initialize maintenance seed data:', error);
      } finally {
        console.log('Maintenance seed data initialized');
      }
      try {
        await seedDefaultPaymentMethods();
      } catch (error) {
        console.error('Failed to initialize payment method seed data:', error);
      } finally {
        console.log('Payment method seed data initialized');
      }
    };

    initializeData();
  }, []);

  return (
    <QueryProvider>
      <SelectedVehicleProvider>
        <GluestackUIProvider>
          <AppNavigator />
        </GluestackUIProvider>
      </SelectedVehicleProvider>
    </QueryProvider>
  );
}

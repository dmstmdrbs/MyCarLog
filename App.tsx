import * as React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GluestackUIProvider } from '@shared/components/ui/gluestack-ui-provider';
import { PaymentMethodsProvider } from '@shared/contexts/paymentMethods';
import {
  SelectedVehicleProvider,
  useSelectedVehicle,
} from '@features/vehicle/contexts/SelectedVehicleContext';

import { MaintenanceStackScreen } from '@pages/maintenanceManagement';
import { FuelStackScreen } from '@pages/fuelManagement';
import { DriveStackScreen } from '@pages/driveManagement';
import { SettingsStackScreen } from '@pages/settings';
import {
  seedDefaultMaintenanceItems,
  seedDefaultPaymentMethods,
} from '@/database/seedData';
import { useEffect } from 'react';
import useVehicles from '@/features/vehicle/hooks/useVehicles';

// 각 Stack Navigator 정의

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { selectedVehicle } = useSelectedVehicle();
  const { isLoading, vehicles } = useVehicles();
  const isEV = selectedVehicle?.type === 'EV';

  // 차량이 없을 때 탭바 숨기기
  const shouldHideTabBar = !isLoading && vehicles.length === 0;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: shouldHideTabBar ? { display: 'none' } : undefined,
        }}
      >
        <Tab.Screen
          name="정비"
          component={MaintenanceStackScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name={isEV ? '충전' : '주유'}
          component={FuelStackScreen}
          options={{ headerShown: false, popToTopOnBlur: true }}
        />
        <Tab.Screen
          name="운행"
          component={DriveStackScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="설정"
          component={SettingsStackScreen}
          options={{ headerShown: false, popToTopOnBlur: true }}
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
    <PaymentMethodsProvider paymentMethods={[]}>
      <SelectedVehicleProvider>
        <GluestackUIProvider>
          <AppNavigator />
        </GluestackUIProvider>
      </SelectedVehicleProvider>
    </PaymentMethodsProvider>
  );
}

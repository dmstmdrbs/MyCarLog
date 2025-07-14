import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { GluestackUIProvider } from '@shared/components/ui/gluestack-ui-provider';
import { QueryProvider } from '@shared/providers/QueryProvider';

import { Icon } from '@/shared/components/ui/icon';
import {
  FuelIcon,
  HomeIcon,
  SettingsIcon,
  WrenchIcon,
} from 'lucide-react-native';

import { MaintenanceStackScreen } from '@pages/maintenanceManagement';
import { FuelStackScreen } from '@pages/fuelManagement';
import { SettingsStackScreen } from '@pages/settings';
import { SelectedVehicleProvider, useSelectedVehicle } from '@features/vehicle';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStatusProvider } from '@/shared/providers/AppStatusProvider';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import 'react-native-gesture-handler';
import { Box } from '@/shared/components/ui/box';
import { HomeStackScreen } from '@/pages/home/navigator';

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
  홈: {
    screen: 'HomeStackScreen';
  };
};

const HomeTab = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const { selectedVehicle } = useSelectedVehicle();
  const isEV = selectedVehicle?.type === 'EV';

  return (
    <Tab.Navigator
      detachInactiveScreens={true}
      backBehavior="none"
      screenOptions={{
        tabBarStyle: !selectedVehicle
          ? { display: 'none' }
          : {
              height: 56,
            },
        popToTopOnBlur: true,
        tabBarActiveTintColor: '#0A4D68',
        tabBarIconStyle: {
          height: 28,
        },
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarItemStyle: {
          height: 36,
        },
      }}
      safeAreaInsets={safeAreaInsets}
      layout={({ children }) => {
        return (
          <Box
            className="flex-1"
            style={{
              paddingBottom: safeAreaInsets.bottom,
              backgroundColor: 'white',
            }}
          >
            {children}
          </Box>
        );
      }}
    >
      <Tab.Screen
        name="홈"
        component={HomeStackScreen}
        options={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => <Icon as={HomeIcon} color={color} />,
        }}
      />
      <Tab.Screen
        name="정비"
        component={MaintenanceStackScreen}
        options={{
          popToTopOnBlur: true,
          headerShown: false,
          tabBarIcon: ({ color }) => <Icon as={WrenchIcon} color={color} />,
        }}
      />
      <Tab.Screen
        name={isEV ? '충전' : '주유'}
        component={FuelStackScreen}
        options={{
          headerShown: false,
          popToTopOnBlur: true,
          tabBarIcon: ({ color }) => <Icon as={FuelIcon} color={color} />,
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
          tabBarIcon: ({ color }) => <Icon as={SettingsIcon} color={color} />,
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
    <QueryProvider>
      <NavigationContainer>
        <GluestackUIProvider>
          <SafeAreaProvider>
            <AppStatusProvider>
              <SelectedVehicleProvider>
                <AppNavigator />
              </SelectedVehicleProvider>
            </AppStatusProvider>
          </SafeAreaProvider>
        </GluestackUIProvider>
      </NavigationContainer>
    </QueryProvider>
  );
}

import * as React from 'react';
import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SettingsVehicleProfilePage from './src/pages/SettingsVehicleProfilePage';
import SettingsMaintenanceItemPage from './src/pages/SettingsMaintenanceItemPage';
import { GluestackUIProvider } from './src/shared/components/ui/gluestack-ui-provider';
import VehicleProfileFormPage from './src/pages/VehicleProfileFormPage';

// 임시 Placeholder Screen
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24 }}>{title} 화면 (추후 구현)</Text>
    </View>
  );
}

// 각 Stack Navigator 정의
const MaintenanceStack = createNativeStackNavigator();
function MaintenanceStackScreen() {
  return (
    <MaintenanceStack.Navigator>
      <MaintenanceStack.Screen
        name="MaintenanceMain"
        options={{ title: '정비' }}
      >
        {() => <PlaceholderScreen title="정비" />}
      </MaintenanceStack.Screen>
    </MaintenanceStack.Navigator>
  );
}

const FuelStack = createNativeStackNavigator();
function FuelStackScreen() {
  return (
    <FuelStack.Navigator>
      <FuelStack.Screen name="FuelMain" options={{ title: '주유' }}>
        {() => <PlaceholderScreen title="주유" />}
      </FuelStack.Screen>
    </FuelStack.Navigator>
  );
}

const DriveStack = createNativeStackNavigator();
function DriveStackScreen() {
  return (
    <DriveStack.Navigator>
      <DriveStack.Screen name="DriveMain" options={{ title: '운행' }}>
        {() => <PlaceholderScreen title="운행" />}
      </DriveStack.Screen>
    </DriveStack.Navigator>
  );
}

const DevStack = createNativeStackNavigator();
function DevStackScreen() {
  return (
    <DevStack.Navigator>
      <DevStack.Screen
        name="DevVehicleCrud"
        component={SettingsVehicleProfilePage}
        options={{ title: '차량 관리' }}
      />
      <DevStack.Screen
        name="DevMaintenanceItemCrud"
        component={SettingsMaintenanceItemPage}
        options={{ title: '정비 항목 관리' }}
      />
    </DevStack.Navigator>
  );
}

function SettingsMainScreen({ navigation }: { navigation: any }) {
  const menu = [
    {
      key: 'vehicle',
      title: '차량 프로필 관리',
      icon: 'car-outline',
      onPress: () => navigation.navigate('SettingsVehicleProfile'),
    },
    {
      key: 'maintenance',
      title: '정비 항목 관리',
      icon: 'construct-outline',
      onPress: () => navigation.navigate('SettingsMaintenanceItem'),
    },
    {
      key: 'backup',
      title: '데이터 백업 및 복구',
      icon: 'cloud-upload-outline',
      onPress: () => navigation.navigate('SettingsDataBackup'),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        data={menu}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={item.onPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 20,
              paddingHorizontal: 24,
              borderBottomWidth: 1,
              borderColor: '#f0f0f0',
              backgroundColor: '#fff',
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color="#4a4a4a"
              style={{ marginRight: 16 }}
            />
            <Text style={{ fontSize: 16, flex: 1 }}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#b0b0b0" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

function SettingsVehicleProfileScreen() {
  return <SettingsVehicleProfilePage />;
}
function SettingsMaintenanceItemScreen() {
  return <SettingsMaintenanceItemPage />;
}
function SettingsDataBackupScreen() {
  return <PlaceholderScreen title="데이터 백업 및 복구" />;
}

const SettingsStack = createNativeStackNavigator();
function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsMainScreen}
        options={{ title: '설정' }}
      />
      <SettingsStack.Screen
        name="SettingsVehicleProfile"
        component={SettingsVehicleProfileScreen}
        options={{ title: '차량 프로필 관리' }}
      />
      <SettingsStack.Screen
        name="SettingsMaintenanceItem"
        component={SettingsMaintenanceItemScreen}
        options={{ title: '정비 항목 관리' }}
      />
      <SettingsStack.Screen
        name="SettingsDataBackup"
        component={SettingsDataBackupScreen}
        options={{ title: '데이터 백업 및 복구' }}
      />
      <SettingsStack.Screen
        name="VehicleProfileForm"
        component={VehicleProfileFormPage}
        options={{ title: '차량 프로필 추가/수정' }}
      />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GluestackUIProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="정비"
            component={MaintenanceStackScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="주유"
            component={FuelStackScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="운행"
            component={DriveStackScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="개발용"
            component={DevStackScreen}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="설정"
            component={SettingsStackScreen}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GluestackUIProvider>
  );
}

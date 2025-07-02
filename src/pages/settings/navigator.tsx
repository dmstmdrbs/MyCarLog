import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsMaintenanceItemPage } from './SettingsMaintenanceItemPage';
import { SettingsVehicleProfilePage } from './SettingsVehicleProfilePage';
import { SettingsDataBackupPage } from './SettingsDataBackupPage';
import { VehicleProfileFormPage } from './VehicleProfileFormPage';
import { SettingsMainPage } from './SettingsMainPage';

const SettingsStack = createNativeStackNavigator();
export function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator initialRouteName="SettingsMain">
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsMainPage}
        options={{ title: '설정' }}
      />
      <SettingsStack.Screen
        name="SettingsVehicleProfile"
        component={SettingsVehicleProfilePage}
        options={{ title: '차량 프로필 관리' }}
      />
      <SettingsStack.Screen
        name="SettingsMaintenanceItem"
        component={SettingsMaintenanceItemPage}
        options={{ title: '정비 항목 관리' }}
      />
      <SettingsStack.Screen
        name="SettingsDataBackup"
        component={SettingsDataBackupPage}
        options={{ title: '데이터 백업 및 복구' }}
      />
      <SettingsStack.Screen
        name="SettingsVehicleProfileForm"
        component={VehicleProfileFormPage}
        options={{ title: '차량 프로필 추가/수정' }}
      />
    </SettingsStack.Navigator>
  );
}

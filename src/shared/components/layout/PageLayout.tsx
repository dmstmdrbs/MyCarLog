import useVehicles from '@/features/vehicle/hooks/useVehicles';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@shared/components/ui/box';
import { useEffect } from 'react';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';

// 설정 스택의 타입 정의
type SettingsStackParamList = {
  SettingsMain: undefined;
  SettingsVehicleProfile: undefined;
  SettingsMaintenanceItem: undefined;
  SettingsDataBackup: undefined;
  SettingsVehicleProfileForm: undefined;
};

// 루트 탭 네비게이터 타입 정의
type RootTabParamList = {
  정비: undefined;
  주유: undefined;
  충전: undefined;
  운행: undefined;
  설정: NavigatorScreenParams<SettingsStackParamList>;
};

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { vehicles, isLoading } = useVehicles();

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    if (!isLoading && vehicles.length === 0) {
      navigation.navigate('설정', {
        screen: 'SettingsVehicleProfileForm',
      });
    }
  }, [vehicles, isLoading, navigation]);

  return <Box className="flex-1">{children}</Box>;
};

export default PageLayout;

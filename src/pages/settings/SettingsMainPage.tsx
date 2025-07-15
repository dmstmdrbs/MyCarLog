import { Box } from '@shared/components/ui/box';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { FlatList } from 'react-native';
import {
  CarIcon,
  ChevronRightIcon,
  CloudUploadIcon,
  WrenchIcon,
} from 'lucide-react-native';
import { Icon } from '@/shared/components/ui/icon';
import PageLayout from '@/shared/components/layout/PageLayout';
import { useLayoutEffect } from 'react';
import { SettingsStackParamList } from './navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDefaultVehicle, useSelectedVehicle } from '@/features/vehicle';
import { useIsFocused } from '@react-navigation/native';
import { VStack } from '@/shared/components/ui/vstack';
import { ProfileCard } from '@/widgets/vehicle/ProfileCard';
import { Center } from '@/shared/components/ui/center';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsMain'>;

export function SettingsMainPage({ route, navigation }: Props) {
  const isFocused = useIsFocused();
  const { data: defaultVehicle, isLoading: isDefaultVehicleLoading } =
    useDefaultVehicle();
  const { selectedVehicle } = useSelectedVehicle();
  const params = route.params;

  useLayoutEffect(() => {
    if (isFocused && !isDefaultVehicleLoading && !defaultVehicle) {
      navigation.replace('SettingsVehicleProfileForm', {
        isInitial: true,
      });
    }
  }, [params, defaultVehicle, isDefaultVehicleLoading, isFocused]);

  const menu = [
    {
      key: 'vehicle',
      title: '차량 프로필 관리',
      icon: CarIcon,
      onPress: () => navigation.navigate('SettingsVehicleProfile'),
    },
    {
      key: 'maintenance',
      title: '정비 항목 관리',
      icon: WrenchIcon,
      onPress: () => navigation.navigate('SettingsMaintenanceItem'),
    },
    // {
    //   key: 'backup',
    //   title: '데이터 백업 및 복구',
    //   icon: CloudUploadIcon,
    //   onPress: () => navigation.navigate('SettingsDataBackup'),
    // },
  ];

  return (
    <PageLayout>
      <VStack space="sm" className="flex-1">
        <Center className="mt-5 h-44 w-full px-4 py-2">
          <ProfileCard vehicle={selectedVehicle} />
        </Center>
        <FlatList
          className="flex-1"
          data={menu}
          renderItem={({ item }) => (
            <Button
              onPress={item.onPress}
              variant="link"
              className="h-14 py-2 px-6 flex flex-row items-center justify-between border-b border-gray-200 bg-white"
            >
              <Box className="flex flex-row items-center justify-start">
                <Icon
                  as={item.icon}
                  size="md"
                  color="#4a4a4a"
                  className="mr-4"
                />
                <Text className="text-lg">{item.title}</Text>
              </Box>
              <Icon as={ChevronRightIcon} size="md" color="#b0b0b0" />
            </Button>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingTop: 8 }}
        />
      </VStack>
    </PageLayout>
  );
}

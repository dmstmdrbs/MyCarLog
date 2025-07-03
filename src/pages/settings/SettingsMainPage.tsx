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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SettingsMainPage({ navigation }: { navigation: any }) {
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
    {
      key: 'backup',
      title: '데이터 백업 및 복구',
      icon: CloudUploadIcon,
      onPress: () => navigation.navigate('SettingsDataBackup'),
    },
  ];

  return (
    <Box className="flex-1 bg-white">
      <FlatList
        className="flex-1"
        data={menu}
        renderItem={({ item }) => (
          <Button
            onPress={item.onPress}
            variant="link"
            className="h-14 py-2 px-6 flex flex-row items-center justify-between border-b border-gray-200"
          >
            <Box className="flex flex-row items-center justify-start">
              <Icon as={item.icon} size="md" color="#4a4a4a" className="mr-4" />
              <Text className="text-lg">{item.title}</Text>
            </Box>
            <Icon as={ChevronRightIcon} size="md" color="#b0b0b0" />
          </Button>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </Box>
  );
}

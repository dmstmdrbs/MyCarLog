import { Box } from '@shared/components/ui/box';
import { Button } from '@shared/components/ui/button';
import { Text } from '@shared/components/ui/text';
import { FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function SettingsMainPage({ navigation }: { navigation: any }) {
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
              <Ionicons
                name={item.icon as any}
                size={24}
                color="#4a4a4a"
                className="mr-4"
              />
              <Text className="text-lg">{item.title}</Text>
            </Box>
            <Ionicons name="chevron-forward" size={20} color="#b0b0b0" />
          </Button>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </Box>
  );
}

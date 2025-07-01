import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { database } from '@/database';
import Vehicle from '@shared/models/Vehicle';
import VehicleList from '@features/vehicle/VehicleList';
import { Button, ButtonIcon } from '@shared/components/ui/button';
import { Box } from '@shared/components/ui/box';
import { AddIcon } from '@shared/components/ui/icon';

export function SettingsVehicleProfilePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const navigation = useNavigation();

  // 차량 전체 조회
  const fetchVehicles = async () => {
    const collection = database.get<Vehicle>('vehicles');
    const all = await collection.query().fetch();
    setVehicles(all);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchVehicles);
    return unsubscribe;
  }, [navigation]);

  // 차량 삭제
  const handleDelete = async (id: string) => {
    const collection = database.get<Vehicle>('vehicles');
    const vehicle = await collection.find(id);
    await database.write(async () => {
      await vehicle.markAsDeleted();
      await vehicle.destroyPermanently();
    });
    fetchVehicles();
  };

  // 차량 추가 페이지 이동
  const handleAdd = () => {
    (navigation as any).navigate('SettingsVehicleProfileForm', {});
  };

  // 차량 수정 페이지 이동
  const handleEdit = (vehicle: Vehicle) => {
    (navigation as any).navigate('SettingsVehicleProfileForm', {
      vehicleId: vehicle.id,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 bg-white relative">
        <VehicleList
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <Button
          onPress={handleAdd}
          className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-primary-500"
          action="primary"
        >
          <ButtonIcon
            className="w-8 h-8 rounded-full"
            as={AddIcon}
          ></ButtonIcon>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database } from '../database';
import Vehicle from '@shared/models/Vehicle';
import VehicleForm from '../features/vehicleCrud/VehicleForm';
import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';

import { Toast, ToastTitle, useToast } from '@/shared/components/ui/toast';
import { CheckIcon, Icon } from '@/shared/components/ui/icon';
import { Divider } from '@/shared/components/ui/divider';
import ConfirmModal from '@/shared/components/ui/modal/ConfirmModal';

export default function VehicleProfileFormPage() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { vehicleId } = route.params || {};

  const [nickname, setNickname] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<'ICE' | 'EV'>('ICE');
  const [loading, setLoading] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [isDefault, setIsDefault] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toast = useToast();
  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (vehicleId) {
      (async () => {
        const collection = database.get<Vehicle>('vehicles');
        const vehicle = await collection.find(vehicleId);
        setNickname(vehicle.nickname);
        setManufacturer(vehicle.manufacturer);
        setModel(vehicle.model);
        setType(vehicle.type);
        setIsDefault(vehicle.isDefault || false);
      })();
    }
    // 전체 차량 개수 조회
    (async () => {
      const collection = database.get<Vehicle>('vehicles');
      const all = await collection.query().fetch();
      setVehicleCount(all.length);
    })();
  }, [vehicleId]);

  const handleFormChange = (field: string, value: string) => {
    if (field === 'nickname') setNickname(value);
    if (field === 'manufacturer') setManufacturer(value);
    if (field === 'model') setModel(value);
  };

  const handleSave = async () => {
    if (!nickname) return Alert.alert('차량 별칭을 입력하세요');
    setLoading(true);
    try {
      console.log('nickname', nickname);
      console.log('manufacturer', manufacturer);
      console.log('model', model);
      console.log('type', type);
      console.log('vehicleId', vehicleId);
      console.log('vehicleCount', vehicleCount);

      const collection = database.get<Vehicle>('vehicles');
      console.log('collection', collection);
      if (vehicleId) {
        // 수정
        const vehicle = await collection.find(vehicleId);
        await database.write(async () => {
          await vehicle.update((v) => {
            v.nickname = nickname;
            v.manufacturer = manufacturer;
            v.model = model;
            v.type = type;
          });
        });
      } else {
        // 추가
        await database.write(async () => {
          await collection.create(function (v) {
            v.nickname = nickname;
            v.manufacturer = manufacturer;
            v.model = model;
            v.type = type;
            v.isDefault = vehicleCount === 0;
          });
        });
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefaultProfile = async () => {
    const collection = database.get<Vehicle>('vehicles');
    const allVehicles = await collection.query().fetch();

    try {
      await database.write(async () => {
        // 1. 모든 차량의 isDefault를 false로
        for (const v of allVehicles) {
          if (v.isDefault) {
            await v.update((rec) => {
              rec.isDefault = false;
            });
          }
        }
        // 2. 선택한 차량만 true로
        const vehicle = await collection.find(vehicleId);
        await vehicle.update((v) => {
          v.isDefault = true;
        });
      });
      toast.show({
        placement: 'bottom',
        duration: 2000,
        render: ({ id }) => {
          const toastId = 'toast-' + id;
          return (
            <Toast
              nativeID={toastId}
              className="px-5 py-3 gap-4 shadow-soft-1 items-center flex-row"
            >
              <Icon
                as={CheckIcon}
                size="xl"
                className="fill-typography-100 stroke-none"
              />
              <Divider
                orientation="vertical"
                className="h-[30px] bg-outline-200"
              />
              <ToastTitle size="sm">
                {nickname} 차량이 기본 프로필로 설정되었습니다.
              </ToastTitle>
            </Toast>
          );
        },
      });
    } catch (error) {
      console.error(error);
      Alert.alert('기본 프로필 설정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const collection = database.get<Vehicle>('vehicles');
      const vehicle = await collection.find(vehicleId);
      await database.write(async () => {
        await vehicle.markAsDeleted();
        await vehicle.destroyPermanently();
      });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Box className="flex-1 bg-white p-4 flex flex-col gap-3">
        <Box className="flex-1 bg-white">
          <VehicleForm
            nickname={nickname}
            manufacturer={manufacturer}
            model={model}
            type={type}
            onChange={handleFormChange}
            onTypeChange={setType}
            onSubmit={handleSave}
            editingId={vehicleId}
            isDefault={isDefault}
            setDefaultProfile={handleSetDefaultProfile}
          />
        </Box>
        {vehicleId && (
          <>
            <Box className="flex flex-row">
              <Button
                onPress={() => setIsConfirmModalOpen(true)}
                className="flex-1"
                variant="link"
                action="negative"
              >
                <ButtonText className="text-red-500 opacity-70 text-sm">
                  삭제하기
                </ButtonText>
              </Button>
            </Box>
            <ConfirmModal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              onConfirm={handleDelete}
              title="삭제하기"
              description="해당 차량 프로필을 삭제하시겠습니까?"
              confirmText="확인"
              cancelText="취소"
            />
          </>
        )}
      </Box>
    </SafeAreaView>
  );
}

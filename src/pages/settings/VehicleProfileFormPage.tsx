import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Box } from '@shared/components/ui/box';
import { Button, ButtonText } from '@shared/components/ui/button';

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@shared/components/ui/toast';
import ConfirmModal from '@shared/components/ui/modal/ConfirmModal';
import {
  useVehicle,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
  VehicleForm,
} from '@features/vehicle';
import { vehicleRepository } from '@/shared/repositories';
import { SettingsStackParamList } from './navigator';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import PageLayout from '@/shared/components/layout/PageLayout';

type VehicleProfileFormPageProps = NativeStackScreenProps<
  SettingsStackParamList,
  'SettingsVehicleProfileForm'
>;

export function VehicleProfileFormPage({
  route,
  navigation,
}: VehicleProfileFormPageProps) {
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { vehicleId, isInitial } = route.params;

  const [nickname, setNickname] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<'ICE' | 'EV'>('ICE');
  const [isDefault, setIsDefault] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toast = useToast();

  const { data: vehicle } = useVehicle(vehicleId ?? '');
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  useEffect(() => {
    if (vehicle) {
      setNickname(vehicle.nickname);
      setManufacturer(vehicle.manufacturer);
      setModel(vehicle.model);
      setType(vehicle.type);
      setIsDefault(vehicle.isDefault);
    }
  }, [vehicle]);

  const handleFormChange = (field: string, value: string) => {
    if (field === 'nickname') setNickname(value);
    if (field === 'manufacturer') setManufacturer(value);
    if (field === 'model') setModel(value);
  };

  const handleSave = async () => {
    if (!nickname) return Alert.alert('차량 별칭을 입력하세요');

    try {
      if (vehicleId) {
        // 수정
        await updateVehicleMutation.mutateAsync({
          id: vehicleId,
          data: {
            nickname,
            manufacturer,
            model,
            type,
            isDefault,
          },
        });
      } else {
        // 추가
        await createVehicleMutation.mutateAsync({
          nickname,
          manufacturer,
          model,
          type,
          isDefault,
        });
      }

      if (isInitial) {
        rootNavigation.reset({
          index: 0,
          routes: [
            {
              name: '정비',
              state: { routes: [{ name: 'MaintenanceStackScreen' }] },
            },
          ],
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleSetDefaultProfile = async () => {
    if (!vehicleId) return;

    try {
      const updatedVehicle = await vehicleRepository.setAsDefault(vehicleId);
      toast.show({
        placement: 'bottom',
        containerStyle: {
          marginBottom: 25,
        },
        duration: 2000,
        render: ({ id }) => {
          const uniqueToastId = 'toast-' + id;
          return (
            <Toast nativeID={uniqueToastId} action="muted" variant="solid">
              <ToastTitle>설정 완료!</ToastTitle>
              <ToastDescription>
                {updatedVehicle.nickname} 차량이 기본 프로필로 설정되었습니다.
              </ToastDescription>
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
    if (!vehicleId) return;

    try {
      await deleteVehicleMutation.mutateAsync(vehicleId);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageLayout>
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
            editingId={vehicleId ?? null}
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
    </PageLayout>
  );
}

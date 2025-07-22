import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Box } from '@shared/components/ui/box';
import { Button, ButtonText } from '@shared/components/ui/button';
import { VStack } from '@/shared/components/ui/vstack';
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from '@shared/components/ui/toast';
import {
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
import { VehicleFormData } from '@/features/vehicle/VehicleForm';
import ConfirmModal from '@shared/components/ui/modal/ConfirmModal';

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

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const toast = useToast();

  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const handleSave = async (formData: VehicleFormData) => {
    const trimmedNickname = formData.nickname.trim();
    const trimmedManufacturer = formData.manufacturer.trim();
    const trimmedModel = formData.model.trim();

    if (!formData.nickname) return Alert.alert('차량 별칭을 입력하세요');
    if (!trimmedNickname) return Alert.alert('차량 별칭을 입력하세요');
    if (!trimmedManufacturer) return Alert.alert('제조사를 입력하세요');
    if (!trimmedModel) return Alert.alert('모델을 입력하세요');

    try {
      if (vehicleId) {
        // 수정
        await updateVehicleMutation.mutateAsync({
          id: vehicleId,
          data: {
            nickname: trimmedNickname,
            manufacturer: trimmedManufacturer,
            model: trimmedModel,
            type: formData.type,
            isDefault: formData.isDefault,
            odometer: formData.odometer,
          },
        });
      } else {
        // 추가
        await createVehicleMutation.mutateAsync({
          nickname: trimmedNickname,
          manufacturer: trimmedManufacturer,
          model: trimmedModel,
          type: formData.type,
          isDefault: formData.isDefault,
          odometer: formData.odometer,
        });
      }

      if (isInitial) {
        rootNavigation.reset({
          index: 0,
          routes: [
            {
              name: '홈',
              state: { routes: [{ name: 'HomeStackScreen' }] },
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
      <VStack className="flex-1 bg-white p-4 pb-10">
        <VehicleForm
          onSubmit={handleSave}
          editingId={vehicleId ?? null}
          setDefaultProfile={handleSetDefaultProfile}
        />

        {/* 삭제 버튼 (수정 모드에서만) */}
        {vehicleId && (
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
        )}

        {/* 삭제 확인 모달 */}
        {vehicleId && (
          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleDelete}
            title="삭제하기"
            description="해당 차량 프로필을 삭제하시겠습니까?"
            confirmText="확인"
            cancelText="취소"
          />
        )}
      </VStack>
    </PageLayout>
  );
}

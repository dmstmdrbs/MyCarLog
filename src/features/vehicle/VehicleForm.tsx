import { Button, ButtonText } from '@shared/components/ui/button';

import { Box } from '@shared//components/ui/box';
import {
  FormControl,
  FormControlLabel,
  FormControlHelperText,
  FormControlHelper,
} from '@shared//components/ui/form-control';
import { CircleIcon } from '@shared//components/ui/icon';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@shared/components/ui/radio';
import { Text } from '@shared/components/ui/text';
import React, { useEffect, useState } from 'react';
import ConfirmModal from '@shared/components/ui/modal/ConfirmModal';
import { useVehicle } from './hooks/useVehicleQueries';
import { VStack } from '@/shared/components/ui/vstack';
import { ScrollView } from 'react-native';
import { FormField } from '@/shared/components/form/FormField';

interface VehicleFormProps {
  setDefaultProfile: () => void;
  onSubmit: (formData: VehicleFormData) => void;
  editingId: string | null;
}

export type VehicleFormData = {
  nickname: string;
  manufacturer: string;
  model: string;
  type: 'ICE' | 'EV';
  isDefault: boolean;
  odometer: number;
};

export const VehicleForm = ({
  setDefaultProfile,
  onSubmit,
  editingId,
}: VehicleFormProps) => {
  const { data: vehicle } = useVehicle(editingId ?? '');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<'ICE' | 'EV'>('ICE');
  const [isDefault, setIsDefault] = useState(false);
  const [odometer, setOdometer] = useState(0);

  useEffect(() => {
    if (vehicle) {
      setNickname(vehicle.nickname.trim());
      setManufacturer(vehicle.manufacturer.trim());
      setModel(vehicle.model.trim());
      setType(vehicle.type);
      setIsDefault(vehicle.isDefault);
      setOdometer(vehicle.odometer);
    }
  }, [vehicle]);

  const handleSubmit = () => {
    onSubmit({
      nickname: nickname.trim(),
      manufacturer,
      model,
      type,
      isDefault,
      odometer,
    });
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <VStack className="flex-1 px-4 py-6">
        <FormControl className="flex-1 flex flex-col justify-between">
          <VStack space="lg">
            {/* 헤더 섹션 */}
            <FormControlHelper>
              <FormControlLabel className="mr-2">
                <Text className="text-xl font-bold text-gray-900">
                  {editingId ? '차량 프로필 수정' : '새로운 차량'}
                </Text>
              </FormControlLabel>
              <FormControlHelperText className="text-sm text-gray-500 mt-1">
                {editingId
                  ? '차량 프로필을 수정합니다.'
                  : '차량 프로필을 생성합니다.'}
              </FormControlHelperText>
            </FormControlHelper>

            {/* 입력 필드들 */}
            <VStack space="md">
              {/* 차량 닉네임 */}
              <FormField
                type="text"
                label="차량 닉네임"
                required
                value={nickname}
                onChangeText={setNickname}
                placeholder="예: 내 차, 회사 차량"
                autoCapitalize="words"
                autoCorrect={false}
              />

              {/* 제조사 */}
              <FormField
                type="text"
                label="제조사"
                value={manufacturer}
                onChangeText={(text) => {
                  if (text.length === 0) {
                    setManufacturer('');
                    return;
                  }
                  setManufacturer(text);
                }}
                placeholder="예: 현대, 기아, BMW"
                autoCapitalize="words"
                autoCorrect={false}
              />

              {/* 모델명 */}
              <FormField
                type="text"
                label="모델명"
                value={model}
                onChangeText={setModel}
                placeholder="예: 아반떼, K5, 3시리즈"
                autoCapitalize="words"
                autoCorrect={false}
              />

              {/* 총 주행거리 */}
              <FormField
                type="number"
                label="총 주행거리 (km)"
                value={odometer.toString()}
                onChangeText={(text) => {
                  if (text.length === 0) {
                    setOdometer(0);
                    return;
                  }
                  const numericValue = Number(parseFloat(text).toFixed(2));
                  if (!isNaN(numericValue)) {
                    setOdometer(Number(numericValue));
                  }
                }}
                placeholder="예: 50000"
                keyboardType="numeric"
                returnKeyType="next"
              />

              {/* 차량 타입 선택 */}
              <VStack space="sm">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  차량 타입
                </Text>
                <RadioGroup
                  className="flex flex-row gap-4"
                  value={type}
                  onChange={(value) => setType(value as 'ICE' | 'EV')}
                >
                  <Radio
                    value="ICE"
                    size="md"
                    isInvalid={false}
                    isDisabled={false}
                    className="flex-1"
                  >
                    <RadioIndicator className="border-2 border-gray-300">
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel className="text-base font-medium">
                      내연기관
                    </RadioLabel>
                  </Radio>
                  <Radio
                    value="EV"
                    size="md"
                    isInvalid={false}
                    isDisabled={false}
                    className="flex-1"
                  >
                    <RadioIndicator className="border-2 border-gray-300">
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                    <RadioLabel className="text-base font-medium">
                      전기차
                    </RadioLabel>
                  </Radio>
                </RadioGroup>
              </VStack>

              {/* 기본 프로필 설정 (수정 시에만 표시) */}
              {editingId && (
                <VStack space="sm">
                  <Box className="mt-4">
                    <Button
                      onPress={() => setIsConfirmModalOpen(true)}
                      action="secondary"
                      className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl"
                    >
                      <ButtonText className="text-base font-medium text-gray-700">
                        기본 프로필로 설정
                      </ButtonText>
                    </Button>
                  </Box>
                  <ConfirmModal
                    isOpen={isConfirmModalOpen}
                    onClose={() => setIsConfirmModalOpen(false)}
                    onConfirm={setDefaultProfile}
                    title="기본 프로필로 설정"
                    description="기본 프로필로 설정하시겠습니까?"
                    confirmText="확인"
                    cancelText="취소"
                  />
                </VStack>
              )}
            </VStack>

            {/* 하단 고정 버튼 */}
            <Box className="mt-6">
              <Button
                onPress={handleSubmit}
                className="w-full bg-primary-500 rounded-xl"
                action="primary"
              >
                <ButtonText className="text-base font-semibold text-white">
                  {editingId ? '수정 완료' : '차량 추가'}
                </ButtonText>
              </Button>
            </Box>
          </VStack>
        </FormControl>
      </VStack>
    </ScrollView>
  );
};

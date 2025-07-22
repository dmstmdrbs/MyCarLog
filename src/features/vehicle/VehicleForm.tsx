import { Button, ButtonText } from '@shared/components/ui/button';

import { Box } from '@shared//components/ui/box';
import {
  FormControl,
  FormControlLabel,
  FormControlHelperText,
  FormControlHelper,
} from '@shared//components/ui/form-control';
import { CircleIcon } from '@shared//components/ui/icon';
import { Input, InputField } from '@shared//components/ui/input';
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
import { HStack } from '@/shared/components/ui/hstack';

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

  return (
    <VStack className="flex-1">
      <FormControl className="flex-1 flex flex-col justify-between">
        <VStack space="md">
          <FormControlHelper>
            <FormControlLabel className="mr-2">
              <Text className="text-lg font-bold">
                {editingId ? '차량 프로필 수정' : '새로운 차량'}
              </Text>
            </FormControlLabel>
            <FormControlHelperText className="text-sm text-gray-500">
              {editingId
                ? '차량 프로필을 수정합니다.'
                : '차량 프로필을 생성합니다.'}
            </FormControlHelperText>
          </FormControlHelper>

          <VStack space="sm">
            <Text className="text-sm font-bold mb-1">차량 닉네임</Text>
            <Input>
              <InputField
                value={nickname}
                onChangeText={(text) => setNickname(text)}
                placeholder="차량의 닉네임을 지정해주세요."
              />
            </Input>
          </VStack>
          <VStack space="sm">
            <Text className="text-sm font-bold mb-1">제조사</Text>
            <Input>
              <InputField
                value={manufacturer}
                onChangeText={(text) => {
                  if (text.length === 0) {
                    setManufacturer('');
                    return;
                  }
                  setManufacturer(text);
                }}
                placeholder="제조사를 입력해주세요."
              />
            </Input>
          </VStack>
          <VStack space="sm">
            <Text className="text-sm font-bold mb-1">모델명</Text>
            <Input>
              <InputField
                value={model}
                onChangeText={(text) => setModel(text)}
                placeholder="모델명을 입력해주세요."
              />
            </Input>
          </VStack>
          <VStack space="sm">
            <Text className="text-sm font-bold mb-1">총 주행거리</Text>
            <Input>
              <InputField
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
                placeholder="주행거리를 입력해주세요."
              />
            </Input>
          </VStack>

          <HStack>
            <RadioGroup
              className="flex flex-row gap-2"
              value={type}
              onChange={(value) => setType(value as 'ICE' | 'EV')}
            >
              <Radio value="ICE" size="md" isInvalid={false} isDisabled={false}>
                <RadioIndicator>
                  <RadioIcon as={CircleIcon} />
                </RadioIndicator>
                <RadioLabel>내연기관</RadioLabel>
              </Radio>
              <Radio value="EV" size="md" isInvalid={false} isDisabled={false}>
                <RadioIndicator>
                  <RadioIcon as={CircleIcon} />
                </RadioIndicator>
                <RadioLabel>전기차</RadioLabel>
              </Radio>
            </RadioGroup>
          </HStack>
          {editingId && (
            <>
              <Box className="mb-2">
                <Button
                  onPress={() => setIsConfirmModalOpen(true)}
                  action="secondary"
                  className="w-full bg-slate-100"
                >
                  <ButtonText>기본 프로필로 설정</ButtonText>
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
            </>
          )}
        </VStack>
        <Box className="flex flex-row gap-2 mt-2 mb-4">
          <Button
            onPress={() =>
              onSubmit({
                nickname: nickname.trim(),
                manufacturer,
                model,
                type,
                isDefault,
                odometer,
              })
            }
            className="flex-1"
            action="primary"
          >
            <ButtonText>{editingId ? '완료' : '추가'}</ButtonText>
          </Button>
        </Box>
      </FormControl>
    </VStack>
  );
};

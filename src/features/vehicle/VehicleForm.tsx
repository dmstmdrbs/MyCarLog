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
import React, { useState } from 'react';
import ConfirmModal from '@shared/components/ui/modal/ConfirmModal';

interface VehicleFormProps {
  nickname: string;
  manufacturer: string;
  model: string;
  type: 'ICE' | 'EV';
  onChange: (field: string, value: string) => void;
  onTypeChange: (type: 'ICE' | 'EV') => void;
  setDefaultProfile: () => void;
  onSubmit: () => void;
  editingId: string | null;
  isDefault: boolean;
}

export const VehicleForm = ({
  nickname,
  manufacturer,
  model,
  type,
  onChange,
  onTypeChange,
  setDefaultProfile,
  onSubmit,
  editingId,
}: VehicleFormProps) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  return (
    <FormControl className="flex-1 flex flex-col justify-between">
      <Box className="flex-1 flex flex-col">
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

        <Box className="flex flex-col gap-2 mb-2">
          <Box>
            <Text className="text-sm font-bold mb-1">차량 닉네임</Text>
            <Input>
              <InputField
                value={nickname}
                onChangeText={(text) => onChange('nickname', text)}
                placeholder="차량의 닉네임을 지정해주세요."
              />
            </Input>
          </Box>
          <Box>
            <Text className="text-sm font-bold mb-1">제조사</Text>
            <Input>
              <InputField
                value={manufacturer}
                onChangeText={(text) => onChange('manufacturer', text)}
                placeholder="제조사를 입력해주세요."
              />
            </Input>
          </Box>
          <Box>
            <Text className="text-sm font-bold mb-1">모델명</Text>
            <Input>
              <InputField
                value={model}
                onChangeText={(text) => onChange('model', text)}
                placeholder="모델명을 입력해주세요."
              />
            </Input>
          </Box>
        </Box>

        <Box className="mb-2">
          <RadioGroup
            className="flex flex-row gap-2"
            value={type}
            onChange={(value) => onTypeChange(value as 'ICE' | 'EV')}
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
        </Box>
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
      </Box>
      <Box className="flex flex-row gap-2 mt-4">
        <Button onPress={onSubmit} className="flex-1" action="primary">
          <ButtonText>{editingId ? '수정' : '추가'}</ButtonText>
        </Button>
      </Box>
    </FormControl>
  );
};

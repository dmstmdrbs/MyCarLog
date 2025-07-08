import { ButtonText, Button } from '@/shared/components/ui/button';
import { VStack } from '@/shared/components/ui/vstack';
import { PaymentMethodType } from '@/shared/models/PaymentMethod';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@shared/components/ui/form-control';
import { CircleIcon } from '@shared/components/ui/icon';
import { Input, InputField } from '@shared/components/ui/input';
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from '@shared/components/ui/radio';
import { Text } from '@shared/components/ui/text';
import { useState } from 'react';
import { Alert } from 'react-native';

export const PaymentMethodForm = ({
  onSubmit,
}: {
  onSubmit: (name: string, type: PaymentMethodType['type']) => void;
}) => {
  const [paymentType, setPaymentType] =
    useState<PaymentMethodType['type']>('credit');
  const [paymentName, setPaymentName] = useState<string>('');

  const handleSubmit = () => {
    const trimmedPaymentName = paymentName.trim();
    if (trimmedPaymentName.length === 0) {
      Alert.alert('결제 수단 추가', '결제 수단 이름을 입력해주세요.');
      return;
    }

    onSubmit(trimmedPaymentName, paymentType);
    setPaymentName('');
    setPaymentType('credit');
  };

  return (
    <VStack className="gap-2">
      <FormControl className="w-full">
        <FormControlLabel>
          <FormControlLabelText>
            <Text className="text-sm font-medium text-gray-700">결제 타입</Text>
          </FormControlLabelText>
        </FormControlLabel>
        <RadioGroup
          className="flex flex-row gap-2"
          value={paymentType}
          onChange={(value: 'credit' | 'giftcard' | 'etc') =>
            setPaymentType(value)
          }
        >
          <Radio value="credit" size="md" isInvalid={false} isDisabled={false}>
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>카드</RadioLabel>
          </Radio>

          <Radio
            value="giftcard"
            size="md"
            isInvalid={false}
            isDisabled={false}
          >
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>상품권</RadioLabel>
          </Radio>
          <Radio value="etc" size="md" isInvalid={false} isDisabled={false}>
            <RadioIndicator>
              <RadioIcon as={CircleIcon} />
            </RadioIndicator>
            <RadioLabel>기타</RadioLabel>
          </Radio>
        </RadioGroup>
        <FormControlLabel>
          <FormControlLabelText>
            <Text className="text-sm font-medium text-gray-700">
              결제 수단 이름
            </Text>
          </FormControlLabelText>
        </FormControlLabel>
        <Input className="w-full rounded-xl border-2 border-gray-200 bg-gr">
          <InputField
            placeholder="결제 수단 이름"
            value={paymentName}
            className="text-lg font-medium"
            onChangeText={(text) => {
              setPaymentName(text);
            }}
          />
        </Input>
      </FormControl>
      <Button onPress={handleSubmit}>
        <ButtonText>추가</ButtonText>
      </Button>
    </VStack>
  );
};

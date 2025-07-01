import { Box } from '@shared/components/ui/box';
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

export const PaymentMethodForm = ({
  name,
  type,
  onChangeName,
  onChangeType,
}: {
  name: string;
  type: 'credit' | 'giftcard' | 'etc';
  onChangeName: (name: string) => void;
  onChangeType: (type: 'credit' | 'giftcard' | 'etc') => void;
}) => {
  return (
    <Box className="flex flex-row justify-start w-full gap-2">
      <FormControl className="w-full">
        <FormControlLabel>
          <FormControlLabelText>
            <Text className="text-sm font-medium text-gray-700">결제 타입</Text>
          </FormControlLabelText>
        </FormControlLabel>
        <RadioGroup
          className="flex flex-row gap-2"
          value={type}
          onChange={(value: 'credit' | 'giftcard' | 'etc') =>
            onChangeType(value)
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
            value={name}
            className="text-lg font-medium"
            onChangeText={onChangeName}
          />
        </Input>
      </FormControl>
    </Box>
  );
};

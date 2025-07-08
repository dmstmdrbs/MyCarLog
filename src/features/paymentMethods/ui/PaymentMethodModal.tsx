import { Alert } from 'react-native';

import { Button, ButtonText } from '@/shared/components/ui/button';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalFooter,
} from '@/shared/components/ui/modal';
import { PaymentMethodForm } from '@/shared/components/PaymentMethodForm';
import { PaymentMethodList } from '@/shared/components/PaymentMethodList';
import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { Divider } from '@/shared/components/ui/divider';
import { ModalHeader } from '@/shared/components/ui/modal';
import type PaymentMethod from '@/shared/models/PaymentMethod';
import { PaymentMethodType } from '@/shared/models/PaymentMethod';

import {
  useCreatePaymentMethod,
  usePaymentMethods,
} from '../hooks/usePaymentMethodQueries';

type PaymentMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentMethod: (paymentMethod: PaymentMethod) => void;
};

export const PaymentMethodModal = ({
  isOpen,
  onClose,
  onSelectPaymentMethod,
}: PaymentMethodModalProps) => {
  const { data: paymentMethods } = usePaymentMethods();

  const createPaymentMethod = useCreatePaymentMethod();

  const handleAddPaymentMethod = async (
    name: string,
    type: PaymentMethodType['type'],
  ) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      Alert.alert('결제 수단 추가', '결제 수단 이름을 입력해주세요.');
      return;
    }

    try {
      await createPaymentMethod.mutateAsync({ name: trimmedName, type });
    } catch (error) {
      Alert.alert(
        '결제 수단 추가 실패',
        '결제 수단 추가 중 오류가 발생했습니다.',
      );
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text className="text-lg font-semibold text-gray-900">
            지불 수단 선택
          </Text>
        </ModalHeader>

        <Box className="max-h-[400px] min-h-[200px] py-2 bg-white">
          <PaymentMethodList
            paymentMethods={paymentMethods ?? []}
            onClickPaymentMethodItem={(method) => {
              onSelectPaymentMethod(method);
              onClose();
            }}
          />
          <Divider className="my-1" orientation="horizontal" />
          <Text className="text-lg font-semibold text-gray-700">
            결제 수단 추가
          </Text>
          <PaymentMethodForm onSubmit={handleAddPaymentMethod} />
        </Box>
        <ModalFooter>
          <Button onPress={onClose}>
            <ButtonText>취소</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

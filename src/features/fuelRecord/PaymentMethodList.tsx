import { Box } from '@shared/components/ui/box';
import { Button, ButtonText } from '@shared/components/ui/button';
import PaymentMethod from '@shared/models/PaymentMethod';
import { FlatList } from 'react-native';

const paymentMethodTypeMap = {
  credit: '카드',
  giftcard: '상품권',
  etc: '기타',
  cash: '현금',
} as const;

export const PaymentMethodList = ({
  paymentMethods,
  onClickPaymentMethodItem,
}: {
  paymentMethods: PaymentMethod[];
  onClickPaymentMethodItem: (paymentMethod: PaymentMethod) => void;
}) => {
  return (
    <FlatList
      contentContainerStyle={{
        gap: 10,
      }}
      data={paymentMethods}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Box className="flex flex-col gap-0.5">
          <Button
            className="bg-white justify-start rounded-xl w-full focus:border-primary-500 focus:bg-white transition-all"
            onPress={() => {
              onClickPaymentMethodItem(item);
            }}
          >
            <ButtonText className="text-lg font-medium text-gray-700">
              {item.name} ({paymentMethodTypeMap[item.type]})
            </ButtonText>
          </Button>
        </Box>
      )}
    />
  );
};

import { Text } from '@shared/components/ui/text';
import useFuelRecord from '@features/fuelRecord/hooks/useFuelRecord';
import { Box } from '@shared/components/ui/box';
import { FlatList } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@shared/components/ui/button';
import { AddIcon } from '@shared/components/ui/icon';
import { useNavigation } from '@react-navigation/native';
import { FuelStackParamList } from '@/pages/fuelManagement/navigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDate } from 'date-fns';
import { ko } from 'date-fns/locale';
import useVehicle from '@/features/vehicle/hooks/useVehicle';
import { formatNumber } from '@/shared/utils/format';
import PaymentMethod from '@/shared/models/PaymentMethod';

type Props = {
  vehicleId: string;
};

const paymentMethodMap: Record<PaymentMethod['type'], string> = {
  credit: '카드',
  cash: '현금',
  giftcard: '상품권',
  etc: '기타',
} as const;

export const FuelManagement = ({ vehicleId }: Props) => {
  const { vehicle } = useVehicle(vehicleId);
  const isEV = vehicle?.type === 'EV';
  const unit = isEV ? 'kWh' : 'L';
  const unitPrice = isEV ? '원/kWh' : '원/L';

  const navigation =
    useNavigation<NativeStackNavigationProp<FuelStackParamList, 'FuelMain'>>();

  const { fuelRecords } = useFuelRecord({
    vehicleId: vehicleId,
  });

  const navigateToFuelRecord = () => {
    navigation.navigate('FuelRecord', { vehicleId: vehicleId });
  };

  return (
    <Box className="relative flex-1 w-full h-full">
      <FlatList
        contentContainerClassName="flex-1 bg-white"
        data={fuelRecords}
        renderItem={({ item }) => (
          <Box className="flex flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-sm text-gray-500">
              {formatDate(item.date, 'yyyy-MM-dd', { locale: ko })}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatNumber(item.totalCost)}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatNumber(item.unitPrice)}
              {unitPrice}
            </Text>
            <Text className="text-sm text-gray-500">
              {formatNumber(item.amount)}
              {unit}
            </Text>
            <Text className="text-sm text-gray-500">
              {paymentMethodMap[item.paymentMethodId as PaymentMethod['type']]}
            </Text>
          </Box>
        )}
      />
      <Button
        className="w-16 h-16 rounded-full bg-primary-500 text-white absolute bottom-10 right-4"
        onPress={navigateToFuelRecord}
      >
        <ButtonText>
          <ButtonIcon as={AddIcon} />
        </ButtonText>
      </Button>
    </Box>
  );
};

export default FuelManagement;

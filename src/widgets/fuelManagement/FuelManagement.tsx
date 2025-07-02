import { Text } from '@shared/components/ui/text';
import { useFuelRecords } from '@features/fuelRecord/hooks/useFuelRecordQueries';
import { Box } from '@shared/components/ui/box';
import { FlatList } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@shared/components/ui/button';
import { AddIcon } from '@shared/components/ui/icon';
import { useNavigation } from '@react-navigation/native';
import { FuelStackParamList } from '@pages/fuelManagement/navigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDate } from 'date-fns';
import { ko } from 'date-fns/locale';

import { formatNumber } from '@shared/utils/format';
import PaymentMethod from '@shared/models/PaymentMethod';
import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';

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
  const {
    data: vehicle,
    isLoading: vehicleLoading,
    error: vehicleError,
  } = useVehicle(vehicleId);
  const {
    data: fuelRecords = [],
    isLoading: recordsLoading,
    error: recordsError,
  } = useFuelRecords(vehicleId);
  const isEV = vehicle?.type === 'EV';
  const unit = isEV ? 'kWh' : 'L';
  const unitPrice = isEV ? '원/kWh' : '원/L';

  const navigation =
    useNavigation<NativeStackNavigationProp<FuelStackParamList, 'FuelMain'>>();

  const navigateToFuelRecord = () => {
    navigation.navigate('FuelRecord', { vehicleId: vehicleId });
  };

  if (vehicleLoading || recordsLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>로딩 중...</Text>
      </Box>
    );
  }
  if (vehicleError || recordsError) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Text>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </Box>
    );
  }

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

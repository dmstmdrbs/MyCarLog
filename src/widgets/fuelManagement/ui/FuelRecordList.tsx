import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { format } from 'date-fns';
import { formatNumber } from '@/shared/utils/format';
import { FlatList } from 'react-native';
import { paymentMethodMap } from '@shared/constants/paymentMethodMap';
import { FuelRecordType } from '@/shared/models/FuelRecord';

interface FuelRecordListProps {
  fuelRecords: FuelRecordType[];
  unit: string;
  unitPrice: string;
}

export const FuelRecordList = ({
  fuelRecords,
  unit,
  unitPrice,
}: FuelRecordListProps) => {
  const renderItem = ({ item }: { item: FuelRecordType }) => (
    <Box className="flex flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
      <Text className="text-sm text-gray-500">
        {format(item.date, 'yyyy-MM-dd')}
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
        {paymentMethodMap[item.paymentType]}
      </Text>
    </Box>
  );

  if (fuelRecords.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-light h-full">
        <Text className="text-typography-500 text-center">
          주유 기록이 없습니다.
        </Text>
      </Box>
    );
  }
  return (
    <FlatList
      data={fuelRecords}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

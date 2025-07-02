import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { formatDate } from 'date-fns';
import { formatNumber } from '@/shared/utils/format';
import { FlatList } from 'react-native';

interface FuelRecord {
  id: string | number;
  date: string | number | Date;
  totalCost: number;
  unitPrice: number;
  amount: number;
  paymentType: string;
}

interface FuelRecordListProps {
  fuelRecords: FuelRecord[];
  unit: string;
  unitPrice: string;
  paymentMethodMap: Record<string, string>;
}

export const FuelRecordList = ({
  fuelRecords,
  unit,
  unitPrice,
  paymentMethodMap,
}: FuelRecordListProps) => {
  const renderItem = ({ item }: { item: FuelRecord }) => (
    <Box className="flex flex-row justify-between items-center p-4 border-b border-gray-200">
      <Text className="text-sm text-gray-500">
        {formatDate(item.date, 'yyyy-MM-dd')}
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

  return (
    <FlatList
      contentContainerClassName="flex-1 bg-white"
      data={fuelRecords}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

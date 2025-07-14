import { Center } from '@/shared/components/ui/center';
import { Heading } from '@/shared/components/ui/heading';
import { HStack } from '@/shared/components/ui/hstack';
import { Icon } from '@/shared/components/ui/icon';
import { Text } from '@/shared/components/ui/text';
import { VStack } from '@/shared/components/ui/vstack';
import { formatNumber } from '@/shared/utils/format';
import { Fuel, Wrench } from 'lucide-react-native';
import { RecentRecord } from './hooks/useRecentRecords';
import { format } from 'date-fns';
import { useSelectedVehicle } from '@/features/vehicle';
import { useMaintenanceItemQueries } from '@/features/maintenance/hooks/useMaintenanceItemQueries';
import { useMemo } from 'react';

const RecentRecordItem = ({ record }: { record: RecentRecord }) => {
  const { selectedVehicle } = useSelectedVehicle();
  const { data: maintenanceItems } = useMaintenanceItemQueries();

  const maintenanceItemMap = useMemo(() => {
    return new Map(maintenanceItems?.map((item) => [item.id, item]));
  }, [maintenanceItems]);

  return (
    <HStack key={record.id} className="rounded-lg p-4" space="md">
      <VStack className="items-center" space="sm">
        <Center className="bg-gray-100 rounded-full p-2 w-14 h-14 items-center justify-center">
          <Icon
            as={record.type === 'fuel' ? Fuel : Wrench}
            color="#4a4a4a"
            size="xl"
          />
        </Center>

        <Text className="text-typography-600">
          {format(new Date(record.date), 'MM.dd')}
        </Text>
      </VStack>
      <VStack className="flex-1 p-1">
        <Heading size="lg" className="text-gray-800">
          {record.type === 'fuel'
            ? selectedVehicle?.type === 'EV'
              ? `충전 ${formatNumber(record.amount)}kWh`
              : `주유 ${formatNumber(record.amount)}L`
            : record.maintenanceItemId
              ? (maintenanceItemMap.get(record.maintenanceItemId)?.name ??
                '정비')
              : '정비'}
        </Heading>
        <HStack className="justify-between">
          <Text className="text-gray-800" size="lg">
            {record.type === 'fuel'
              ? `${record.stationName}${selectedVehicle?.type === 'EV' ? ' 충전소' : ' 주유소'}`
              : record.isDiy
                ? '자가정비'
                : (record?.shopName ?? '정비소')}
          </Text>
          {record.type === 'fuel' && (
            <Text className="text-gray-600" size="md">
              {formatNumber(record.unitPrice)}원/
              {selectedVehicle?.type === 'EV' ? 'kWh' : 'L'}
            </Text>
          )}
        </HStack>
        <HStack className="justify-between mt-2">
          <HStack>
            <Text className="text-gray-700" size="md">
              {record.type === 'fuel'
                ? `${formatNumber(record.amount)}L`
                : `누적 ${formatNumber(record.odometer)}KM`}
            </Text>
          </HStack>
          <HStack>
            <Text className="text-gray-900 font-semibold" size="xl">
              {formatNumber(record.cost)}원
            </Text>
          </HStack>
        </HStack>
        {record.memo && (
          <VStack className="bg-gray-100 rounded-lg p-2 mt-2">
            <Text className="text-gray-600" size="md">
              {record.memo}
            </Text>
          </VStack>
        )}
      </VStack>
    </HStack>
  );
};
export const RecentRecords = ({ records }: { records: RecentRecord[] }) => {
  return (
    <VStack space="md">
      {records.map((record) => (
        <RecentRecordItem key={record.id} record={record} />
      ))}
    </VStack>
  );
};

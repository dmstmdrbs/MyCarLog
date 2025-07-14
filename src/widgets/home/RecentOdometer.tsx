import { Text } from '@/shared/components/ui/text';
import { formatNumber } from '@/shared/utils/format';
import { useSelectedVehicle } from '@/features/vehicle';

export const RecentOdometer = ({ odometer }: { odometer: number }) => {
  const { selectedVehicle } = useSelectedVehicle();

  return (
    <Text className="text-gray-700" size="xl">
      지금까지 {selectedVehicle?.nickname}와{' '}
      <Text className="text-gray-900 font-bold" size="xl">
        {formatNumber(odometer)}KM
      </Text>
      를 달렸어요!
    </Text>
  );
};

import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { formatNumber } from '@/shared/utils/format';

interface MonthlyStatsCardProps {
  totalCost: number;
  totalAmount: number;
  unit: string;
}

export const MonthlyStatsCard = ({
  totalCost,
  totalAmount,
  unit,
}: MonthlyStatsCardProps) => (
  <Box className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
    <Text className="text-sm text-gray-600 mb-2">이번 달 통계</Text>
    <Box className="flex-row justify-between">
      <Box>
        <Text className="text-2xl font-bold text-gray-900">
          {formatNumber(totalCost)}원
        </Text>
        <Text className="text-sm text-gray-600">총 지출</Text>
      </Box>
      <Box>
        <Text className="text-2xl font-bold text-gray-900">
          {formatNumber(totalAmount)} {unit}
        </Text>
        <Text className="text-sm text-gray-600">총 {unit}</Text>
      </Box>
    </Box>
  </Box>
);

import { HStack } from '@/shared/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/shared/components/ui/skeleton';
import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { formatNumber } from '@shared/utils/format';
import { ReactNode } from 'react';

interface StatItem {
  icon: ReactNode;
  label: string;
  value: string;
}

interface Props {
  totalCost: number;
  totalAmount: number;
  avgUnitPrice: number;
  recordCount: number;
  hideIcon?: boolean;
}

export const MonthlyStatsCard = ({
  totalCost,
  totalAmount,
  avgUnitPrice,
  recordCount,
  hideIcon = false,
}: Props) => {
  console.log(
    'MonthlyStatsCard',
    totalCost,
    totalAmount,
    avgUnitPrice,
    recordCount,
  );
  const stats: StatItem[] = [
    { icon: '💸', label: '총 주유비', value: `${formatNumber(totalCost)}원` },
    { icon: '⛽️', label: '총 주유량', value: `${formatNumber(totalAmount)}L` },
    {
      icon: '💲',
      label: '평균 단가',
      value: `${formatNumber(avgUnitPrice)}원`,
    },
    { icon: '🔄', label: '주유 횟수', value: `${formatNumber(recordCount)}회` },
  ];

  return (
    <HStack className="flex-row flex-wrap justify-between bg-white rounded-lg p-4 h-24">
      {stats.map((item) => (
        <Box key={item.label} className="w-1/4 items-center justify-center">
          {!hideIcon && <Text className="text-2xl mb-1">{item.icon}</Text>}
          <Text className="font-bold text-base mb-0.5">{item.value}</Text>
          <Text className="text-xs text-gray-500">{item.label}</Text>
        </Box>
      ))}
    </HStack>
  );
};

export const MonthlyStatsCardSkeleton = () => {
  return (
    <HStack className="flex-row flex-wrap justify-evenly bg-background-100 rounded-lg p-2 w-full h-24">
      <Box className="w-1/4 items-center justify-center gap-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <SkeletonText className="h-3 w-12 rounded-md" />
      </Box>
      <Box className="w-1/4 items-center justify-center gap-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <SkeletonText className="h-3 w-12 rounded-md" />
      </Box>
      <Box className="w-1/4 items-center justify-center gap-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <SkeletonText className="h-3 w-12 rounded-md" />
      </Box>
      <Box className="w-1/4 items-center justify-center gap-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <SkeletonText className="h-3 w-12 rounded-md" />
      </Box>
    </HStack>
  );
};

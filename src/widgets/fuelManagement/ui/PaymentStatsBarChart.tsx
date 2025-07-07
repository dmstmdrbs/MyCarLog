import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Heading } from '@/shared/components/ui/heading';
import { Skeleton, SkeletonText } from '@/shared/components/ui/skeleton';
import { VStack } from '@/shared/components/ui/vstack';

interface PaymentStat {
  paymentName: string;
  totalCost: number;
  usageCount: number;
}

interface Props {
  paymentStats: PaymentStat[];
}

export const PaymentStatsBarChart = ({ paymentStats }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48; // padding 고려

  if (!paymentStats || paymentStats.length === 0) {
    return <Text>-</Text>;
  }

  return (
    <Box className="bg-white p-2">
      <Heading size="sm" className="font-bold text-lg mb-2">
        결제 수단별 지출 통계
      </Heading>
      <BarChart
        data={{
          labels: paymentStats.map((s) => s.paymentName ?? '기타'),
          datasets: [
            {
              data: paymentStats.map((s) => s.totalCost),
            },
          ],
        }}
        width={chartWidth}
        height={180}
        fromZero
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix="원"
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
          barPercentage: 0.6,
        }}
        style={{ borderRadius: 12 }}
      />
    </Box>
  );
};

export const PaymentStatsBarChartSkeleton = () => {
  return (
    <VStack className="rounded-lg p-2 w-full bg-background-light" space="md">
      <SkeletonText className="h-4 w-24 rounded-md background-50" />
      <Skeleton className="h-48 w-full rounded-md background-50" />
    </VStack>
  );
};

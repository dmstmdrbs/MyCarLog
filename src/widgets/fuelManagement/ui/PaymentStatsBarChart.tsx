import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

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
    <Box className="mb-4">
      <Text className="font-bold text-lg mb-2">결제 수단별 지출 통계</Text>
      <BarChart
        data={{
          labels: paymentStats.map((s) => s.paymentName),
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

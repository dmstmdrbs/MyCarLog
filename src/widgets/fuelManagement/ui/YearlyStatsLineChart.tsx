import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { formatNumber } from '@shared/utils/format';

interface YearlyStat {
  month: number;
  totalCost: number;
  totalAmount: number;
  recordCount: number;
}

interface Props {
  yearlyStats: YearlyStat[];
}

export const YearlyStatsLineChart = ({ yearlyStats }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 48;

  if (!yearlyStats || yearlyStats.length === 0) {
    return <Text>-</Text>;
  }

  return (
    <Box className="mb-4">
      <Text className="font-bold text-lg mb-2">월별 주유량 추이</Text>
      <Box className="flex-row justify-between mb-2">
        <Text className="text-md text-gray-500 mb-1">
          연간 총 주유 금액:{' '}
          {formatNumber(yearlyStats.reduce((acc, s) => acc + s.totalCost, 0))}원
        </Text>
        <Text className="text-md text-gray-500 mb-1">
          연간 총 주유량:{' '}
          {formatNumber(yearlyStats.reduce((acc, s) => acc + s.totalAmount, 0))}
          L
        </Text>
      </Box>
      <LineChart
        data={{
          labels: yearlyStats.map((s) => `${s.month}월`),
          datasets: [
            {
              data: yearlyStats.map((s) => s.totalCost),
            },
          ],
        }}
        width={chartWidth}
        height={200}
        yAxisSuffix="원"
        fromZero
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 12 }}
      />
    </Box>
  );
};

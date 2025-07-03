import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { formatNumber } from '@shared/utils/format';

interface Stat {
  label: string;
  value: number;
  diff?: number; // 증감률(%)
}

interface Props {
  current: number;
  prevMonth: number;
  prevYear: number;
}

function getDiffIcon(diff: number) {
  if (diff > 0) return <Text className="text-red-500">▲</Text>;
  if (diff < 0) return <Text className="text-blue-500">▼</Text>;
  return null;
}

export const ComparisonStatsCard = ({
  current,
  prevMonth,
  prevYear,
}: Props) => {
  // 증감률 계산
  const calcDiff = (base: number, compare: number) => {
    if (base === 0) return 0;
    return Math.round(((compare - base) / base) * 100);
  };
  const diffMonth = calcDiff(prevMonth, current);
  const diffYear = calcDiff(prevYear, current);

  const stats: Stat[] = [
    { label: '이번달', value: current },
    { label: '전월', value: prevMonth, diff: diffMonth },
    { label: '전년동월', value: prevYear, diff: diffYear },
  ];

  return (
    <Box className="flex-row justify-between mb-4">
      {stats.map((stat) => (
        <Box
          key={stat.label}
          className="flex-1 mx-1 bg-gray-50 rounded-lg p-3 items-center"
        >
          <Text className="text-xs text-gray-500 mb-1">{stat.label}</Text>
          <Text className="font-bold text-base mb-1">
            {formatNumber(stat.value)}원
          </Text>
          {stat.diff !== undefined && (
            <Box className="flex-row items-center">
              {getDiffIcon(stat.diff)}
              <Text
                className={
                  stat.diff > 0
                    ? 'text-red-500'
                    : stat.diff < 0
                      ? 'text-blue-500'
                      : 'text-gray-400'
                }
              >
                {stat.diff > 0 ? '+' : ''}
                {stat.diff}%
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

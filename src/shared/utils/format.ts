import { format } from 'date-fns';

export function formatNumber(value?: number) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString();
}

// 날짜 표시 함수
export const formatDateForDisplay = (date: Date) => {
  if (!date) return '';
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '어제';
  } else {
    return format(date, 'yyyy-MM-dd');
  }
};

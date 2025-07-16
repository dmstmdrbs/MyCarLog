import { format, getDate, getMonth, getYear } from 'date-fns';
import { useMemo, useState } from 'react';

export const useCurrentDate = (initialDate: Date | string = new Date()) => {
  const [currentDate, _setCurrentDate] = useState(
    new Date(format(initialDate, 'yyyy-MM-dd')),
  );
  const dateString = useMemo(
    () => format(currentDate, 'yyyy-MM-dd'),
    [currentDate, initialDate],
  );
  const year = useMemo(() => getYear(currentDate), [currentDate, initialDate]);
  const month = useMemo(
    () => getMonth(currentDate) + 1,
    [currentDate, initialDate],
  );
  const day = useMemo(() => getDate(currentDate), [currentDate, initialDate]);
  const timestamp = useMemo(
    () => currentDate.getTime(),
    [currentDate, initialDate],
  );

  const setCurrentDate = (date: Date) => {
    _setCurrentDate(new Date(format(date, 'yyyy-MM-dd')));
  };

  return {
    currentDate,
    setCurrentDate,
    year,
    month,
    day,
    timestamp,
    dateString,
  };
};

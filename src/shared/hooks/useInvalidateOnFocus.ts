import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useInvalidateOnFocus = (refetch: () => Promise<any>) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      refetch().catch((error) => {
        console.error('Error refetching on focus:', error);
      });
    }
  }, [isFocused]);
};

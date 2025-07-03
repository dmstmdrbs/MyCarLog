import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';

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

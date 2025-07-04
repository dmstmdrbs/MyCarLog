import {
  seedDefaultMaintenanceItems,
  seedDefaultPaymentMethods,
} from '@/database/seedData';
import { Box } from '@/shared/components/ui/box';
import { Spinner } from '@/shared/components/ui/spinner';
import { Text } from '@/shared/components/ui/text';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

const AppStatusContext = createContext<{
  isAppLoading: boolean;
  isAppError: boolean;
  setIsAppLoading: (isAppLoading: boolean) => void;
  setIsAppError: (isAppError: boolean) => void;
}>({
  isAppLoading: false,
  isAppError: false,
  setIsAppLoading: () => {},
  setIsAppError: () => {},
});

export const AppStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [isAppError, setIsAppError] = useState(false);

  useLayoutEffect(() => {
    const initializeData = async () => {
      setIsAppLoading(true);
      // 데이터베이스 초기화 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await Promise.all([
          seedDefaultMaintenanceItems(),
          seedDefaultPaymentMethods(),
        ]);
        console.log('Maintenance seed data initialized');
        setIsAppLoading(false);
      } catch (error) {
        console.error('Failed to initialize maintenance seed data:', error);
        setIsAppError(true);
      } finally {
        setIsAppLoading(false);
      }
    };

    initializeData();
  }, []);

  return (
    <AppStatusContext.Provider
      value={{ isAppLoading, isAppError, setIsAppLoading, setIsAppError }}
    >
      {children}
      {isAppLoading && (
        <Box className="absolute z-10 top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white">
          <Spinner size="large" />
        </Box>
      )}

      {isAppError && (
        <Box className="absolute z-10 top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-white">
          <Text>
            Oops! 앱 실행 중 오류가 발생했습니다. 관리자에게 문의해주세요.
          </Text>
        </Box>
      )}
    </AppStatusContext.Provider>
  );
};

export const useAppStatus = () => {
  const context = useContext(AppStatusContext);
  if (!context) {
    throw new Error('useAppStatus must be used within an AppStatusProvider');
  }
  return context;
};

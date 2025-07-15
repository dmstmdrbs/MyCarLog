import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// QueryClient 인스턴스 생성
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 설정
        staleTime: 0,
        gcTime: 0,
        retry: (failureCount, error) => {
          // 네트워크 에러가 아닌 경우 재시도하지 않음
          if (error instanceof Error && error.message.includes('not found')) {
            return false;
          }
          return failureCount < 3;
        },
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
        refetchOnMount: true, // 컴포넌트 마운트 시 refetch
        refetchOnReconnect: true, // 네트워크 재연결 시 refetch
      },
      mutations: {
        // Mutation 기본 설정
        retry: (failureCount, error) => {
          // 클라이언트 에러는 재시도하지 않음
          if (error instanceof Error && error.message.includes('이미 존재')) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });
};

// 싱글톤 QueryClient 인스턴스
let queryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

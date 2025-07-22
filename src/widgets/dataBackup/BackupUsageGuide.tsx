import React from 'react';
import { VStack } from '@/shared/components/ui/vstack';
import { Text } from '@/shared/components/ui/text';

interface BackupUsageGuideProps {
  title?: string;
  className?: string;
}

export const BackupUsageGuide = ({
  title = '사용법 안내',
  className = '',
}: BackupUsageGuideProps) => {
  return (
    <VStack space="md" className={className}>
      <Text className="text-lg font-semibold text-gray-700">{title}</Text>
      <VStack space="sm">
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">전체 백업</Text>: 모든 차량과
          데이터를 JSON 파일로 내보냅니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">차량별 백업</Text>: 특정 차량의
          데이터만 별도로 백업합니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">전체 복원</Text>: 백업 파일의 모든
          데이터와 기존 데이터를 병합합니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">차량별 복원</Text>: 백업 파일의 차량
          데이터를 기존 차량에 병합하거나 새 차량으로 복원합니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">병합 전략</Text>:
        </Text>
        <VStack space="xs" className="ml-4">
          <Text className="text-sm text-gray-600">
            - <Text className="font-semibold">스마트 병합</Text>: 최신 데이터를
            우선하여 병합
          </Text>
          <Text className="text-sm text-gray-600">
            - <Text className="font-semibold">백업 데이터 우선</Text>: 백업
            파일의 데이터로 덮어쓰기
          </Text>
          <Text className="text-sm text-gray-600">
            - <Text className="font-semibold">기존 데이터 우선</Text>: 기존
            데이터 유지, 새로운 데이터만 추가
          </Text>
          <Text className="text-sm text-gray-600">
            - <Text className="font-semibold">모든 데이터 교체</Text>: 기존
            데이터 삭제 후 백업 데이터로 교체
          </Text>
        </VStack>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">안전성</Text>: 스마트 병합을
          사용하면 기존 데이터가 안전하게 보호됩니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">차량별 관리</Text>: 차량별 백업을
          통해 특정 차량의 데이터만 선택적으로 관리할 수 있습니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">파일 관리</Text>: 백업 파일은 기기의
          파일 앱에서 관리할 수 있습니다
        </Text>
        <Text className="text-sm text-gray-600">
          • <Text className="font-semibold">정기 백업</Text>: 중요한 데이터는
          정기적으로 백업하는 것을 권장합니다
        </Text>
      </VStack>
    </VStack>
  );
};

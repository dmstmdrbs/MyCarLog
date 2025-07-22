import React from 'react';
import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { VStack } from '@/shared/components/ui/vstack';
import { Text } from '@/shared/components/ui/text';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from '@/shared/components/ui/select';
import { Spinner } from '@/shared/components/ui/spinner';

import { useVehicleBackup } from '@/features/dataBackup/hooks/useVehicleBackup';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/queries/queryKeys';

interface VehicleRestoreSectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  showResults?: boolean;
  className?: string;
  onRestore?: () => void;
}

export const VehicleRestoreSection = ({
  title = '차량별 복원',
  description = '차량별 백업 파일을 선택하여 새 차량으로 데이터를 복원할 수 있습니다.',
  buttonText = '차량 백업 파일에서 복원',
  showResults = false,
  className = '',
  onRestore,
}: VehicleRestoreSectionProps) => {
  const queryClient = useQueryClient();
  const { isRestoring, lastRestoreResult, confirmAndRestoreBackup } =
    useVehicleBackup();

  const handleRestore = async () => {
    await confirmAndRestoreBackup();
    queryClient.invalidateQueries({
      queryKey: queryKeys.vehicles.vehicles(),
    });
    onRestore?.();
  };

  return (
    <Box
      className={`border border-gray-200 bg-blue-50 p-4 rounded-lg mb-4 ${className}`}
    >
      <VStack space="md">
        <VStack space="sm">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-600">{description}</Text>
        </VStack>

        <VStack space="sm">
          <Text className="text-sm font-medium text-gray-700">병합 전략</Text>
          <Select selectedValue="smart">
            <SelectTrigger>
              <SelectInput placeholder="병합 전략을 선택하세요" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent className="pb-">
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem
                  label="스마트 병합 (최신 데이터 우선)"
                  value="smart"
                />
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>

        <Button
          onPress={handleRestore}
          disabled={isRestoring}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isRestoring ? (
            <Box className="flex-row items-center">
              <Spinner size="small" color="white" />
              <ButtonText className="ml-2">복원 중...</ButtonText>
            </Box>
          ) : (
            <ButtonText>{buttonText}</ButtonText>
          )}
        </Button>

        {showResults && lastRestoreResult && (
          <Box className="mt-4 p-3 rounded-lg bg-gray-50">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              {lastRestoreResult.success ? '복원 결과' : '오류'}
            </Text>
            {lastRestoreResult.success ? (
              <VStack space="xs">
                <Text className="text-xs text-gray-600">
                  대상 차량: {lastRestoreResult.targetVehicleName}
                </Text>
                <Text className="text-xs text-gray-600">
                  차량 처리: 새 차량 생성
                </Text>
                <Text className="text-xs text-gray-600">
                  정비항목:{' '}
                  {lastRestoreResult.mergeResult?.maintenanceItems.added || 0}개
                  추가,{' '}
                  {lastRestoreResult.mergeResult?.maintenanceItems.updated || 0}
                  개 업데이트
                </Text>
                <Text className="text-xs text-gray-600">
                  연료기록:{' '}
                  {lastRestoreResult.mergeResult?.fuelRecords.added || 0}개
                  추가,{' '}
                  {lastRestoreResult.mergeResult?.fuelRecords.updated || 0}개
                  업데이트
                </Text>
                <Text className="text-xs text-gray-600">
                  정비기록:{' '}
                  {lastRestoreResult.mergeResult?.maintenanceRecords.added || 0}
                  개 추가,{' '}
                  {lastRestoreResult.mergeResult?.maintenanceRecords.updated ||
                    0}
                  개 업데이트
                </Text>
                <Text className="text-xs text-gray-600">
                  정비계획:{' '}
                  {lastRestoreResult.mergeResult?.maintenancePlans.added || 0}개
                  추가,{' '}
                  {lastRestoreResult.mergeResult?.maintenancePlans.updated || 0}
                  개 업데이트
                </Text>
              </VStack>
            ) : (
              <Text className="text-xs text-red-600">
                {lastRestoreResult.error}
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

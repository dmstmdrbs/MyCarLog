import React, { useState } from 'react';
import { Box } from '@/shared/components/ui/box';
import { Button } from '@/shared/components/ui/button';
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
import { useVehicles } from '@/features/vehicle/hooks/useVehicleQueries';
import { useVehicleBackup } from '@/features/dataBackup/hooks/useVehicleBackup';

interface VehicleBackupSectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  showResults?: boolean;
  className?: string;
}

export const VehicleBackupSection = ({
  title = '차량별 백업',
  description = '특정 차량의 데이터만 백업할 수 있습니다.',
  buttonText = '차량별 백업',
  showResults = true,
  className = 'bg-green-50 p-4 rounded-lg',
}: VehicleBackupSectionProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const { data: vehicles = [] } = useVehicles();
  const { isBackingUp, lastBackupResult, confirmAndCreateBackup } =
    useVehicleBackup();

  const handleBackup = () => {
    if (!selectedVehicleId) {
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (selectedVehicle) {
      confirmAndCreateBackup(selectedVehicleId, selectedVehicle.nickname);
    }
  };

  return (
    <VStack space="md">
      <Box className={className}>
        <Text className="text-green-800 font-semibold mb-2">{title}</Text>
        <Text className="text-green-700 text-sm mb-3">{description}</Text>

        <VStack space="sm" className="mb-3">
          <Text className="text-green-700 text-sm font-medium">차량 선택</Text>
          <Select
            selectedValue={selectedVehicleId}
            onValueChange={(value) => setSelectedVehicleId(value)}
          >
            <SelectTrigger>
              <SelectInput placeholder="백업할 차량을 선택하세요" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {vehicles.map((vehicle) => (
                  <SelectItem
                    key={vehicle.id}
                    label={vehicle.nickname}
                    value={vehicle.id}
                  />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </VStack>

        <Button
          onPress={handleBackup}
          disabled={isBackingUp || !selectedVehicleId}
          className="bg-green-500"
        >
          {isBackingUp ? (
            <VStack className="flex-row items-center space-x-2">
              <Spinner size="small" color="white" />
              <Text className="text-white">백업 중...</Text>
            </VStack>
          ) : (
            <Text className="text-white">{buttonText}</Text>
          )}
        </Button>
      </Box>

      {/* 백업 결과 표시 */}
      {showResults && lastBackupResult?.success && (
        <Box className="bg-green-50 p-4 rounded-lg">
          <Text className="text-green-800 font-semibold mb-2">백업 완료</Text>
          <Text className="text-green-700 text-sm">
            차량별 백업이 성공적으로 완료되었습니다.
          </Text>
        </Box>
      )}

      {/* 백업 에러 메시지 */}
      {showResults && lastBackupResult?.error && (
        <Box className="bg-red-50 p-4 rounded-lg">
          <Text className="text-red-800 font-semibold mb-2">오류 발생</Text>
          <Text className="text-red-700 text-sm mb-2">
            {lastBackupResult.error}
          </Text>
          <Button onPress={() => {}} className="bg-red-600">
            <Text className="text-white text-sm">확인</Text>
          </Button>
        </Box>
      )}
    </VStack>
  );
};

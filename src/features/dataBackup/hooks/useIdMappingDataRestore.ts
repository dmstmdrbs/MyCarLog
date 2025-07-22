import { useState } from 'react';
import { Alert } from 'react-native';
import { IdMappingRestoreService } from '../services/IdMappingRestoreService';
import { RestoreResult, MergeStrategy } from '../types/backup.types';

export const useIdMappingDataRestore = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastRestoreResult, setLastRestoreResult] =
    useState<RestoreResult | null>(null);

  const restoreData = async (strategy: MergeStrategy = 'smart') => {
    try {
      setIsRestoring(true);
      setLastRestoreResult(null);

      // 백업 파일 선택
      const fileUri = await IdMappingRestoreService.selectBackupFile();

      // 백업 파일 검증
      const backupData =
        await IdMappingRestoreService.validateBackupFile(fileUri);

      // 복원 실행
      const result = await IdMappingRestoreService.restoreFromBackup(
        backupData,
        { strategy },
      );

      setLastRestoreResult(result);

      if (result.success) {
        Alert.alert(
          '복원 완료',
          `데이터 복원이 완료되었습니다.\n\n` +
            `차량: ${result.mergeResult?.vehicles.added || 0}개 추가, ${result.mergeResult?.vehicles.updated || 0}개 업데이트\n` +
            `연료기록: ${result.mergeResult?.fuelRecords.added || 0}개 추가, ${result.mergeResult?.fuelRecords.updated || 0}개 업데이트\n` +
            `정비기록: ${result.mergeResult?.maintenanceRecords.added || 0}개 추가, ${result.mergeResult?.maintenanceRecords.updated || 0}개 업데이트\n` +
            `정비항목: ${result.mergeResult?.maintenanceItems.added || 0}개 추가, ${result.mergeResult?.maintenanceItems.updated || 0}개 업데이트\n` +
            `정비계획: ${result.mergeResult?.maintenancePlans.added || 0}개 추가, ${result.mergeResult?.maintenancePlans.updated || 0}개 업데이트\n` +
            `결제수단: ${result.mergeResult?.paymentMethods.added || 0}개 추가, ${result.mergeResult?.paymentMethods.updated || 0}개 업데이트\n` +
            `주유소: ${result.mergeResult?.stations.added || 0}개 추가, ${result.mergeResult?.stations.updated || 0}개 업데이트\n` +
            `정비소: ${result.mergeResult?.shops.added || 0}개 추가, ${result.mergeResult?.shops.updated || 0}개 업데이트`,
        );
      } else {
        Alert.alert(
          '복원 실패',
          result.error || '알 수 없는 오류가 발생했습니다.',
        );
      }
    } catch (error) {
      console.error('복원 중 오류:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('복원 실패', errorMessage);

      setLastRestoreResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const confirmAndRestore = (strategy: MergeStrategy = 'smart') => {
    const strategyText = {
      smart: '스마트 병합 (최신 데이터 우선)',
      backup_first: '백업 데이터 우선',
      existing_first: '기존 데이터 우선',
      replace_all: '모든 데이터 교체 (기존 데이터 삭제)',
    }[strategy];

    Alert.alert(
      '데이터 복원 확인',
      `백업 파일을 선택하여 데이터를 복원하시겠습니까?\n\n` +
        `병합 전략: ${strategyText}\n\n` +
        `${strategy === 'replace_all' ? '⚠️ 경고: 기존 데이터가 모두 삭제됩니다!' : '기존 데이터와 병합됩니다.'}`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '복원',
          style: 'destructive',
          onPress: () => restoreData(strategy),
        },
      ],
    );
  };

  return {
    isRestoring,
    lastRestoreResult,
    restoreData,
    confirmAndRestore,
  };
};

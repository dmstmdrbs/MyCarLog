import { useState } from 'react';
import { RestoreService } from '../services/RestoreService';
import { RestoreResult, MergeStrategy } from '../types/backup.types';

export const useDataRestore = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRestoreResult, setLastRestoreResult] =
    useState<RestoreResult | null>(null);

  const restoreFromBackup = async (strategy: MergeStrategy = 'smart') => {
    setIsRestoring(true);
    setError(null);

    try {
      // 백업 파일 선택
      const fileUri = await RestoreService.selectBackupFile();

      // 백업 파일 검증
      const backupData = await RestoreService.validateBackupFile(fileUri);

      // 데이터 병합
      const result = await RestoreService.mergeFromBackup(backupData, {
        strategy,
      });

      setLastRestoreResult(result);

      if (!result.success) {
        setError(result.error || '데이터 복원에 실패했습니다.');
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsRestoring(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearResult = () => {
    setLastRestoreResult(null);
  };

  return {
    restoreFromBackup,
    isRestoring,
    error,
    lastRestoreResult,
    clearError,
    clearResult,
  };
};

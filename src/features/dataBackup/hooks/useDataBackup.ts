import { useState } from 'react';
import { BackupService } from '../services/BackupService';
import { BackupResult } from '../types/backup.types';

export const useDataBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBackupResult, setLastBackupResult] = useState<BackupResult | null>(
    null,
  );

  const createBackup = async (): Promise<BackupResult> => {
    setIsBackingUp(true);
    setError(null);

    try {
      const result = await BackupService.createBackup();
      setLastBackupResult(result);

      if (!result.success) {
        setError(result.error || '백업 생성에 실패했습니다.');
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsBackingUp(false);
    }
  };

  const shareBackup = async (fileUri: string): Promise<void> => {
    try {
      await BackupService.shareBackup(fileUri);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '백업 공유에 실패했습니다.';
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createBackup,
    shareBackup,
    isBackingUp,
    error,
    lastBackupResult,
    clearError,
  };
};

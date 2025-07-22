import { useState } from 'react';
import { Alert } from 'react-native';
import { VehicleBackupService } from '../services/VehicleBackupService';
import { VehicleRestoreResult } from '../types/backup.types';

export const useVehicleBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupResult, setLastBackupResult] = useState<{
    success: boolean;
    fileUri?: string;
    error?: string;
  } | null>(null);
  const [lastRestoreResult, setLastRestoreResult] =
    useState<VehicleRestoreResult | null>(null);

  // 차량별 백업 생성
  const createBackup = async (vehicleId: string) => {
    try {
      setIsBackingUp(true);
      setLastBackupResult(null);

      const result = await VehicleBackupService.createVehicleBackup(vehicleId);
      setLastBackupResult(result);

      if (result.success && result.fileUri) {
        // 백업 파일 공유
        const shareResult = await VehicleBackupService.shareVehicleBackup(
          result.fileUri,
        );
        if (shareResult.success) {
          Alert.alert(
            '백업 완료',
            '차량별 백업이 완료되었습니다. 파일이 공유되었습니다.',
          );
        } else {
          Alert.alert(
            '백업 완료',
            '차량별 백업이 완료되었습니다. 파일 공유에 실패했습니다.',
          );
        }
      } else {
        Alert.alert(
          '백업 실패',
          result.error || '백업 중 오류가 발생했습니다.',
        );
      }
    } catch (error) {
      console.error('백업 중 오류:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('백업 실패', errorMessage);

      setLastBackupResult({
        success: false,
        error: errorMessage,
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // 차량별 백업 복원 (새 차량으로만 복원)
  const restoreBackup = async () => {
    try {
      setIsRestoring(true);
      setLastRestoreResult(null);

      // 백업 파일 선택
      const fileUri = await VehicleBackupService.selectVehicleBackupFile();

      // 백업 파일 검증
      const backupData =
        await VehicleBackupService.validateVehicleBackupFile(fileUri);
      console.log('backupData', backupData);

      // 복원 실행
      const result =
        await VehicleBackupService.restoreVehicleBackup(backupData);
      setLastRestoreResult(result);

      if (result.success) {
        Alert.alert(
          '복원 완료',
          `차량별 데이터 복원이 완료되었습니다.\n\n` +
            `새 차량: ${result.newVehicleName}\n` +
            `정비항목: ${result.stats?.maintenanceItemsAdded || 0}개 추가\n` +
            `연료기록: ${result.stats?.fuelRecordsAdded || 0}개 추가\n` +
            `정비기록: ${result.stats?.maintenanceRecordsAdded || 0}개 추가\n` +
            `정비계획: ${result.stats?.maintenancePlansAdded || 0}개 추가`,
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

  // 백업 확인 및 실행
  const confirmAndCreateBackup = (vehicleId: string, vehicleName: string) => {
    Alert.alert(
      '차량별 백업',
      `"${vehicleName}" 차량의 데이터를 백업하시겠습니까?\n\n` +
        `백업 내용:\n` +
        `• 연료 기록\n` +
        `• 정비 기록\n` +
        `• 정비 계획\n\n` +
        `백업 파일은 기기의 파일 앱에서 관리할 수 있습니다.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '백업', onPress: () => createBackup(vehicleId) },
      ],
    );
  };

  // 복원 확인 및 실행
  const confirmAndRestoreBackup = () => {
    return new Promise((resolve, reject) => {
      const strategyText = {
        smart: '스마트 병합 (최신 데이터 우선)',
        backup_first: '백업 데이터 우선',
        existing_first: '기존 데이터 우선',
        replace_all: '모든 데이터 교체 (기존 데이터 삭제)',
      }['smart'];

      Alert.alert(
        '차량별 복원',
        `백업 파일을 선택하여 새 차량으로 데이터를 복원하시겠습니까?\n\n` +
          `복원 방식: 새 차량 생성\n` +
          `병합 전략: ${strategyText}\n\n` +
          `${strategyText === 'replace_all' ? '⚠️ 경고: 기존 데이터가 모두 삭제됩니다!' : '기존 데이터와 병합됩니다.'}`,
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              resolve(false);
            },
          },
          {
            text: '복원',
            style: 'destructive',
            onPress: async () => {
              try {
                await restoreBackup();
                resolve(true);
              } catch (error) {
                reject(error);
              }
            },
          },
        ],
      );
    });
  };

  return {
    isBackingUp,
    isRestoring,
    lastBackupResult,
    lastRestoreResult,
    createBackup,
    restoreBackup,
    confirmAndCreateBackup,
    confirmAndRestoreBackup,
  };
};

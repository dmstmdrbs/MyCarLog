import React from 'react';
import { ScrollView } from 'react-native';
import { Heading } from '@/shared/components/ui/heading';
import { VStack } from '@/shared/components/ui/vstack';
import { Divider } from '@/shared/components/ui/divider';
import PageLayout from '@shared/components/layout/PageLayout';
import {
  BackupUsageGuide,
  VehicleBackupSection,
  VehicleRestoreSection,
} from '@/widgets/dataBackup';

export const SettingsDataBackupPage = () => {
  return (
    <PageLayout>
      <ScrollView className="flex-1">
        <VStack className="flex-1 p-4 bg-white" space="lg">
          <Heading>데이터 백업 및 복원</Heading>

          <Divider />

          {/* 차량별 백업 섹션 */}
          <VehicleBackupSection />

          <Divider />

          {/* 차량별 복원 섹션 */}
          <VStack space="md">
            <VehicleRestoreSection
              title="차량별 데이터 복원"
              description="차량별 백업 파일을 선택하여 특정 차량의 데이터를 복원할 수 있습니다."
              buttonText="차량 백업 파일에서 복원"
              showResults={true}
            />
          </VStack>

          {/* 사용법 안내 */}
          <BackupUsageGuide />
        </VStack>
      </ScrollView>
    </PageLayout>
  );
};

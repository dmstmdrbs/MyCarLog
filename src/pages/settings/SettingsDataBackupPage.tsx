import { Heading } from '@/shared/components/ui/heading';
import { VStack } from '@/shared/components/ui/vstack';
import PageLayout from '@shared/components/layout/PageLayout';
import { Text } from '@shared/components/ui/text';

export const SettingsDataBackupPage = () => {
  return (
    <PageLayout>
      <VStack className="flex-1 items-center justify-center">
        <Heading>기능을 열심히 준비하고 있어요</Heading>
        <Text>조금만 기다려주세요!</Text>
      </VStack>
    </PageLayout>
  );
};

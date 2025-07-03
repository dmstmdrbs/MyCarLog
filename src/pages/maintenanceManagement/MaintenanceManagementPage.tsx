import PageLayout from '@shared/components/layout/PageLayout';
import { Text } from '@shared/components/ui/text';
import { Box } from '@shared/components/ui/box';

export const MaintenanceManagementPage = () => {
  return (
    <PageLayout>
      <Box className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">준비중입니다</Text>
      </Box>
    </PageLayout>
  );
};

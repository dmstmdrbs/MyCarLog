import { useSelectedVehicle } from '@/features/vehicle';
import PageLayout from '@/shared/components/layout/PageLayout';

import { Center } from '@/shared/components/ui/center';
import { Heading } from '@/shared/components/ui/heading';
import { HStack } from '@/shared/components/ui/hstack';
import { Text } from '@/shared/components/ui/text';
import { VStack } from '@/shared/components/ui/vstack';
import { ProfileCard } from '@/widgets/vehicle/ProfileCard';
import { ScrollView } from 'react-native';
import { formatNumber } from '@/shared/utils/format';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Icon } from '@/shared/components/ui/icon';
import { Edit } from 'lucide-react-native';
import { Divider } from '@/shared/components/ui/divider';
import {
  RecentOdometer,
  RecentRecords,
  useRecentRecords,
} from '@/widgets/home';
import { cn } from '@/shared/utils/cn';

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <VStack
      className={cn(
        'p-4 bg-white rounded-lg border border-gray-100',
        className,
      )}
      space="md"
    >
      {children}
    </VStack>
  );
};

const CardHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <HStack className="justify-between">
      <Heading size="xl">{title}</Heading>
      {children}
    </HStack>
  );
};

const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <VStack space="md">{children}</VStack>;
};

export const HomePage = () => {
  const { selectedVehicle } = useSelectedVehicle();

  const { recentRecords } = useRecentRecords();

  const handlePressEditOdometer = () => {
    console.log('edit odometer');
  };

  return (
    <PageLayout>
      <ScrollView className="flex-1">
        <VStack space="md" className="p-4">
          <Card className="h-40 w-full p-0">
            <ProfileCard vehicle={selectedVehicle} />
          </Card>
          <Card>
            <CardHeader title="주행 기록">
              <Button
                variant="solid"
                size="sm"
                action="default"
                onPress={handlePressEditOdometer}
              >
                <ButtonText>
                  <Icon as={Edit} size="md" color="#4a4a4a" />
                </ButtonText>
              </Button>
            </CardHeader>
            <Divider orientation="horizontal" />
            {selectedVehicle?.odometer === 0 ? (
              <Center>
                <Text className="text-gray-400">주행 기록이 없습니다.</Text>
              </Center>
            ) : (
              <RecentOdometer odometer={selectedVehicle?.odometer ?? 0} />
            )}
          </Card>
          <Card>
            <CardHeader title="최근 관리 내역" />
            <Divider orientation="horizontal" />
            <CardContent>
              {recentRecords.length === 0 && (
                <Center>
                  <Text className="text-gray-400">
                    최근 7일간 관리 내역이 없습니다.
                  </Text>
                </Center>
              )}

              <RecentRecords records={recentRecords} />
            </CardContent>
          </Card>
        </VStack>
      </ScrollView>
    </PageLayout>
  );
};

import { HStack } from '@/shared/components/ui/hstack';
import { Divider } from '@/shared/components/ui/divider';
import { formatNumber } from '@/shared/utils/format';
import { Box } from '@/shared/components/ui/box';
import { VStack } from '@/shared/components/ui/vstack';
import { Text } from '@/shared/components/ui/text';
import { Icon } from '@/shared/components/ui/icon';
import { CarIcon, GaugeCircle } from 'lucide-react-native';

import { VehicleSelectModal } from './ui/VehicleSelectModal';
import { useModal } from '@/shared/hooks/useModal';
import { Button, ButtonText } from '@/shared/components/ui/button';
import type { VehicleType } from '@shared/models/Vehicle';

export const ProfileCard = ({ vehicle }: { vehicle: VehicleType | null }) => {
  const { isOpen, open, close } = useModal();

  return (
    <Box className="w-full h-full bg-white rounded-lg p-4 border border-gray-100">
      <VStack space="sm">
        <HStack className="justify-between" space="sm">
          <HStack className="items-center" space="sm">
            <Icon as={CarIcon} size="xl" color="#4a4a4a" />
            <Text className="text-2xl font-bold">{vehicle?.nickname}</Text>
          </HStack>
          <HStack className="items-center" space="sm">
            <Text size="lg">{vehicle?.manufacturer}</Text>
            <Divider orientation="vertical" className="h-4 w-0.5 bg-gray-500" />
            <Text size="lg">{vehicle?.model}</Text>
          </HStack>
        </HStack>
        <HStack className="items-center" space="sm">
          <HStack className="items-center" space="sm">
            <Icon as={GaugeCircle} size="lg" color="#4a4a4a" />
            <Text size="lg">{formatNumber(vehicle?.odometer ?? 0)} km</Text>
          </HStack>
          <Divider orientation="vertical" className="h-4 w-0.5 bg-gray-500" />
          <HStack className="items-center" space="sm">
            <Icon as={CarIcon} size="lg" color="#4a4a4a" />
            <Text size="lg">
              {vehicle?.type === 'EV' ? '전기차' : '내연기관'}
            </Text>
          </HStack>
        </HStack>
        <HStack space="sm" className="w-full">
          <Button onPress={open} className="rounded-lg flex-1" variant="solid">
            <ButtonText>프로필 변경</ButtonText>
          </Button>
        </HStack>
      </VStack>
      <VehicleSelectModal isOpen={isOpen} onClose={close} />
    </Box>
  );
};

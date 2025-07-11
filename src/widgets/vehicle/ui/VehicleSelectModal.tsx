import { useVehicleProfileSelector } from '@/features/vehicle';
import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Heading } from '@/shared/components/ui/heading';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@/shared/components/ui/modal';
import { Text } from '@/shared/components/ui/text';
import { VStack } from '@/shared/components/ui/vstack';
import { ScrollView } from 'react-native';

export const VehicleSelectModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { vehicles, selectVehicle } = useVehicleProfileSelector();

  const handleSelectVehicle = (vehicleId: string) => {
    selectVehicle(vehicleId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <VStack space="md">
            <Heading size="md" className="text-typography-950">
              차량 프로필 선택
            </Heading>
            <Text size="sm" className="text-typography-500">
              관리 할 차량을 선택해주세요.
            </Text>
          </VStack>
        </ModalHeader>
        <ModalBody className="h-80" contentContainerClassName="flex-1">
          <ScrollView className="flex-1">
            {vehicles.map((item, idx) => (
              <Box
                className="border-b-2 border-typography-200"
                key={item.id + item.nickname + idx}
              >
                <Button
                  onPress={() => handleSelectVehicle(item.id)}
                  className="w-full bg-white"
                  variant="solid"
                  action="secondary"
                >
                  <ButtonText>{item.nickname}</ButtonText>
                </Button>
              </Box>
            ))}
          </ScrollView>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

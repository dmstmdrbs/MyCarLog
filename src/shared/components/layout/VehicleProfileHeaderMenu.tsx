import { useVehicles } from '@/features/vehicle/hooks/useVehicleQueries';
import { ChevronDownIcon } from '../ui/icon';
import { cn } from '@shared/utils/cn';
import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import { Text } from '../ui/text';
import { useMemo } from 'react';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '../ui/modal';
import { Heading } from '../ui/heading';
import { ScrollView } from 'react-native';
import { useModal } from '@/shared/hooks/useModal';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import { Box } from '../ui/box';

const SelectProfileModal = ({
  isOpen,
  onClose,
  onClickProfile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onClickProfile: (vehicleId: string) => void;
}) => {
  const { data: vehicles = [] } = useVehicles();

  console.log(vehicles);
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
                  onPress={() => onClickProfile(item.id)}
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
const VehicleProfileHeaderMenu = () => {
  const { data: vehicles = [] } = useVehicles();
  const { selectedVehicle, setSelectedVehicle } = useSelectedVehicle();

  const { isOpen, open, close } = useModal();

  const vehicleSet = useMemo(() => {
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const handleChangeSelectedProfile = async (vehicleId: string) => {
    const vehicle = vehicleSet.get(vehicleId);

    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
    close();
  };

  return (
    <HStack>
      <Button
        className="px-4 flex flex-row items-center gap-2 data-[active=true]:bg-background-50"
        action="default"
        onPress={open}
      >
        <ButtonText
          className={cn(
            'text-black font-medium text-lg data-[active=true]:text-black',
          )}
        >
          {selectedVehicle?.nickname || '프로필 선택'}
        </ButtonText>
        <ButtonIcon as={ChevronDownIcon} color="black" />
      </Button>
      <SelectProfileModal
        isOpen={isOpen}
        onClose={close}
        onClickProfile={handleChangeSelectedProfile}
      />
    </HStack>
  );
};

export default VehicleProfileHeaderMenu;

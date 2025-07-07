import { useVehicles } from '@/features/vehicle/hooks/useVehicleQueries';
import { ChevronDownIcon } from '../ui/icon';
import { cn } from '@shared/utils/cn';
import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import { Text } from '../ui/text';
import { useCallback, useState } from 'react';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '../ui/modal';
import { Box } from '../ui/box';
import { Heading } from '../ui/heading';
import { ScrollView } from 'react-native';

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

  const handleClickProfile = useCallback(
    (vehicleId: string) => {
      onClickProfile(vehicleId);
      onClose();
    },
    [onClickProfile, onClose],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[305px] items-center">
        <ModalBody className="mt-0 mb-4 px-0 w-full">
          <Heading size="md" className="text-typography-950 mb-2 text-center">
            차량 프로필 선택
          </Heading>
          <Text size="sm" className="text-typography-500 text-center">
            차계부를 관리 할 차량을 선택해주세요.
          </Text>
          <Box className="flex flex-col gap-2 mt-4 h-56 px-0 w-full">
            <ScrollView className="px-0 w-full">
              {vehicles.map((item) => (
                <Button
                  onPress={() => handleClickProfile(item.id)}
                  className="w-full bg-white border-b-2"
                  variant="solid"
                  action="secondary"
                >
                  <ButtonText>{item.nickname}</ButtonText>
                </Button>
              ))}
            </ScrollView>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
const VehicleProfileHeaderMenu = () => {
  const { data: vehicles = [] } = useVehicles();
  const { selectedVehicle, setSelectedVehicle } = useSelectedVehicle();

  const [selectProfileModalOpen, setSelectProfileModalOpen] = useState(false);

  const openSelectProfileModal = useCallback(() => {
    setSelectProfileModalOpen(true);
  }, []);

  const closeSelectProfileModal = useCallback(() => {
    setSelectProfileModalOpen(false);
  }, []);

  const handleChangeSelectedProfile = async (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    console.log('vehicle', vehicle);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
  };

  return (
    <>
      <Button
        className="px-4 flex flex-row items-center gap-2 data-[active=true]:bg-background-50"
        action="default"
        onPress={openSelectProfileModal}
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
        isOpen={selectProfileModalOpen}
        onClose={closeSelectProfileModal}
        onClickProfile={handleChangeSelectedProfile}
      />
    </>
  );
};

export default VehicleProfileHeaderMenu;

import { FlatList } from 'react-native';

import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
} from '@/shared/components/ui/modal';
import { Text } from '@/shared/components/ui/text';
import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Divider } from '@/shared/components/ui/divider';
import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import Station from '@/shared/models/Station';

import { StationAddForm } from './StationAddForm';
import { useStations } from '../hooks/useStationQueries';

type StationPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (station: Station) => void;
};

export const StationPickerModal = ({
  isOpen,
  onClose,
  onSelectStation,
}: StationPickerModalProps) => {
  const { selectedVehicle } = useSelectedVehicle();
  const vehicleType = selectedVehicle?.type;
  const stationType = vehicleType === 'EV' ? 'ev' : 'gas';
  const stationTypeName = vehicleType === 'EV' ? '충전소' : '주유소';

  const { data: stations = [] } = useStations();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text className="text-lg font-semibold text-gray-900">
            {stationTypeName} 선택
          </Text>
        </ModalHeader>

        <Box className="h-80 py-2 bg-white">
          <FlatList
            data={stations}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Box className="flex flex-col gap-0.5">
                <Button
                  className="bg-white justify-start rounded-xl w-full focus:border-primary-500 focus:bg-white transition-all"
                  onPress={() => {
                    onSelectStation(item);
                    onClose();
                  }}
                >
                  <ButtonText className="text-lg font-medium text-gray-700">
                    {item.name}
                  </ButtonText>
                </Button>
                {index !== stations.length - 1 && (
                  <Divider className="my-2" orientation="horizontal" />
                )}
              </Box>
            )}
          />
        </Box>
        <StationAddForm stationType={stationType} />
      </ModalContent>
    </Modal>
  );
};

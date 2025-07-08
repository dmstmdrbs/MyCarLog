import { useMaintenanceItemQueries } from '@/features/maintenance/hooks/useMaintenanceItemQueries';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Divider } from '@/shared/components/ui/divider';
import {
  Modal,
  ModalHeader,
  ModalBackdrop,
  ModalContent,
  ModalBody,
} from '@/shared/components/ui/modal';
import { Spinner } from '@/shared/components/ui/spinner';
import { Text } from '@/shared/components/ui/text';
import MaintenanceItem from '@/shared/models/MaintenanceItem';

export const MaintenanceItemPickerModal = ({
  isOpen,
  onClose,
  onSelectMaintenanceItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaintenanceItem: (maintenanceItem: MaintenanceItem) => void;
}) => {
  const { data: maintenanceItems, isLoading: isLoadingMaintenanceItems } =
    useMaintenanceItemQueries();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="p-2 h-80">
        <ModalHeader className="p-2">
          <Text className="text-lg font-semibold text-gray-900">
            정비 항목 선택
          </Text>
        </ModalHeader>
        <Divider orientation="horizontal" />

        <ModalBody className="p-1 h-80 w-full">
          {isLoadingMaintenanceItems ? (
            <Spinner />
          ) : (
            maintenanceItems?.map((item) => (
              <Button
                className="bg-white justify-start rounded-xl w-full px-2 "
                key={item.id}
                onPress={() => {
                  onSelectMaintenanceItem(item);
                  onClose();
                }}
              >
                <ButtonText className="text-lg font-medium text-gray-700">
                  {item.name}
                </ButtonText>
              </Button>
            ))
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

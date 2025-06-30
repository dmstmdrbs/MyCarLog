import { Button, ButtonText } from '@shared/components/ui/button';
import { Heading } from '@shared/components/ui/heading';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@shared/components/ui/modal';
import { Text } from '@shared/components/ui/text';

export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText,
  cancelText,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText: string;
  cancelText: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-w-[305px] items-center">
        <ModalHeader>
          <Heading size="md" className="text-typography-950 mb-2 text-center">
            {title}
          </Heading>
        </ModalHeader>
        <ModalBody className="mt-0 mb-4">
          <Text size="sm" className="text-typography-500 text-center">
            {description}
          </Text>
        </ModalBody>
        <ModalFooter className="w-full">
          <Button
            variant="outline"
            action="secondary"
            size="sm"
            onPress={() => {
              onClose();
            }}
            className="flex-grow"
          >
            <ButtonText>{cancelText}</ButtonText>
          </Button>
          <Button
            onPress={() => {
              onClose();
              onConfirm();
            }}
            size="sm"
            className="flex-grow"
          >
            <ButtonText>{confirmText}</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

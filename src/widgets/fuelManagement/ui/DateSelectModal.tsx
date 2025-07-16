import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
} from '@/shared/components/ui/modal';
import { Calendar } from 'react-native-calendars';
import { memo } from 'react';
import { MarkedDates } from 'react-native-calendars/src/types';

interface DateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onDayPress: (day: { dateString: string }) => void;
  markedDates: MarkedDates;
}
export const DateSelectModal = memo(
  ({
    isOpen,
    onClose,
    currentDate,
    onDayPress,
    markedDates,
  }: DateSelectModalProps) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody className="bg-white">
            <Calendar
              currentDate={currentDate}
              onDayPress={onDayPress}
              enableSwipeMonths={true}
              markedDates={markedDates}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  },
);

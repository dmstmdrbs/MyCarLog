import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
} from '@/shared/components/ui/modal';
import { Calendar } from 'react-native-calendars';
import { memo } from 'react';

interface DateSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onDayPress: (day: { dateString: string }) => void;
}
export const DateSelectModal = memo(
  ({ isOpen, onClose, currentDate, onDayPress }: DateSelectModalProps) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody className="bg-white">
            <Calendar
              currentDate={currentDate}
              onDayPress={onDayPress}
              enableSwipeMonths={true}
              markedDates={{
                [currentDate.toISOString()]: {
                  selected: true,
                  selectedColor: '#0A4D68',
                  color: '#0A4D68',
                },
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  },
);

import { FormSubmitButton } from '@/shared/components/form/FormSubmitButton';
import { Box } from './ui/box';

type FloatingSubmitButtonProps = {
  onSubmit: () => void;
  buttonIcon: string;
  buttonText: string;
};

export const FloatingSubmitButton = ({
  onSubmit,
  buttonIcon,
  buttonText,
}: FloatingSubmitButtonProps) => {
  return (
    <Box className="absolute bottom-0 left-0 right-0 border-gray-100">
      <Box className="p-4">
        <FormSubmitButton
          onSubmit={onSubmit}
          buttonIcon={buttonIcon}
          buttonText={buttonText}
        />

        {/* 안전 영역을 위한 추가 여백 */}
        <Box className="h-2" />
      </Box>
    </Box>
  );
};

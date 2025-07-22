import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Text } from '@/shared/components/ui/text';
import { ButtonProps } from 'react-native';

type FormSubmitButtonProps = {
  onSubmit: ButtonProps['onPress'];
  buttonIcon: string;
  buttonText: string;
};

export const FormSubmitButton = ({
  onSubmit,
  buttonIcon,
  buttonText,
}: FormSubmitButtonProps) => {
  return (
    <Button
      onPress={onSubmit}
      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 active:scale-95 transform transition-all duration-150 h-14"
    >
      <Box className="flex-row items-center justify-center space-x-2">
        <Text className="text-2xl">{buttonIcon}</Text>
        <ButtonText className="text-white font-bold text-lg ml-2">
          {buttonText}
        </ButtonText>
      </Box>
    </Button>
  );
};

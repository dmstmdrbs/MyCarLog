import { Button, ButtonIcon, ButtonText } from '@/shared/components/ui/button';
import { AddIcon } from '@/shared/components/ui/icon';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export const FloatingAddButton = ({ onPress }: FloatingAddButtonProps) => (
  <Button
    className="w-16 h-16 rounded-full bg-primary-500 text-white absolute bottom-10 right-4"
    onPress={onPress}
  >
    <ButtonText>
      <ButtonIcon as={AddIcon} />
    </ButtonText>
  </Button>
);

import { Button, ButtonIcon, ButtonText } from '@/shared/components/ui/button';
import { AddIcon } from '@/shared/components/ui/icon';
import { memo } from 'react';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export const FloatingAddButton = memo(({ onPress }: FloatingAddButtonProps) => (
  <Button
    className="w-16 h-16 rounded-full bg-primary-500 text-white absolute bottom-9 right-6"
    onPress={onPress}
  >
    <ButtonText>
      <ButtonIcon as={AddIcon} />
    </ButtonText>
  </Button>
));

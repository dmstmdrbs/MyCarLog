import { ChevronDownIcon } from '../../shared/components/ui/icon';
import { cn } from '@shared/utils/cn';
import { Button, ButtonIcon, ButtonText } from '@/shared/components/ui/button';
import { useModal } from '@/shared/hooks/useModal';
import { HStack } from '../../shared/components/ui/hstack';
import { useSelectedVehicle } from '@/features/vehicle';
import { VehicleSelectModal } from './ui/VehicleSelectModal';

export const VehicleProfileHeaderMenu = () => {
  const { selectedVehicle } = useSelectedVehicle();
  const { isOpen, open, close } = useModal();

  return (
    <HStack>
      <Button
        className="px-4 flex flex-row items-center gap-2 data-[active=true]:bg-background-50"
        action="default"
        onPress={open}
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
      <VehicleSelectModal isOpen={isOpen} onClose={close} />
    </HStack>
  );
};

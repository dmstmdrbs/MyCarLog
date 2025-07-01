import { useSelectedVehicle } from '@/features/vehicle/contexts/SelectedVehicleContext';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { ChevronDownIcon } from '../ui/icon';
import { cn } from '@shared/utils/cn';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

const VehicleProfileHeaderMenu = () => {
  const { selectedVehicle, vehicles, setSelectedVehicle } =
    useSelectedVehicle();

  return (
    <Menu
      placement="bottom right"
      closeOnSelect={true}
      className="p-1.5"
      offset={5}
      selectedKeys={
        selectedVehicle?.id ? new Set([selectedVehicle.id]) : undefined
      }
      trigger={({ ...triggerProps }) => (
        <Button {...triggerProps} size="sm" variant="link">
          <ButtonText className="text-black font-medium text-lg">
            {selectedVehicle?.nickname || '프로필 선택'}
          </ButtonText>
          <ButtonIcon as={ChevronDownIcon} />
        </Button>
      )}
    >
      {vehicles.map((vehicle, idx) => (
        <MenuItem
          key={vehicle.id}
          textValue={vehicle.nickname}
          className={cn(
            'p-2 bg-white text-black text-lg',
            idx === vehicles.length - 1 && ' border-b-0',
            idx !== vehicles.length - 1 && ' border-b border-gray-200',
            selectedVehicle?.id === vehicle.id && ' bg-gray-50 font-bold',
          )}
          onPress={() => {
            setSelectedVehicle(vehicle);
          }}
        >
          <MenuItemLabel size="sm">{vehicle.nickname}</MenuItemLabel>
        </MenuItem>
      ))}
    </Menu>
  );
};

export default VehicleProfileHeaderMenu;

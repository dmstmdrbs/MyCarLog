import { Button, ButtonText } from '@/shared/components/ui/button';
import type MaintenanceItemType from '@/shared/models/MaintenanceItem';

export const MaintenanceItem = ({
  item,
  handleEdit,
  showDeleteAlert,
}: {
  item: MaintenanceItemType;
  handleEdit: (item: MaintenanceItemType) => void;
  showDeleteAlert: (id: string) => void;
}) => (
  <Button
    className="h-12 w-full flex flex-row justify-between items-center border-b border-gray-200 rounded-none px-4 bg-white"
    style={{ borderBottomWidth: 1 }}
    onPress={() => handleEdit(item)}
    onLongPress={() => showDeleteAlert(item.id)}
  >
    <ButtonText className="text-gray-800">
      {item.name}
      {item.maintenanceKm ? ` (${item.maintenanceKm}km)` : ''}
      {item.maintenanceMonth ? ` / ${item.maintenanceMonth}개월` : ''}
    </ButtonText>
  </Button>
);

import { FlatList, ListRenderItem } from 'react-native';
import type MaintenanceItem from '@/shared/models/MaintenanceItem';

export const MaintenanceItemList = ({
  items,
  renderItem,
}: {
  items: MaintenanceItem[];
  renderItem: ListRenderItem<MaintenanceItem>;
}) => {
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerClassName="p-4 flex flex-col gap-4 bg-white"
      data={items ?? []}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
};

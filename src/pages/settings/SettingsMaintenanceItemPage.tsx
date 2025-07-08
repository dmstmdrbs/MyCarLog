import React, { useState } from 'react';
import { Alert } from 'react-native';
import type MaintenanceItemType from '@shared/models/MaintenanceItem';
import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { type CreateMaintenanceItemData } from '@shared/repositories';
import {
  useCreateMaintenanceItemMutation,
  useUpdateMaintenanceItemMutation,
  useDeleteMaintenanceItemMutation,
  useMaintenanceItemQueries,
  useMaintenanceItemDetailQueries,
} from '@/features/maintenance/hooks/useMaintenanceItemQueries';
import { Icon } from '@/shared/components/ui/icon';
import { ListIcon } from 'lucide-react-native';
import { SettingsStackParamList } from './navigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PageLayout from '@/shared/components/layout/PageLayout';
import {
  MaintenanceItem,
  MaintenanceItemList,
} from '@/widgets/maintenanceItem';
import { MaintenanceItemForm } from '@/features/maintenance';
import { VStack } from '@/shared/components/ui/vstack';

type SettingsMaintenanceItemPageProps = NativeStackScreenProps<
  SettingsStackParamList,
  'SettingsMaintenanceItem'
>;

export function SettingsMaintenanceItemPage({}: SettingsMaintenanceItemPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items } = useMaintenanceItemQueries();
  const { data: item } = useMaintenanceItemDetailQueries(editingId ?? '');

  const { mutateAsync: createMaintenanceItem } =
    useCreateMaintenanceItemMutation();
  const { mutateAsync: updateMaintenanceItem } =
    useUpdateMaintenanceItemMutation();
  const { mutateAsync: deleteMaintenanceItem } =
    useDeleteMaintenanceItemMutation();

  const handleDelete = async (id: string) => {
    await deleteMaintenanceItem(id);
  };

  const handleEdit = (item: MaintenanceItemType) => {
    setEditingId(item.id);
  };

  const handleSave = async (formData: CreateMaintenanceItemData) => {
    if (editingId) {
      await updateMaintenanceItem({ id: editingId, data: formData });
    } else {
      await createMaintenanceItem(formData);
    }
    setEditingId(null);
  };

  const showDeleteAlert = (id: string) => {
    Alert.alert('정비 항목 삭제', '정비 항목을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', onPress: () => handleDelete(id) },
    ]);
  };

  return (
    <PageLayout>
      <VStack className="w-full">
        <MaintenanceItemForm initialData={item ?? null} onSave={handleSave} />
      </VStack>
      <VStack className="p-2 bg-white flex-1">
        <Box className="p-4 border-b border-gray-200 flex flex-row items-center gap-2">
          <Icon as={ListIcon} className="w-5 h-5" />
          <Text className="text-lg font-bold">정비 항목</Text>
        </Box>
        <MaintenanceItemList
          items={items ?? []}
          renderItem={({ item }) => (
            <MaintenanceItem
              item={item}
              handleEdit={handleEdit}
              showDeleteAlert={showDeleteAlert}
            />
          )}
        />
      </VStack>
    </PageLayout>
  );
}

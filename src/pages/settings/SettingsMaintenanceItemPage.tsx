import React, { useEffect, useState } from 'react';
import { FlatList, Alert, SafeAreaView, ListRenderItem } from 'react-native';
import MaintenanceItem from '@shared/models/MaintenanceItem';
import {
  FormControl,
  FormControlLabel,
} from '@shared/components/ui/form-control';
import { Input, InputField } from '@shared/components/ui/input';
import { Button, ButtonText } from '@shared/components/ui/button';
import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import { CreateMaintenanceItemData } from '@shared/repositories';
import {
  useCreateMaintenanceItemMutation,
  useUpdateMaintenanceItemMutation,
  useDeleteMaintenanceItemMutation,
  useMaintenanceQueries,
  useMaintenanceItemQueries,
} from '@/features/maintenance/hooks/useMaintenanceQueries';
import { Icon } from '@/shared/components/ui/icon';
import { ListIcon } from 'lucide-react-native';

const MaintenanceItemForm = ({
  initialData,
  onSave,
}: {
  initialData: MaintenanceItem | null;
  onSave: (formData: CreateMaintenanceItemData) => Promise<void>;
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [maintenanceKm, setMaintenanceKm] = useState(
    initialData?.maintenanceKm?.toString() ?? '',
  );
  const [maintenanceMonth, setMaintenanceMonth] = useState(
    initialData?.maintenanceMonth?.toString() ?? '',
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setMaintenanceKm(initialData.maintenanceKm?.toString() ?? '');
      setMaintenanceMonth(initialData.maintenanceMonth?.toString() ?? '');
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!name) return Alert.alert('정비 항목명을 입력하세요');

    setName('');
    setMaintenanceKm('');
    setMaintenanceMonth('');
    onSave({
      name,
      maintenanceKm: maintenanceKm ? Number(maintenanceKm) : undefined,
      maintenanceMonth: maintenanceMonth ? Number(maintenanceMonth) : undefined,
    });
  };

  return (
    <FormControl className="flex flex-col gap-2">
      <FormControlLabel>
        <Text>정비 항목명</Text>
      </FormControlLabel>
      <Input>
        <InputField
          value={name}
          onChangeText={setName}
          placeholder="정비 항목명"
        />
      </Input>
      <FormControlLabel>
        <Text>정비 주기(km)</Text>
      </FormControlLabel>
      <Input>
        <InputField
          value={maintenanceKm}
          onChangeText={setMaintenanceKm}
          placeholder="정비 주기(km)"
          keyboardType="numeric"
        />
      </Input>
      <FormControlLabel>
        <Text>정비 주기(개월)</Text>
      </FormControlLabel>
      <Input>
        <InputField
          value={maintenanceMonth}
          onChangeText={setMaintenanceMonth}
          placeholder="정비 주기(개월)"
          keyboardType="numeric"
        />
      </Input>
      <Button onPress={handleSave}>
        <ButtonText>저장</ButtonText>
      </Button>
    </FormControl>
  );
};

const MaintenanceItemList = ({
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
export function SettingsMaintenanceItemPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: items } = useMaintenanceQueries();
  const { data: item } = useMaintenanceItemQueries(editingId ?? '');

  useEffect(() => {
    console.log(items);
  }, [items]);

  const { mutateAsync: createMaintenanceItem } =
    useCreateMaintenanceItemMutation();
  const { mutateAsync: updateMaintenanceItem } =
    useUpdateMaintenanceItemMutation();
  const { mutateAsync: deleteMaintenanceItem } =
    useDeleteMaintenanceItemMutation();

  const handleDelete = async (id: string) => {
    await deleteMaintenanceItem(id);
  };

  const handleEdit = (item: MaintenanceItem) => {
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
    <SafeAreaView className="bg-white flex-1">
      <Box className="p-4">
        <MaintenanceItemForm initialData={item ?? null} onSave={handleSave} />
      </Box>
      <Box className="p-4 border-b border-gray-200 flex flex-row items-center gap-2">
        <Icon as={ListIcon} className="w-5 h-5" />
        <Text className="text-lg font-bold">정비 항목</Text>
      </Box>
      <MaintenanceItemList
        items={items ?? []}
        renderItem={({ item }) => (
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
        )}
      />
    </SafeAreaView>
  );
}

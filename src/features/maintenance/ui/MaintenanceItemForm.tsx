import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { FormControl } from '@/shared/components/ui/form-control';
import { Button, ButtonText } from '@/shared/components/ui/button';

import type { CreateMaintenanceItemData } from '@/shared/repositories/MaintenanceItemRepository';
import type MaintenanceItem from '@/shared/models/MaintenanceItem';
import { FormField } from '@/shared/components/form/FormField';

export const MaintenanceItemForm = ({
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
    <FormControl className="flex flex-col gap-4 bg-white w-full p-4">
      <FormField
        type="text"
        label="정비 항목명"
        required
        value={name}
        onChangeText={setName}
        placeholder="정비 항목명"
      />

      <FormField
        type="number"
        label="정비 주기(km)"
        value={maintenanceKm}
        onChangeText={setMaintenanceKm}
        placeholder="정비 주기(km)"
        keyboardType="numeric"
      />

      <FormField
        type="number"
        label="정비 주기(개월)"
        value={maintenanceMonth}
        onChangeText={setMaintenanceMonth}
        placeholder="정비 주기(개월)"
        keyboardType="numeric"
      />

      <Button onPress={handleSave} className="h-14 rounded-xl">
        <ButtonText>저장</ButtonText>
      </Button>
    </FormControl>
  );
};

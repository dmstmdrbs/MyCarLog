import { useState } from 'react';
import { FormControl } from '@/shared/components/ui/form-control';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { FormField } from '@/shared/components/form/FormField';
import { HStack } from '@/shared/components/ui/hstack';
import { Button } from '@/shared/components/ui/button';
import { ButtonText } from '@/shared/components/ui/button';
import Shop from '@/shared/models/Shop';

export const MaintenanceShopForm = ({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) => {
  const [newShopName, setNewShopName] = useState<Shop['name']>('');

  const handleSubmit = () => {
    const trimmedName = newShopName.trim();
    if (trimmedName.length > 0) {
      onSubmit(trimmedName);
      setNewShopName('');
    }
  };

  return (
    <FormControl>
      <FormLabel name="정비 업체 추가" size="sm" />
      <HStack space="sm">
        <FormField
          type="text"
          value={newShopName}
          onChangeText={setNewShopName}
          placeholder="업체 이름을 입력해주세요"
          className="flex-1"
        />
        <Button onPress={handleSubmit}>
          <ButtonText>추가</ButtonText>
        </Button>
      </HStack>
    </FormControl>
  );
};

import { Input, InputField } from '@/shared/components/ui/input';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { FormControl } from '@/shared/components/ui/form-control';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { useState } from 'react';
import { useCreateStation } from '../hooks/useStationQueries';
import { Alert } from 'react-native';

export const StationAddForm = ({
  stationType,
}: {
  stationType: 'ev' | 'gas';
}) => {
  const [newStationName, setNewStationName] = useState('');

  const createStation = useCreateStation();

  const handleAddStation = async () => {
    const trimmedNewStationName = newStationName.trim();

    if (trimmedNewStationName) {
      try {
        await createStation.mutateAsync({
          name: trimmedNewStationName,
          type: stationType,
        });
        setNewStationName('');
      } catch (error) {
        Alert.alert('주유소 추가 실패', '주유소 추가에 실패했습니다.');
        console.error(error);
      }
    }
  };

  return (
    <FormControl>
      <FormLabel name="새로운 주유소 추가" />
      <Input>
        <InputField
          placeholder="주유소 이름"
          value={newStationName}
          onChangeText={(text) => setNewStationName(text)}
        />
      </Input>
      <Button onPress={handleAddStation}>
        <ButtonText>새로운 주유소 추가</ButtonText>
      </Button>
    </FormControl>
  );
};

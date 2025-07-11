import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { format } from 'date-fns';
import { formatNumber } from '@/shared/utils/format';
import { Alert, FlatList } from 'react-native';
import { paymentMethodMap } from '@shared/constants/paymentMethodMap';
import { FuelRecordType } from '@/shared/models/FuelRecord';
import { Pressable } from '@/shared/components/ui/pressable';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useSelectedVehicle } from '@/features/vehicle';
import { FuelStackParamList } from '@/pages/fuelManagement/navigator';
import { useCallback } from 'react';
import { useDeleteFuelRecord } from '@/features/fuelRecord/hooks/useFuelRecordQueries';
import { useModal } from '@/shared/hooks/useModal';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
} from '@/shared/components/ui/modal';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { HStack } from '@/shared/components/ui/hstack';

interface FuelRecordListProps {
  fuelRecords: FuelRecordType[];
  unit: string;
  unitPrice: string;
}

const RecordItem = ({
  item,
  unit,
  unitPrice,
}: {
  item: FuelRecordType;
  unit: string;
  unitPrice: string;
}) => {
  const navigation = useNavigation<NavigationProp<FuelStackParamList>>();
  const { selectedVehicle } = useSelectedVehicle();
  const deleteFuelRecordMutation = useDeleteFuelRecord();
  const { isOpen, open, close } = useModal();

  const navigateToFuelRecord = useCallback(() => {
    if (!selectedVehicle || !item.id) return;
    navigation.navigate('FuelRecord', {
      targetDate: format(item.date, 'yyyy-MM-dd'),
      vehicleId: selectedVehicle.id,
      recordId: item.id,
    });
  }, [item.id, navigation, selectedVehicle]);

  const handleDeleteRecord = useCallback(async () => {
    if (!selectedVehicle || !item.id) return;
    Alert.alert('삭제', '주유 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        onPress: () => deleteFuelRecordMutation.mutateAsync(item.id),
      },
    ]);
  }, [item.id, deleteFuelRecordMutation, selectedVehicle]);

  const handleLongPress = useCallback(() => {
    open();
  }, []);

  return (
    <Pressable
      className="flex flex-row justify-between items-center p-4 border-b border-gray-200 bg-white"
      onPress={handleLongPress}
    >
      <Text className="text-sm text-gray-500">
        {format(item.date, 'yyyy-MM-dd')}
      </Text>
      <Text className="text-sm text-gray-500">
        {formatNumber(item.totalCost)}
      </Text>
      <Text className="text-sm text-gray-500">
        {formatNumber(item.unitPrice)}
        {unitPrice}
      </Text>
      <Text className="text-sm text-gray-500">
        {formatNumber(item.amount)}
        {unit}
      </Text>
      <Text className="text-sm text-gray-500">
        {paymentMethodMap[item.paymentType]}
      </Text>
      <Modal isOpen={isOpen} onClose={close} size="sm">
        <ModalBackdrop />
        <ModalContent>
          <ModalBody>
            <Text>주유 기록 관리</Text>
          </ModalBody>
          <ModalFooter className="w-full py-2">
            <HStack className="w-full justify-evenly gap-6">
              <Button
                onPress={() => {
                  navigateToFuelRecord();
                  close();
                }}
                variant="solid"
                className="flex-1"
              >
                <ButtonText>수정</ButtonText>
              </Button>
              <Button
                onPress={() => {
                  handleDeleteRecord();
                  close();
                }}
                className="flex-1"
                variant="outline"
              >
                <ButtonText>삭제</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Pressable>
  );
};

export const FuelRecordList = ({
  fuelRecords,
  unit,
  unitPrice,
}: FuelRecordListProps) => {
  if (fuelRecords.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-light h-full">
        <Text className="text-typography-500 text-center">
          주유 기록이 없습니다.
        </Text>
      </Box>
    );
  }
  return (
    <FlatList
      data={fuelRecords}
      renderItem={({ item }) => (
        <RecordItem item={item} unit={unit} unitPrice={unitPrice} />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

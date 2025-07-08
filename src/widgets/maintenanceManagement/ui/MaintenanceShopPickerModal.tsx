import { Action } from '@/features/maintenance/reducer/maintenanceReducer';
import { useShops } from '@/features/maintenance/hooks/useShopQueries';
import { useCreateShop } from '@/features/maintenance/hooks/useShopQueries';
import { Alert } from 'react-native';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { ModalBackdrop } from '@/shared/components/ui/modal';
import { ModalContent } from '@/shared/components/ui/modal';
import { ModalHeader } from '@/shared/components/ui/modal';
import { ModalBody } from '@/shared/components/ui/modal';
import { Dispatch } from 'react';
import { Box } from '@/shared/components/ui/box';
import { Text } from '@/shared/components/ui/text';
import { Spinner } from '@/shared/components/ui/spinner';
import { Button } from '@/shared/components/ui/button';
import { ButtonText } from '@/shared/components/ui/button';
import { VStack } from '@/shared/components/ui/vstack';
import { MaintenanceShopForm } from './MaintenanceShopForm';
import { FormControl } from '@/shared/components/ui/form-control';
import { FormLabel } from '@/shared/components/form/FormLabel';
import type Shop from '@/shared/models/Shop';

export const MaintenancePickerModal = ({
  isOpen,
  onClose,
  dispatch,
}: {
  isOpen: boolean;
  onClose: () => void;
  dispatch: Dispatch<Action>;
}) => {
  const { data: shops, isLoading: isLoadingShops } = useShops();
  const createShop = useCreateShop();

  const handleSelectDiy = () => {
    dispatch({
      type: 'setIsDiy',
      data: { isDiy: true, shopName: '', shopId: '' },
    });
    onClose();
  };

  const handleSelectShop = (shop: Shop) => {
    dispatch({
      type: 'setShop',
      data: { shopName: shop.name, shopId: shop.id },
    });
    onClose();
  };

  const handleAddShop = async (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName.length > 0) {
      try {
        await createShop.mutateAsync(trimmedName);
      } catch (error) {
        Alert.alert(
          '정비 업체 추가 실패',
          '정비 업체 추가 중 오류가 발생했습니다. 다시 시도해주세요.',
        );
        console.error(error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Text className="text-lg font-semibold text-gray-900">
            정비 업체 선택
          </Text>
        </ModalHeader>
        <ModalBody>
          <Box className="h-80 gap-2 bg-white p-1 rounded-sm">
            {isLoadingShops ? (
              <Box className="flex-1 justify-center items-center">
                <Spinner />
              </Box>
            ) : !shops || shops.length === 0 ? (
              <Box className="flex-1 justify-center items-center">
                <Text className="text-gray-500 text-center">
                  등록된 정비 업체가 없습니다.
                </Text>
              </Box>
            ) : (
              shops?.map((item) => (
                <Button
                  className="bg-white justify-start rounded-md w-full px-2 border-b border-primary-100 "
                  key={item.id}
                  onPress={() => handleSelectShop(item)}
                >
                  <ButtonText className="text-lg font-medium text-gray-700">
                    {item.name}
                  </ButtonText>
                </Button>
              ))
            )}
          </Box>
          <VStack className="p-2">
            <MaintenanceShopForm onSubmit={handleAddShop} />
          </VStack>
          <ModalFooter>
            <VStack className="mt-2 w-full p-2">
              <FormControl className="w-full">
                <FormLabel name="셀프로 정비하셨나요?" size="sm" />
                <Button className="w-full" onPress={handleSelectDiy}>
                  <ButtonText>자가정비 체크</ButtonText>
                </Button>
              </FormControl>
            </VStack>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

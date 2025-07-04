import { Dispatch, useMemo, useState } from 'react';

import { Text } from '@/shared/components/ui/text';
import { Input, InputField } from '@/shared/components/ui/input';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { Textarea, TextareaInput } from '@/shared/components/ui/textarea';
import { FormControl } from '@/shared/components/ui/form-control';
import { Box } from '@/shared/components/ui/box';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/shared/components/ui/modal';
import { formatDateForDisplay } from '@/shared/utils/format';
import { Calendar } from '@/shared/components/Calendar';
import { format, formatDate } from 'date-fns';
import { PaymentMethodList } from '@/features/fuelRecord/PaymentMethodList';
import { Divider } from '@/shared/components/ui/divider';
import { PaymentMethodForm } from '@/features/fuelRecord/PaymentMethodForm';
import {
  useCreatePaymentMethod,
  usePaymentMethods,
} from '@/features/paymentMethods';
import type { PaymentMethodType } from '@/shared/models/PaymentMethod';
import { Alert } from 'react-native';
import { calendarTheme } from '@/shared/constants/calendar';
import { FormCard } from '@/shared/components/form/FormCard';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { useMaintenanceItemQueries } from '@/features/maintenance/hooks/useMaintenanceItemQueries';
import { Spinner } from '@/shared/components/ui/spinner';
import {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';
import {
  useCreateShop,
  useShops,
} from '@/features/maintenance/hooks/useShopQueries';
import Shop from '@/shared/models/Shop';
import { Action } from '@/pages/maintenanceManagement/MaintenanceRecordPage';

type MaintenanceRecordFormProps = {
  initialData?: UpdateMaintenanceRecordData;
  onSubmit: (
    data: CreateMaintenanceRecordData | UpdateMaintenanceRecordData,
  ) => void;
  currentDate: Date;
  formData: CreateMaintenanceRecordData | UpdateMaintenanceRecordData;
  dispatch: Dispatch<Action>;
};

export const MaintenanceRecordForm = ({
  currentDate,
  formData,
  dispatch,
}: MaintenanceRecordFormProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentTypePicker, setShowPaymentTypePicker] = useState(false);
  const [showMaintenanceItemPicker, setShowMaintenanceItemPicker] =
    useState(false);
  const [showShopPicker, setShowShopPicker] = useState(false);

  const { data: maintenanceItems, isLoading: isLoadingMaintenanceItems } =
    useMaintenanceItemQueries();
  const { data: shops, isLoading: isLoadingShops } = useShops();
  const createShop = useCreateShop();
  const [newShopName, setNewShopName] = useState<Shop['name']>('');

  const selectedMaintenanceItem = useMemo(
    () =>
      maintenanceItems?.find((item) => item.id === formData.maintenanceItemId),
    [maintenanceItems, formData.maintenanceItemId],
  );
  const { data: paymentMethods } = usePaymentMethods();
  const createPaymentMethod = useCreatePaymentMethod();
  const [newPaymentMethod, setNewPaymentMethod] = useState<{
    name: PaymentMethodType['name'];
    type: Exclude<PaymentMethodType['type'], 'cash'>;
  }>({
    name: '',
    type: 'credit',
  });

  const handleAddPaymentMethod = async () => {
    if (newPaymentMethod?.type) {
      try {
        await createPaymentMethod.mutateAsync({
          name: newPaymentMethod.name,
          type: newPaymentMethod.type,
        });
        setNewPaymentMethod({
          name: '',
          type: 'credit',
        });
      } catch (error) {
        Alert.alert(
          '결제 수단 추가 실패',
          '결제 수단 추가 중 오류가 발생했습니다. 다시 시도해주세요.',
        );
        console.error(error);
      }
    }
  };

  return (
    <FormControl className="flex-1">
      <FormCard>
        <FormLabel name="🛠️ 정비 정보" size="lg" />

        <Box>
          <FormLabel name="정비 일자" size="sm" />
          <Button
            onPress={() => setShowDatePicker(true)}
            className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-primary-500 active:bg-white transition-all w-full justify-start"
          >
            <ButtonText className="font-medium text-gray-900">
              {formatDateForDisplay(new Date(formData.date ?? currentDate)) ||
                '날짜를 선택해주세요'}
            </ButtonText>
          </Button>

          <Modal
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
          >
            <ModalBackdrop />
            <ModalContent>
              <Calendar
                currentDate={new Date(formData.date ?? currentDate)}
                onMonthChange={(day) => {
                  dispatch({
                    type: 'setDate',
                    data: {
                      date: formatDate(new Date(day.dateString), 'yyyy-MM-dd'),
                    },
                  });
                }}
                onDayPress={(day) => {
                  dispatch({
                    type: 'setDate',
                    data: {
                      date: formatDate(new Date(day.dateString), 'yyyy-MM-dd'),
                    },
                  });
                  setShowDatePicker(false);
                }}
                markedDates={{
                  [format(
                    new Date(formData.date ?? currentDate),
                    'yyyy-MM-dd',
                  )]: {
                    selected: true,
                    selectedColor: calendarTheme.selectedColor,
                    color: calendarTheme.accentColor1,
                  },
                }}
              />
            </ModalContent>
          </Modal>
        </Box>
        <Box>
          <FormLabel name="정비 항목" size="sm" />
          <Button
            onPress={() => setShowMaintenanceItemPicker(true)}
            className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-primary-500 active:bg-white transition-all w-full justify-start"
          >
            <ButtonText className="font-medium text-gray-900">
              {selectedMaintenanceItem?.name || '정비 항목을 선택해주세요'}
            </ButtonText>
          </Button>

          <Modal
            isOpen={showMaintenanceItemPicker}
            onClose={() => setShowMaintenanceItemPicker(false)}
          >
            <ModalBackdrop />
            <ModalContent className="p-2 h-80">
              <ModalHeader className="p-2">
                <Text className="text-lg font-semibold text-gray-900">
                  정비 항목 선택
                </Text>
              </ModalHeader>
              <Divider orientation="horizontal" />

              <ModalBody className="p-1 h-80 w-full">
                {isLoadingMaintenanceItems ? (
                  <Spinner />
                ) : (
                  maintenanceItems?.map((item) => (
                    <Button
                      className="bg-white justify-start rounded-xl w-full px-2 "
                      key={item.id}
                      onPress={() => {
                        dispatch({
                          type: 'setMaintenanceItem',
                          data: {
                            maintenanceItemId: item.id,
                          },
                        });
                        setShowMaintenanceItemPicker(false);
                      }}
                    >
                      <ButtonText className="text-lg font-medium text-gray-700">
                        {item.name}
                      </ButtonText>
                    </Button>
                  ))
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
        <Box>
          <FormLabel name="정비 업제" size="sm" />
          <Button
            onPress={() => setShowShopPicker(true)}
            className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-primary-500 active:bg-white transition-all w-full justify-start"
          >
            <ButtonText className="font-medium text-gray-900">
              {formData.isDiy
                ? '자가 정비'
                : formData.shopName || '정비 업체를 선택해주세요'}
            </ButtonText>
          </Button>

          <Modal
            isOpen={showShopPicker}
            onClose={() => setShowShopPicker(false)}
          >
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
                        onPress={() => {
                          dispatch({
                            type: 'setShop',
                            data: {
                              shopName: item.name,
                            },
                          });
                          setShowShopPicker(false);
                        }}
                      >
                        <ButtonText className="text-lg font-medium text-gray-700">
                          {item.name}
                        </ButtonText>
                      </Button>
                    ))
                  )}
                </Box>
                <Box className="p-2 w-full">
                  <FormControl>
                    <FormLabel name="정비 업체 추가" size="sm" />
                    <Box className="flex-row gap-2 w-full">
                      <Input className="flex-1">
                        <InputField
                          value={newShopName}
                          onChangeText={(text) => setNewShopName(text)}
                          placeholder="업체 이름을 입력해주세요"
                        />
                      </Input>
                      <Button
                        onPress={async () => {
                          try {
                            await createShop.mutateAsync(newShopName);
                          } finally {
                            setNewShopName('');
                          }
                        }}
                      >
                        <ButtonText>추가</ButtonText>
                      </Button>
                    </Box>
                    <Box className="w-full mt-2">
                      <FormLabel name="셀프로 정비하셨나요?" size="md" />
                      <Button
                        className="w-full"
                        onPress={() => {
                          dispatch({
                            type: 'setIsDiy',
                            data: { isDiy: true, shopName: '', shopId: '' },
                          });
                          setShowShopPicker(false);
                        }}
                      >
                        <ButtonText>자가정비 체크</ButtonText>
                      </Button>
                    </Box>
                  </FormControl>
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>
        <Box>
          <FormLabel name="정비 비용(원)" size="sm" />
          <Input>
            <InputField
              value={formData.cost?.toString() ?? ''}
              onChangeText={(text) =>
                dispatch({
                  type: 'setCost',
                  data: { ...formData, cost: Number(text) },
                })
              }
            />
          </Input>
        </Box>
      </FormCard>

      <FormCard>
        <FormLabel name="결제 정보" size="lg" />

        <Box>
          <FormLabel name="지불 수단" size="sm" />
          <Button
            variant="outline"
            onPress={() => setShowPaymentTypePicker(true)}
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start text-gray-700"
          >
            <ButtonText>{formData.paymentName || '지불 수단 선택'}</ButtonText>
          </Button>

          <Modal
            isOpen={showPaymentTypePicker}
            onClose={() => setShowPaymentTypePicker(false)}
          >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader>
                <Text className="text-lg font-semibold text-gray-900">
                  지불 수단 선택
                </Text>
              </ModalHeader>

              <Box className="h-80 py-2 bg-white">
                <PaymentMethodList
                  paymentMethods={paymentMethods ?? []}
                  onClickPaymentMethodItem={(method) => {
                    setShowPaymentTypePicker(false);
                    dispatch({
                      type: 'setPaymentMethod',
                      data: {
                        paymentMethodId: method.id,
                        paymentName: method.name,
                        paymentType: method.type,
                      },
                    });
                  }}
                />
                <Divider className="my-1" orientation="horizontal" />
                <Text className="text-lg font-semibold text-gray-700">
                  결제 수단 추가
                </Text>
                <PaymentMethodForm
                  name={newPaymentMethod.name}
                  type={newPaymentMethod.type}
                  onChangeName={(name) =>
                    setNewPaymentMethod({ ...newPaymentMethod, name })
                  }
                  onChangeType={(type) =>
                    setNewPaymentMethod({ ...newPaymentMethod, type })
                  }
                />
              </Box>
              <ModalFooter>
                <Button onPress={handleAddPaymentMethod}>
                  <ButtonText>결제 수단 추가</ButtonText>
                </Button>
                <Button onPress={() => setShowPaymentTypePicker(false)}>
                  <ButtonText>취소</ButtonText>
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      </FormCard>

      <FormCard>
        <FormLabel name="누적 주행거리(km)" size="lg" />
        <Input>
          <InputField
            value={formData.odometer?.toString() ?? ''}
            onChangeText={(text) =>
              dispatch({
                type: 'setMileage',
                data: { odometer: Number(text) },
              })
            }
            keyboardType="numeric"
          />
        </Input>
      </FormCard>

      <FormCard>
        <FormLabel name="메모" size="lg" />
        <Textarea>
          <TextareaInput
            value={formData.memo ?? ''}
            onChangeText={(text) =>
              dispatch({ type: 'setMemo', data: { memo: text } })
            }
          />
        </Textarea>
      </FormCard>
    </FormControl>
  );
};

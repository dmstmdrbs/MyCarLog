import { Dispatch, useMemo, useState } from 'react';

import { Button, ButtonText } from '@/shared/components/ui/button';
import { FormControl } from '@/shared/components/ui/form-control';
import { Box } from '@/shared/components/ui/box';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
} from '@/shared/components/ui/modal';
import { formatDateForDisplay } from '@/shared/utils/format';
import { Calendar } from '@/shared/components/Calendar';
import { format, formatDate } from 'date-fns';
import { calendarTheme } from '@/shared/constants/calendar';
import { FormCard } from '@/shared/components/form/FormCard';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { FormField } from '@/shared/components/form/FormField';
import { useMaintenanceItemQueries } from '@/features/maintenance/hooks/useMaintenanceItemQueries';
import {
  CreateMaintenanceRecordData,
  UpdateMaintenanceRecordData,
} from '@/shared/repositories/MaintenanceRecordRepository';

import { MaintenancePickerModal } from './ui/MaintenanceShopPickerModal';
import { Action } from '@/features/maintenance/reducer/maintenanceReducer';
import { PaymentMethodModal } from '@/features/paymentMethods/ui/PaymentMethodModal';
import { MaintenanceItemPickerModal } from './ui/MaintenanceItemPickerModal';

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

  const { data: maintenanceItems } = useMaintenanceItemQueries();

  const selectedMaintenanceItem = useMemo(
    () =>
      maintenanceItems?.find((item) => item.id === formData.maintenanceItemId),
    [maintenanceItems, formData.maintenanceItemId],
  );

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
          <MaintenanceItemPickerModal
            isOpen={showMaintenanceItemPicker}
            onClose={() => setShowMaintenanceItemPicker(false)}
            onSelectMaintenanceItem={(item) => {
              dispatch({
                type: 'setMaintenanceItem',
                data: { maintenanceItemId: item.id },
              });
            }}
          />
        </Box>

        <Box>
          <FormLabel name="정비 업체" size="sm" />
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
          <MaintenancePickerModal
            isOpen={showShopPicker}
            onClose={() => setShowShopPicker(false)}
            dispatch={dispatch}
          />
        </Box>

        <FormField
          type="number"
          label="정비 비용(원)"
          value={formData.cost?.toString() ?? ''}
          onChangeText={(text) =>
            dispatch({
              type: 'setCost',
              data: { ...formData, cost: Number(text) || 0 },
            })
          }
          placeholder="예: 50000"
          keyboardType="numeric"
        />
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

          <PaymentMethodModal
            isOpen={showPaymentTypePicker}
            onClose={() => setShowPaymentTypePicker(false)}
            onSelectPaymentMethod={(method) => {
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
        </Box>
      </FormCard>

      <FormCard>
        <FormLabel name="누적 주행거리(km)" size="lg" />
        <FormField
          type="number"
          value={formData.odometer?.toString() ?? ''}
          onChangeText={(text) =>
            dispatch({
              type: 'setMileage',
              data: { odometer: Number(text) || 0 },
            })
          }
          placeholder="예: 50000"
          keyboardType="numeric"
        />
      </FormCard>

      <FormCard>
        <FormLabel name="메모" />
        <FormField
          type="textarea"
          value={formData.memo ?? ''}
          onChangeText={(text) =>
            dispatch({ type: 'setMemo', data: { memo: text } })
          }
          placeholder="특이사항이나 기억하고 싶은 내용을 적어보세요 (선택사항)"
          numberOfLines={4}
          multiline={true}
        />
      </FormCard>
    </FormControl>
  );
};

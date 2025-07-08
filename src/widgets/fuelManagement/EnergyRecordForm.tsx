import { Box } from '@shared/components/ui/box';
import { FormControl } from '@shared/components/ui/form-control';
import { Input, InputField } from '@shared/components/ui/input';
import { Button, ButtonText } from '@shared/components/ui/button';
import { Textarea, TextareaInput } from '@shared/components/ui/textarea';
import { useMemo, useState } from 'react';

import { formatDate } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
} from '@shared/components/ui/modal';
import { useStations } from '@features/station';
import type { PaymentMethodType } from '@shared/models/PaymentMethod';

import { formatDateForDisplay } from '@/shared/utils/format';
import { Calendar } from '@/shared/components/Calendar';
import { FormCard } from '@/shared/components/form/FormCard';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { PaymentMethodModal } from '../../features/paymentMethods/ui/PaymentMethodModal';
import { StationPickerModal } from '../../features/station/ui/StationPickerModal';

interface EnergyRecordFormData {
  date: string; // YYYY-MM-DD 형식
  totalCost: number;
  unitPrice: number;
  amount: number;
  paymentMethodId: string;
  paymentName: string;
  paymentType: PaymentMethodType['type'];
  stationId: string;
  stationName: string;
  memo: string;
}

interface EnergyRecordFormProps {
  vehicleType: 'ICE' | 'EV';
  energyRecord: EnergyRecordFormData;
  onEnergyRecordChange: (energyRecord: EnergyRecordFormData) => void;
}

export function EnergyRecordForm({
  vehicleType,
  energyRecord,
  onEnergyRecordChange,
}: EnergyRecordFormProps) {
  // 날짜 선택기 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [showPaymentTypePicker, setShowPaymentTypePicker] = useState(false);

  // 새로운 TanStack Query 방식 사용
  const { data: stations = [] } = useStations();

  const selectedStation = useMemo(
    () => stations.find((s) => s.id === energyRecord.stationId),
    [stations, energyRecord.stationId],
  );

  // 차량 타입별 설정
  const isEV = vehicleType === 'EV';
  const config = useMemo(
    () => ({
      energyType: isEV ? '충전' : '주유',
      icon: isEV ? '🔋' : '⛽',
      unit: isEV ? 'kWh' : 'L',
      unitPrice: isEV ? '원/kWh' : '원/L',
      station: isEV ? '충전소' : '주유소',
      stationPlaceholder: isEV
        ? '충전소를 선택해주세요'
        : '주유소를 선택해주세요',
      amountPlaceholder: isEV ? '예: 45.2' : '예: 30.5',
      unitPricePlaceholder: isEV ? '예: 280' : '예: 1,650',
    }),
    [isEV],
  );

  // 자동 계산 함수들
  const calculateAmount = () => {
    if (energyRecord.totalCost > 0 && energyRecord.unitPrice > 0) {
      const calculatedAmount = energyRecord.totalCost / energyRecord.unitPrice;
      onEnergyRecordChange({
        ...energyRecord,
        amount: Math.round(calculatedAmount * 100) / 100, // 소수점 둘째자리까지
      });
    }
  };

  const calculateTotalCost = () => {
    if (energyRecord.amount > 0 && energyRecord.unitPrice > 0) {
      const calculatedTotalCost = energyRecord.amount * energyRecord.unitPrice;
      onEnergyRecordChange({
        ...energyRecord,
        totalCost: Math.round(calculatedTotalCost),
      });
    }
  };

  // 입력값 변경 핸들러들
  const handleTotalCostChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    onEnergyRecordChange({ ...energyRecord, totalCost: numericValue });
  };

  const handleUnitPriceChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    onEnergyRecordChange({ ...energyRecord, unitPrice: numericValue });
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    onEnergyRecordChange({ ...energyRecord, amount: numericValue });
  };

  const handleMemoChange = (value: string) => {
    onEnergyRecordChange({ ...energyRecord, memo: value });
  };

  const handleDateChange = (selectedDate: string) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = formatDate(new Date(selectedDate), 'yyyy-MM-dd', {
        locale: ko,
      });
      onEnergyRecordChange({ ...energyRecord, date: dateString });
    }
  };

  // 값 표시 함수들 (0일 때 빈 문자열)
  const displayValue = (value: number) => (value === 0 ? '' : value.toString());
  const displayCurrency = (value: number) =>
    value === 0 ? '' : value.toLocaleString();

  return (
    <FormControl className="flex-1">
      {/* 에너지 정보 카드 - 동적 */}
      <FormCard>
        <FormLabel
          name={`${config.icon} ${config.energyType} 정보`}
          size="lg"
        />

        <Box>
          <FormLabel name="날짜" size="sm" />
          <Button
            onPress={() => setShowDatePicker(true)}
            className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-primary-500 active:bg-white transition-all w-full justify-start"
          >
            <ButtonText className="font-medium text-gray-900">
              {formatDateForDisplay(new Date(energyRecord.date)) ||
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
                currentDate={new Date(energyRecord.date)}
                onDayPress={(day) => {
                  handleDateChange(day.dateString);
                }}
                enableSwipeMonths={true}
                markedDates={{
                  [energyRecord.date]: {
                    selected: true,
                    selectedColor: '#0A4D68',
                    color: '#0A4D68',
                  },
                }}
              />
            </ModalContent>
          </Modal>
        </Box>

        <Box>
          <FormLabel name="총 비용" size="sm" />
          <Input className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white transition-all">
            <InputField
              placeholder="예: 50,000"
              value={displayCurrency(energyRecord.totalCost)}
              className="text-lg font-medium"
              keyboardType="numeric"
              onChangeText={handleTotalCostChange}
              onBlur={calculateAmount}
            />
          </Input>
        </Box>

        <Box>
          <FormLabel name={`단가 (${config.unitPrice})`} size="sm" />
          <Input className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white transition-all">
            <InputField
              placeholder={config.unitPricePlaceholder}
              value={displayCurrency(energyRecord.unitPrice)}
              className="text-lg font-medium"
              keyboardType="numeric"
              onChangeText={handleUnitPriceChange}
              onBlur={() => {
                // 단가 변경 시 총 비용이 있으면 주유/충전량 계산, 주유/충전량이 있으면 총 비용 계산
                if (energyRecord.totalCost > 0) {
                  calculateAmount();
                } else if (energyRecord.amount > 0) {
                  calculateTotalCost();
                }
              }}
            />
          </Input>
        </Box>

        <Box>
          <FormLabel
            name={`${config.energyType}량 (${config.unit})`}
            size="sm"
          />
          <Input className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white transition-all">
            <InputField
              placeholder={config.amountPlaceholder}
              value={displayValue(energyRecord.amount)}
              className="text-lg font-medium"
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              onBlur={calculateTotalCost}
            />
          </Input>
        </Box>

        <Box>
          <FormLabel name={config.station} size="sm" />
          <Button
            onPress={() => setShowStationPicker(true)}
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start px-3"
          >
            <ButtonText className="text-lg font-medium text-gray-700">
              {selectedStation?.name || config.stationPlaceholder}
            </ButtonText>
          </Button>
          <StationPickerModal
            isOpen={showStationPicker}
            onClose={() => setShowStationPicker(false)}
            onSelectStation={(station) => {
              onEnergyRecordChange({
                ...energyRecord,
                stationId: station.id,
                stationName: station.name,
              });
            }}
          />
        </Box>
      </FormCard>

      {/* 결제 정보 카드 */}
      <FormCard>
        <FormLabel name="결제 정보" />

        <Box>
          <FormLabel name="결제 방법" size="sm" />
          <Button
            variant="outline"
            onPress={() => setShowPaymentTypePicker(true)}
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start text-gray-700"
          >
            <ButtonText>
              {energyRecord.paymentName || '결제 수단 선택'}
            </ButtonText>
          </Button>

          <PaymentMethodModal
            isOpen={showPaymentTypePicker}
            onClose={() => setShowPaymentTypePicker(false)}
            onSelectPaymentMethod={(paymentMethod) => {
              onEnergyRecordChange({
                ...energyRecord,
                paymentMethodId: paymentMethod.id,
                paymentName: paymentMethod.name,
                paymentType: paymentMethod.type,
              });
            }}
          />
        </Box>
      </FormCard>

      {/* 메모 카드 - 공통 */}
      <FormCard>
        <FormLabel name="메모" />

        <Textarea className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white transition-all ">
          <TextareaInput
            placeholder="특이사항이나 기억하고 싶은 내용을 적어보세요 (선택사항)"
            className="text-base align-top"
            value={energyRecord.memo}
            onChangeText={handleMemoChange}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Textarea>
      </FormCard>
    </FormControl>
  );
}

// 타입 export (다른 파일에서 사용할 수 있도록)
export type { EnergyRecordFormData, EnergyRecordFormProps };

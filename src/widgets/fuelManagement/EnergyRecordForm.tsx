import { Box } from '@shared/components/ui/box';
import { FormControl } from '@shared/components/ui/form-control';
import { Button, ButtonText } from '@shared/components/ui/button';
import { useMemo, useReducer, useEffect } from 'react';

import { format, formatDate } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useStations } from '@features/station';

import { formatDateForDisplay } from '@/shared/utils/format';
import { FormCard } from '@/shared/components/form/FormCard';
import { FormLabel } from '@/shared/components/form/FormLabel';
import { FormField } from '@/shared/components/form/FormField';
import { PaymentMethodModal } from '../../features/paymentMethods/ui/PaymentMethodModal';
import { StationPickerModal } from '../../features/station/ui/StationPickerModal';
import { FloatingSubmitButton } from '@/shared/components/FloatingSubmitButton';
import { ScrollView } from 'react-native';
import { useModal } from '@/shared/hooks/useModal';
import { DateSelectModal } from './ui/DateSelectModal';
import { CreateFuelRecordData } from '@/shared/models/FuelRecord';
import { MarkedDates } from 'react-native-calendars/src/types';

import { calendarTheme } from '@/shared/constants/calendar';

type EnergyRecordFormData = Omit<CreateFuelRecordData, 'id' | 'vehicleId'>;

interface EnergyRecordFormProps {
  vehicleType: 'ICE' | 'EV';
  initialFormData?: EnergyRecordFormData;
  onSubmit: (energyRecord: EnergyRecordFormData) => void;
}

export function EnergyRecordForm({
  vehicleType,
  initialFormData,
  onSubmit,
}: EnergyRecordFormProps) {
  // 리듀서 액션 타입 정의
  type Action =
    | {
        type: 'SET_FIELD';
        field: keyof EnergyRecordFormData;
        value: EnergyRecordFormData[keyof EnergyRecordFormData];
      }
    | { type: 'BULK_UPDATE'; payload: Partial<EnergyRecordFormData> }
    | { type: 'RESET'; payload?: EnergyRecordFormData };

  // 리듀서 함수
  function energyRecordReducer(
    state: EnergyRecordFormData,
    action: Action,
  ): EnergyRecordFormData {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'BULK_UPDATE':
        return { ...state, ...action.payload };
      case 'RESET':
        return action.payload ?? initialState;
      default:
        return state;
    }
  }

  // 초기값
  const initialState: EnergyRecordFormData = {
    date: new Date().getTime(),
    odometer: 0,
    totalCost: 0,
    unitPrice: 0,
    amount: 0,
    paymentMethodId: '',
    paymentName: '',
    paymentType: 'credit',
    stationId: '',
    stationName: '',
    memo: '',
    ...initialFormData,
  };

  // useReducer로 상태 관리
  const [energyRecord, dispatch] = useReducer(
    energyRecordReducer,
    initialState,
  );

  // initialFormData가 바뀔 때 RESET
  useEffect(() => {
    dispatch({
      type: 'RESET',
      payload: { ...initialState, ...initialFormData },
    });
  }, [initialFormData]);

  // 날짜 선택기 상태
  const dateModal = useModal();
  const stationModal = useModal();
  const paymentModal = useModal();

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
      dispatch({
        type: 'SET_FIELD',
        field: 'amount',
        value: Math.round(calculatedAmount * 100) / 100,
      });
    }
  };

  const calculateTotalCost = () => {
    if (energyRecord.amount > 0 && energyRecord.unitPrice > 0) {
      const calculatedTotalCost = energyRecord.amount * energyRecord.unitPrice;
      dispatch({
        type: 'SET_FIELD',
        field: 'totalCost',
        value: Math.round(calculatedTotalCost),
      });
    }
  };

  // 입력값 변경 핸들러들
  const handleTotalCostChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    dispatch({ type: 'SET_FIELD', field: 'totalCost', value: numericValue });
  };

  const handleUnitPriceChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    dispatch({ type: 'SET_FIELD', field: 'unitPrice', value: numericValue });
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    dispatch({ type: 'SET_FIELD', field: 'amount', value: numericValue });
  };

  const handleMemoChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'memo', value });
  };

  const handleTotalDistanceChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    dispatch({ type: 'SET_FIELD', field: 'odometer', value: numericValue });
  };

  const handleDateChange = (day: { dateString: string }) => {
    if (day.dateString) {
      const dateString = formatDate(new Date(day.dateString), 'yyyy-MM-dd', {
        locale: ko,
      });
      dispatch({ type: 'SET_FIELD', field: 'date', value: dateString });
      dateModal.close();
    }
  };

  // 값 표시 함수들 (0일 때 빈 문자열)
  const displayValue = (value: number) => (value === 0 ? '' : value.toString());
  const displayCurrency = (value: number) =>
    value === 0 ? '' : value.toLocaleString();

  const markedDates: MarkedDates = useMemo(() => {
    const selectedColor = calendarTheme.selectedColor;
    const marked = {
      [format(new Date(energyRecord.date), 'yyyy-MM-dd')]: {
        selected: true,
        selectedColor,
      },
    };

    return marked;
  }, [energyRecord.date]);

  return (
    <>
      <Box className="flex-1 relative">
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 56 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box className="px-4 py-6">
            <FormControl className="flex-1">
              <FormCard>
                <FormLabel name="주행 정보" />
                <FormField
                  type="number"
                  label="총 주행거리 (km)"
                  value={displayValue(energyRecord.odometer)}
                  onChangeText={handleTotalDistanceChange}
                  placeholder="예: 100"
                  keyboardType="numeric"
                />
              </FormCard>

              {/* 에너지 정보 카드 - 동적 */}
              <FormCard>
                <FormLabel
                  name={`${config.icon} ${config.energyType} 정보`}
                  size="lg"
                />

                <Box>
                  <FormLabel name="날짜" size="sm" />
                  <Button
                    onPress={dateModal.open}
                    className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-primary-500 active:bg-white transition-all w-full justify-start"
                  >
                    <ButtonText className="font-medium text-gray-900">
                      {formatDateForDisplay(new Date(energyRecord.date)) ||
                        '날짜를 선택해주세요'}
                    </ButtonText>
                  </Button>

                  <DateSelectModal
                    isOpen={dateModal.isOpen}
                    onClose={dateModal.close}
                    currentDate={new Date(energyRecord.date)}
                    onDayPress={handleDateChange}
                    markedDates={markedDates}
                  />
                </Box>

                <FormField
                  type="number"
                  label="총 비용"
                  value={displayCurrency(energyRecord.totalCost)}
                  onChangeText={handleTotalCostChange}
                  placeholder="예: 50,000"
                  keyboardType="numeric"
                  onBlur={calculateAmount}
                />

                <FormField
                  type="number"
                  label={`단가 (${config.unitPrice})`}
                  value={displayCurrency(energyRecord.unitPrice)}
                  onChangeText={handleUnitPriceChange}
                  placeholder={config.unitPricePlaceholder}
                  keyboardType="numeric"
                  onBlur={() => {
                    // 단가 변경 시 총 비용이 있으면 주유/충전량 계산, 주유/충전량이 있으면 총 비용 계산
                    if (energyRecord.totalCost > 0) {
                      calculateAmount();
                    } else if (energyRecord.amount > 0) {
                      calculateTotalCost();
                    }
                  }}
                />

                <FormField
                  type="number"
                  label={`${config.energyType}량 (${config.unit})`}
                  value={displayValue(energyRecord.amount)}
                  onChangeText={handleAmountChange}
                  placeholder={config.amountPlaceholder}
                  keyboardType="numeric"
                  onBlur={calculateTotalCost}
                />

                <Box>
                  <FormLabel name={config.station} size="sm" />
                  <Button
                    onPress={stationModal.open}
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start px-3"
                  >
                    <ButtonText className="text-lg font-medium text-gray-700">
                      {selectedStation?.name || config.stationPlaceholder}
                    </ButtonText>
                  </Button>
                  <StationPickerModal
                    isOpen={stationModal.isOpen}
                    onClose={stationModal.close}
                    onSelectStation={(station) => {
                      dispatch({
                        type: 'BULK_UPDATE',
                        payload: {
                          stationId: station.id,
                          stationName: station.name,
                        },
                      });
                      stationModal.close();
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
                    onPress={paymentModal.open}
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start text-gray-700"
                  >
                    <ButtonText>
                      {energyRecord.paymentName || '결제 수단 선택'}
                    </ButtonText>
                  </Button>

                  <PaymentMethodModal
                    isOpen={paymentModal.isOpen}
                    onClose={paymentModal.close}
                    onSelectPaymentMethod={(paymentMethod) => {
                      dispatch({
                        type: 'BULK_UPDATE',
                        payload: {
                          paymentMethodId: paymentMethod.id,
                          paymentName: paymentMethod.name,
                          paymentType: paymentMethod.type,
                        },
                      });
                      paymentModal.close();
                    }}
                  />
                </Box>
              </FormCard>

              {/* 메모 카드 - 공통 */}
              <FormCard>
                <FormLabel name="메모" />
                <FormField
                  type="textarea"
                  value={energyRecord.memo || ''}
                  onChangeText={handleMemoChange}
                  placeholder="특이사항이나 기억하고 싶은 내용을 적어보세요 (선택사항)"
                  numberOfLines={4}
                  multiline={true}
                />
              </FormCard>
            </FormControl>
          </Box>
        </ScrollView>
        {/* 하단 고정 저장 버튼 영역 - 동적 */}
        <FloatingSubmitButton
          onSubmit={() => onSubmit(energyRecord)}
          buttonIcon={isEV ? '🔋' : '⛽'}
          buttonText={isEV ? '충전 기록 저장' : '주유 기록 저장'}
        />
      </Box>
    </>
  );
}

// 타입 export (다른 파일에서 사용할 수 있도록)
export type { EnergyRecordFormData, EnergyRecordFormProps };

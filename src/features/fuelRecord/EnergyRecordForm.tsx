import { Box } from '@shared/components/ui/box';
import { Text } from '@shared/components/ui/text';
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from '@shared/components/ui/form-control';
import { Input, InputField } from '@shared/components/ui/input';
import { Button, ButtonText } from '@shared/components/ui/button';
import { Textarea, TextareaInput } from '@shared/components/ui/textarea';
import { useMemo, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { formatDate } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@shared/components/ui/modal';
import { Divider } from '@shared/components/ui/divider';
import { useStations, useCreateStation } from '@features/station';
import PaymentMethod from '@shared/models/PaymentMethod';

import { PaymentMethodForm } from './PaymentMethodForm';
import { PaymentMethodList } from './PaymentMethodList';
import {
  usePaymentMethods,
  useCreatePaymentMethod,
} from '@features/paymentMethods';

interface EnergyRecordFormData {
  date: string; // YYYY-MM-DD 형식
  totalCost: number;
  unitPrice: number;
  amount: number;
  paymentMethodId: string;
  paymentName: string;
  paymentType: string;
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
  const [newPaymentMethod, setNewPaymentMethod] = useState<{
    name: PaymentMethod['name'];
    type: Exclude<PaymentMethod['type'], 'cash'>;
  }>({
    name: '',
    type: 'credit',
  });
  const [newStationName, setNewStationName] = useState('');

  // 새로운 TanStack Query 방식 사용
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: stations = [], refetch } = useStations();
  const createPaymentMethod = useCreatePaymentMethod();
  const createStation = useCreateStation();

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
      stations: isEV
        ? [
            { key: '테슬라 수퍼차저', label: '테슬라 수퍼차저' },
            { key: 'SK 일렉링크', label: 'SK 일렉링크' },
            { key: '현대 E-pit', label: '현대 E-pit' },
            { key: 'GS칼텍스 충전소', label: 'GS칼텍스 충전소' },
            { key: '환경부 급속충전소', label: '환경부 급속충전소' },
          ]
        : [
            { key: '수원셀프고속주유소', label: '수원셀프고속주유소' },
            { key: '오산셀프고속주유소', label: '오산셀프고속주유소' },
            { key: 'SK에너지', label: 'SK에너지' },
            { key: 'GS칼텍스', label: 'GS칼텍스' },
            { key: 'S-OIL', label: 'S-OIL' },
          ],
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

  const handlePaymentTypeChange = (value: string) => {
    onEnergyRecordChange({
      ...energyRecord,
      paymentType: value as 'card' | 'cash' | 'giftcard',
    });
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

  // 날짜 표시 함수
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

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

  const handleAddStation = async () => {
    if (newStationName) {
      await createStation.mutateAsync({
        name: newStationName,
        type: vehicleType === 'EV' ? 'ev' : 'gas',
      });
      await refetch();
      setNewStationName('');
    }
  };

  return (
    <FormControl className="flex-1">
      {/* 에너지 정보 카드 - 동적 */}
      <Box className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <FormControlLabel className="mb-2">
          <FormControlLabelText>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              {config.icon} {config.energyType} 정보
            </Text>
          </FormControlLabelText>
        </FormControlLabel>

        <Box className="space-y-4">
          <Box>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>
                <Text className="text-sm font-medium text-gray-700">
                  📅 날짜
                </Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Button
              onPress={() => setShowDatePicker(true)}
              className="rounded-xl border-2 border-gray-200 bg-gray-50 active:border-blue-500 active:bg-white transition-all w-full justify-start"
            >
              <ButtonText className="font-medium text-gray-900">
                {formatDateForDisplay(energyRecord.date) ||
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
                  monthFormat="yyyy년 MM월"
                  initialDate={energyRecord.date}
                  onDayPress={(day) => {
                    handleDateChange(day.dateString);
                  }}
                  enableSwipeMonths={true}
                  markedDates={{
                    [energyRecord.date]: {
                      selected: true,
                      selectedColor: '#222222',
                    },
                  }}
                />
              </ModalContent>
            </Modal>
          </Box>

          <Box>
            <FormControlLabel className="mb-2">
              <FormControlLabelText>
                <Text className="text-sm font-medium text-gray-700">
                  총 비용
                </Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white transition-all">
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
            <FormControlLabel className="mb-2">
              <FormControlLabelText>
                <Text className="text-sm font-medium text-gray-700">
                  단가 ({config.unitPrice})
                </Text>
              </FormControlLabelText>
            </FormControlLabel>
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
            <FormControlLabel className="mb-2">
              <FormControlLabelText>
                <Text className="text-sm font-medium text-gray-700">
                  {config.energyType}량 ({config.unit})
                </Text>
              </FormControlLabelText>
            </FormControlLabel>
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
            <FormControlLabel className="mb-2">
              <FormControlLabelText>
                <Text className="text-sm font-medium text-gray-700">
                  {config.station}
                </Text>
              </FormControlLabelText>
            </FormControlLabel>
            <Button
              onPress={() => setShowStationPicker(true)}
              className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start px-3"
            >
              <ButtonText className="text-lg font-medium text-gray-700">
                {selectedStation?.name || config.stationPlaceholder}
              </ButtonText>
            </Button>
            <Modal
              isOpen={showStationPicker}
              onClose={() => setShowStationPicker(false)}
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader>
                  <Text className="text-lg font-semibold text-gray-900">
                    {config.station} 선택
                  </Text>
                </ModalHeader>

                <Box className="h-80 py-2 bg-white">
                  <FlatList
                    data={stations}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <Box className="flex flex-col gap-0.5">
                        <Button
                          className="bg-white justify-start rounded-xl w-full focus:border-primary-500 focus:bg-white transition-all"
                          onPress={() => {
                            onEnergyRecordChange({
                              ...energyRecord,
                              stationId: item.id,
                              stationName: item.name,
                            });
                            setShowStationPicker(false);
                          }}
                        >
                          <ButtonText className="text-lg font-medium text-gray-700">
                            {item.name}
                          </ButtonText>
                        </Button>
                        {index !== config.stations.length - 1 && (
                          <Divider className="my-2" orientation="horizontal" />
                        )}
                      </Box>
                    )}
                  />
                </Box>
                <Input className="rounded-xl border-2 border-gray-200 bg-gray-50 focus:border-primary-500 focus:bg-white transition-all">
                  <InputField
                    placeholder={`새로운 ${config.station} 이름`}
                    value={newStationName}
                    onChangeText={(text) => {
                      setNewStationName(text);
                    }}
                  />
                </Input>
                <Button onPress={handleAddStation}>
                  <ButtonText>새로운 {config.station} 추가</ButtonText>
                </Button>
              </ModalContent>
            </Modal>
          </Box>
        </Box>
      </Box>

      {/* 결제 정보 카드 */}
      <Box className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <FormControlLabel className="mb-2">
          <FormControlLabelText>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              💳 결제 정보
            </Text>
          </FormControlLabelText>
        </FormControlLabel>

        <Box>
          <FormControlLabel className="mb-2">
            <FormControlLabelText>
              <Text className="text-sm font-medium text-gray-700">
                결제 방법
              </Text>
            </FormControlLabelText>
          </FormControlLabel>
          <Button
            variant="outline"
            onPress={() => setShowPaymentTypePicker(true)}
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 justify-start text-gray-700"
          >
            <ButtonText>
              {energyRecord.paymentName || '결제 수단 선택'}
            </ButtonText>
          </Button>

          <Modal
            isOpen={showPaymentTypePicker}
            onClose={() => setShowPaymentTypePicker(false)}
          >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader>
                <Text className="text-lg font-semibold text-gray-900">
                  결제 수단 선택
                </Text>
              </ModalHeader>

              <Box className="h-80 py-2 bg-white">
                <PaymentMethodList
                  paymentMethods={paymentMethods}
                  onClickPaymentMethodItem={(method) => {
                    onEnergyRecordChange({
                      ...energyRecord,
                      paymentType: method.type,
                      paymentMethodId: method.id,
                      paymentName: method.name,
                    });
                    setShowPaymentTypePicker(false);
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
      </Box>

      {/* 메모 카드 - 공통 */}
      <Box className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 h-fit">
        <FormControlLabel className="mb-2">
          <FormControlLabelText>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              📝 메모
            </Text>
          </FormControlLabelText>
        </FormControlLabel>

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
      </Box>
    </FormControl>
  );
}

// 타입 export (다른 파일에서 사용할 수 있도록)
export type { EnergyRecordFormData, EnergyRecordFormProps };

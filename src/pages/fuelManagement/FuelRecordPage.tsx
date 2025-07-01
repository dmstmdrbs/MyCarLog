import PageLayout from '@shared/components/layout/PageLayout';
import { Text } from '@shared/components/ui/text';
import useFuelRecord from '@features/fuelRecord/hooks/useFuelRecord';
import useVehicle from '@features/vehicle/hooks/useVehicle';
import { useState } from 'react';
import { Button, ButtonText } from '@shared/components/ui/button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FuelStackParamList } from './navigator';
import { Box } from '@shared/components/ui/box';
import { ScrollView } from 'react-native';
import { EnergyRecordForm } from '@/features/fuelRecord';
import type { EnergyRecordFormData } from '@/features/fuelRecord';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<FuelStackParamList, 'FuelRecord'>;

export function FuelRecordPage({ route }: Props) {
  const { vehicleId } = route.params;
  const navigation = useNavigation();
  const { vehicle } = useVehicle(vehicleId);

  const [energyRecord, setEnergyRecord] = useState<EnergyRecordFormData>({
    date: new Date().toISOString().split('T')[0], // 오늘 날짜를 YYYY-MM-DD 형식으로
    totalCost: 0,
    unitPrice: 0,
    amount: 0,
    paymentMethodId: '',
    paymentName: '',
    paymentType: 'credit',
    stationId: '',
    stationName: '',
    memo: '',
  });

  const { addFuelRecord } = useFuelRecord({ vehicleId });

  const handleAddFuelRecord = async () => {
    console.log('energyRecord', energyRecord);
    try {
      await addFuelRecord({
        date: new Date(energyRecord.date).getTime(), // 선택된 날짜를 timestamp로 변환
        totalCost: energyRecord.totalCost,
        unitPrice: energyRecord.unitPrice,
        amount: energyRecord.amount,
        paymentMethodId: energyRecord.paymentMethodId,
        paymentName: energyRecord.paymentName,
        paymentType: energyRecord.paymentType,
        stationId: energyRecord.stationId,
        stationName: energyRecord.stationName,
        memo: energyRecord.memo,
      });
      navigation.goBack();
    } catch (error) {
      console.error(error);
    }
  };

  // 차량 정보가 로딩 중일 때
  if (!vehicle) {
    return (
      <PageLayout>
        <Box className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            차량 정보를 불러오는 중...
          </Text>
        </Box>
      </PageLayout>
    );
  }

  // 차량 타입별 헤더 텍스트
  const isEV = vehicle.type === 'EV';
  const headerText = isEV ? '충전 기록' : '주유 기록';
  const subHeaderText = isEV
    ? '새로운 충전 내역을 기록해보세요'
    : '새로운 주유 내역을 기록해보세요';
  const buttonText = isEV ? '충전 기록 저장' : '주유 기록 저장';
  const buttonIcon = isEV ? '🔋' : '💾';

  return (
    <PageLayout>
      <Box className="flex-1 pb-8">
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Box className="px-4 py-6">
            {/* 헤더 섹션 - 동적 */}
            <Box className="mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                {headerText}
              </Text>
              <Text className="text-sm text-gray-600">{subHeaderText}</Text>
            </Box>

            {/* 메인 입력 폼 */}
            <EnergyRecordForm
              vehicleType={vehicle.type}
              energyRecord={energyRecord}
              onEnergyRecordChange={setEnergyRecord}
            />
          </Box>
        </ScrollView>

        {/* 하단 고정 저장 버튼 영역 - 동적 */}
        <Box className="absolute bottom-0 left-0 right-0 border-gray-100 shadow-xs">
          <Box className="px-4 pt-4 pb-5">
            <Button
              onPress={handleAddFuelRecord}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl active:shadow-lg active:scale-95 transform transition-all duration-150"
            >
              <Box className="flex-row items-center justify-center space-x-2">
                <Text className="text-2xl">{buttonIcon}</Text>
                <ButtonText className="text-white font-bold text-lg ml-2">
                  {buttonText}
                </ButtonText>
              </Box>
            </Button>

            {/* 안전 영역을 위한 추가 여백 */}
            <Box className="h-2" />
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
}

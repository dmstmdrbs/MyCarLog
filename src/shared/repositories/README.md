# Repository 패턴 가이드

이 프로젝트에서는 데이터 액세스 레이어를 Repository 패턴으로 구현했습니다.

## 🎯 목적

- **데이터 액세스 로직 중앙화**: 모든 데이터베이스 접근 로직을 한 곳에서 관리
- **비즈니스 로직과 분리**: UI 컴포넌트에서 데이터베이스 로직 제거
- **테스트 가능성 향상**: Mock Repository 주입으로 쉬운 테스트
- **일관된 인터페이스**: 모든 모델에 대해 표준화된 CRUD 인터페이스

## 📁 구조

```
src/shared/repositories/
├── BaseRepository.ts          # 기본 Repository 클래스
├── VehicleRepository.ts       # 차량 데이터 액세스
├── FuelRecordRepository.ts    # 연료 기록 데이터 액세스
├── PaymentMethodRepository.ts # 결제 수단 데이터 액세스
├── StationRepository.ts       # 주유소 데이터 액세스
├── index.ts                   # 내보내기 인덱스
└── README.md                  # 이 파일
```

## 🚀 사용법

### 1. 기본 사용법

```typescript
import { vehicleRepository } from '@shared/repositories';

// 차량 생성
const newVehicle = await vehicleRepository.createVehicle({
  type: 'ICE',
  nickname: '내 차',
  manufacturer: '현대',
  model: '아반떼',
  isDefault: true,
});

// 모든 차량 조회
const vehicles = await vehicleRepository.findAll();

// 기본 차량 조회
const defaultVehicle = await vehicleRepository.findDefaultVehicle();
```

### 2. Hook과 함께 사용

```typescript
// src/features/vehicle/hooks/useVehicleRepository.ts
import { useVehicleRepository } from '@features/vehicle/hooks/useVehicleRepository';

const MyComponent = () => {
  const { findAll, createVehicle, isLoading, error } = useVehicleRepository();
  
  const handleCreateVehicle = async () => {
    try {
      await createVehicle({
        type: 'EV',
        nickname: '전기차',
        manufacturer: '테슬라',
        model: 'Model 3',
      });
    } catch (error) {
      console.error('차량 생성 실패:', error);
    }
  };

  return (
    <div>
      {isLoading && <span>로딩 중...</span>}
      {error && <span>오류: {error}</span>}
      <button onClick={handleCreateVehicle}>차량 추가</button>
    </div>
  );
};
```

### 3. React Query와 함께 사용 (권장)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleRepository } from '@shared/repositories';

// 조회
const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleRepository.findAll(),
    staleTime: 1000 * 60 * 5, // 5분
  });
};

// 변경
const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vehicleRepository.createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
```

## 🔄 기존 코드에서 마이그레이션

### Before (기존 방식)

```typescript
// src/features/fuelRecord/hooks/useFuelRecord.ts (기존)
const useFuelRecord = ({ vehicleId }: { vehicleId: string }) => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  const fetchFuelRecord = async () => {
    const fuelRecordsData = await database
      .get<FuelRecord>('fuel_records')
      .query(Q.where('vehicle_id', vehicleId))
      .fetch();
    setFuelRecords(fuelRecordsData ?? []);
  };

  const addFuelRecord = async (fuelRecord: SomeFuelRecordType) => {
    await database.write(async () => {
      await database.get<FuelRecord>('fuel_records').create((record) => {
        // 직접 데이터베이스 조작
      });
    });
    await fetchFuelRecord();
  };

  // ... 더 많은 직접 데이터베이스 조작 코드
};
```

### After (Repository 패턴)

```typescript
// src/features/fuelRecord/hooks/useFuelRecordRepository.ts (새로운 방식)
const useFuelRecordRepository = () => {
  const { findByVehicleId, createFuelRecord, isLoading, error } = useFuelRecordRepository();
  
  // Repository가 모든 데이터 액세스 로직을 처리
  // 컴포넌트는 비즈니스 로직에만 집중
};
```

## 📊 Repository별 주요 기능

### VehicleRepository
- `createVehicle()`: 차량 생성 (기본 차량 설정 자동 처리)
- `findDefaultVehicle()`: 기본 차량 조회
- `setAsDefault()`: 기본 차량 설정
- `getVehicleStats()`: 차량 통계 조회

### FuelRecordRepository
- `findByMonth()`: 월별 연료 기록 조회
- `getMonthlyStats()`: 월별 통계 계산
- `getRecentStations()`: 최근 사용 주유소 조회
- `getTotalCostByVehicle()`: 차량별 총 비용 계산

### PaymentMethodRepository
- `findByType()`: 결제 수단 타입별 조회
- `getPaymentMethodStats()`: 결제 수단 통계

### StationRepository
- `searchByName()`: 주유소 이름 검색
- `getRecentlyAddedStations()`: 최근 추가된 주유소 조회

## 🧪 테스트

Repository 패턴을 사용하면 쉽게 테스트할 수 있습니다:

```typescript
// Mock Repository 생성
const mockVehicleRepository = {
  findAll: jest.fn().mockResolvedValue([mockVehicle]),
  createVehicle: jest.fn().mockResolvedValue(mockVehicle),
  // ... 다른 메서드들
};

// 테스트에서 주입
test('차량 목록 조회', async () => {
  const { result } = renderHook(() => useVehicles(), {
    wrapper: ({ children }) => (
      <QueryClient>
        <RepositoryProvider repository={mockVehicleRepository}>
          {children}
        </RepositoryProvider>
      </QueryClient>
    ),
  });

  await waitFor(() => {
    expect(result.current.data).toEqual([mockVehicle]);
  });
});
```

## ⚡ 성능 최적화

1. **배치 처리**: 여러 작업을 하나의 트랜잭션으로 처리
2. **인덱스 활용**: WatermelonDB 쿼리 최적화
3. **캐싱**: React Query와 함께 사용하여 자동 캐싱
4. **Lazy Loading**: 필요할 때만 데이터 로드

## 🔮 향후 확장 계획

1. **Maintenance Repository**: 정비 기록 관리
2. **Analytics Repository**: 통계 및 분석 데이터
3. **Backup Repository**: 데이터 백업/복원 관리
4. **Sync Repository**: 클라우드 동기화 (선택적)

## 💡 Best Practices

1. **싱글톤 인스턴스 사용**: `repository` 인스턴스를 export하여 재사용
2. **에러 핸들링**: Repository에서 적절한 에러 메시지와 함께 throw
3. **타입 안전성**: TypeScript 인터페이스로 타입 안전성 보장
4. **일관된 네이밍**: 메서드명은 의도를 명확히 표현
5. **트랜잭션 사용**: 관련된 여러 작업은 하나의 트랜잭션으로 처리 
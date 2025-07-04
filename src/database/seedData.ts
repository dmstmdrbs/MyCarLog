import { CreatePaymentMethodData } from '@shared/models/PaymentMethod';
import {
  CreateMaintenanceItemData,
  maintenanceItemRepository,
  paymentMethodRepository,
} from '@/shared/repositories';

export const defaultMaintenanceItems: CreateMaintenanceItemData[] = [
  {
    name: '엔진오일 및 오일필터',
    maintenanceKm: 15_000,
    maintenanceMonth: 12,
  },
  { name: '에어컨 필터', maintenanceKm: 15_000 },
  { name: '에어컨 냉매', maintenanceMonth: 12 },
  { name: '점화플러그', maintenanceKm: 160_000 },
  { name: '와이퍼 블레이드', maintenanceKm: 8_000, maintenanceMonth: 12 },
  { name: '타이어', maintenanceKm: 60_000, maintenanceMonth: 36 },
  { name: '타이어 위치', maintenanceKm: 10_000, maintenanceMonth: 12 },
  { name: '브레이크 시스템', maintenanceKm: 20_000 },
  {
    name: '브레이크 패드 및 디스크',
    maintenanceKm: 10_000,
  },
  { name: '냉각수 보충', maintenanceKm: 200_000, maintenanceMonth: 120 },
  { name: '배터리', maintenanceKm: 60_000, maintenanceMonth: 36 },
] as const;

export const defaultPaymentMethods: CreatePaymentMethodData[] = [
  { name: '현금', type: 'cash' },
  { name: '카드', type: 'credit' },
  { name: '상품권', type: 'giftcard' },
  { name: '기타', type: 'etc' },
] as const;

export async function seedDefaultMaintenanceItems() {
  const existing = await maintenanceItemRepository.findAll();

  if (existing.length === 0) {
    await maintenanceItemRepository.bulkCreate(defaultMaintenanceItems);
  }
}

export async function seedDefaultPaymentMethods() {
  const existing = await paymentMethodRepository.findAll();

  if (existing.length === 0) {
    await paymentMethodRepository.bulkCreate(defaultPaymentMethods);
  }
}

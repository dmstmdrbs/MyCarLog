import { database } from '../database';
import MaintenanceItem from '@shared/models/MaintenanceItem';

export const defaultMaintenanceItems = [
  {
    name: '엔진오일 및 오일필터',
    maintenance_km: 15_000,
    maintenance_month: 12,
  },
  { name: '에어컨 필터', maintenance_km: 15_000 },
  { name: '에어컨 냉매', maintenance_month: 12 },
  { name: '점화플러그', maintenance_km: 160_000 },
  { name: '와이퍼 블레이드', maintenance_km: 8_000, maintenance_month: 12 },
  { name: '타이어', maintenance_km: 60_000, maintenance_month: 36 },
  { name: '타이어 위치', maintenance_km: 10_000, maintenance_month: 12 },
  { name: '브레이크 시스템', maintenance_km: 20_000 },
  {
    name: '브레이크 패드 및 디스크',
    maintenance_km: 10_000,
  },
  { name: '냉각수 보충', maintenance_km: 200_000, maintenance_month: 120 },
  { name: '배터리', maintenance_km: 60_000, maintenance_month: 36 },
];

export async function seedDefaultMaintenanceItems() {
  const collection = database.get<MaintenanceItem>('maintenance_items');
  const existing = await collection.query().fetch();

  if (existing.length === 0) {
    await database.write(async () => {
      for (const item of defaultMaintenanceItems) {
        await collection.create((record) => {
          record.name = item.name;

          if (item.maintenance_km) {
            record.maintenanceKm = item.maintenance_km;
          }
          if (item.maintenance_month) {
            record.maintenanceMonth = item.maintenance_month;
          }
          record.createdAt = Date.now();
        });
      }
    });
  }
}

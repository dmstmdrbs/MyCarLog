import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { appSchema, tableSchema } from '@nozbe/watermelondb/Schema';
import {
  schemaMigrations,
  createTable,
} from '@nozbe/watermelondb/Schema/migrations';

import Vehicle, { vehicleSchema } from '@shared/models/Vehicle';
import FuelRecord, { fuelRecordSchema } from '@shared/models/FuelRecord';
import MaintenanceRecord, {
  maintenanceRecordSchema,
} from '@shared/models/MaintenanceRecord';
import MaintenancePlan, {
  maintenancePlanSchema,
} from '@shared/models/MaintenancePlan';
import MaintenanceItem, {
  maintenanceItemSchema,
} from '@shared/models/MaintenanceItem';
import PaymentMethod, {
  paymentMethodSchema,
} from '@shared/models/PaymentMethod';
import Station, { stationSchema } from '@/shared/models/Station';
import Shop, { shopSchema } from '@/shared/models/Shop';

const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 4,
      steps: [
        createTable({
          name: 'stations',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'type', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        createTable({
          name: 'shops',
          columns: [
            { name: 'name', type: 'string' },
            { name: 'created_at', type: 'number' },
          ],
        }),
      ],
    },
  ],
});

const schema = appSchema({
  version: 5,
  tables: [
    tableSchema(vehicleSchema),
    tableSchema(fuelRecordSchema),
    tableSchema(maintenanceRecordSchema),
    tableSchema(maintenancePlanSchema),
    tableSchema(maintenanceItemSchema),
    tableSchema(paymentMethodSchema),
    tableSchema(stationSchema),
    tableSchema(shopSchema),
  ],
});

const adapter = new SQLiteAdapter({
  schema,
  migrations,
});

export const database = new Database({
  adapter,
  modelClasses: [
    Vehicle,
    FuelRecord,
    MaintenanceRecord,
    MaintenancePlan,
    MaintenanceItem,
    PaymentMethod,
    Station,
    Shop,
  ],
});

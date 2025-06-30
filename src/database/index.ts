import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { appSchema, tableSchema } from '@nozbe/watermelondb/Schema';

import Vehicle, { vehicleSchema } from '@shared/models/Vehicle';
import FuelRecord, { fuelRecordSchema } from '@shared/models/FuelRecord';
import MaintenanceRecord, {
  maintenanceRecordSchema,
} from '@shared/models/MaintenanceRecord';
import MaintenancePlan, {
  maintenancePlanSchema,
} from '@shared/models/MaintenancePlan';

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema(vehicleSchema),
    tableSchema(fuelRecordSchema),
    tableSchema(maintenanceRecordSchema),
    tableSchema(maintenancePlanSchema),
  ],
});

const adapter = new SQLiteAdapter({
  schema,
});

export const database = new Database({
  adapter,
  modelClasses: [Vehicle, FuelRecord, MaintenanceRecord, MaintenancePlan],
});

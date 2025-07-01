import { useEffect, useState } from 'react';
import { database } from '@/database';
import FuelRecord from '@shared/models/FuelRecord';
import { Q } from '@nozbe/watermelondb';

const useFuelRecord = ({ vehicleId }: { vehicleId: string }) => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  const fetchFuelRecord = async () => {
    const fuelRecordsData = await database
      .get<FuelRecord>('fuel_records')
      .query(Q.where('vehicle_id', vehicleId))
      .fetch();
    setFuelRecords(fuelRecordsData ?? []);
  };

  useEffect(() => {
    fetchFuelRecord();
  }, [vehicleId]);

  const addFuelRecord = async (
    fuelRecord: Pick<
      FuelRecord,
      | 'date'
      | 'totalCost'
      | 'unitPrice'
      | 'amount'
      | 'paymentMethodId'
      | 'paymentType'
      | 'paymentName'
      | 'stationId'
      | 'stationName'
      | 'memo'
    >,
  ) => {
    await database.write(async () => {
      await database.get<FuelRecord>('fuel_records').create((record) => {
        record.vehicleId = vehicleId;
        record.date = fuelRecord.date;
        record.totalCost = fuelRecord.totalCost;
        record.unitPrice = fuelRecord.unitPrice;
        record.amount = fuelRecord.amount;
        record.paymentMethodId = fuelRecord.paymentMethodId;
        record.stationId = fuelRecord.stationId;
        record.memo = fuelRecord.memo;
      });
    });
    await fetchFuelRecord();
  };

  const updateFuelRecord = async (fuelRecord: FuelRecord) => {
    await database.write(async () => {
      const record = await database
        .get<FuelRecord>('fuel_records')
        .find(fuelRecord.id);
      await record.update((r) => {
        r.vehicleId = vehicleId;
        r.date = fuelRecord.date;
        r.totalCost = fuelRecord.totalCost;
        r.unitPrice = fuelRecord.unitPrice;
        r.amount = fuelRecord.amount;
        r.paymentMethodId = fuelRecord.paymentMethodId;
        r.stationId = fuelRecord.stationId;
        r.memo = fuelRecord.memo;
      });
    });
    await fetchFuelRecord();
  };

  const deleteFuelRecord = async (fuelRecord: FuelRecord) => {
    await database.write(async () => {
      const record = await database
        .get<FuelRecord>('fuel_records')
        .find(fuelRecord.id);
      await record?.destroyPermanently();
    });
    await fetchFuelRecord();
  };

  return { fuelRecords, addFuelRecord, updateFuelRecord, deleteFuelRecord };
};

export default useFuelRecord;

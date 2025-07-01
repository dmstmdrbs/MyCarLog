import { database } from '@/database';
import Station from '@shared/models/Station';

export const useStationMutation = () => {
  const addStation = async (
    stationName: Station['name'],
    stationType: Station['type'],
  ) => {
    await database.write(async () => {
      await database.get<Station>('stations').create((record) => {
        record.name = stationName;
        record.type = stationType;
      });
    });
  };

  const updateStation = async (station: Station) => {
    await database.write(async () => {
      const record = await database.get<Station>('stations').find(station.id);
      await record.update((r) => {
        r.name = station.name;
        r.type = station.type;
      });
    });
  };

  const deleteStation = async (station: Station) => {
    await database.write(async () => {
      const record = await database.get<Station>('stations').find(station.id);
      await record?.destroyPermanently();
    });
  };

  return { addStation, updateStation, deleteStation };
};

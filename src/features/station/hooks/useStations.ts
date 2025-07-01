import { useEffect, useState } from 'react';
import { database } from '@/database';
import Station from '@shared/models/Station';

export const useStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const stationsData = await database
        .get<Station>('stations')
        .query()
        .fetch();
      setStations(stationsData ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const refetch = async () => {
    await fetchStations();
  };

  return { stations, isLoading, refetch };
};

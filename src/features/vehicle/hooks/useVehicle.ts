import { useEffect, useState } from 'react';
import { database } from '@/database';
import Vehicle from '@shared/models/Vehicle';

export const useVehicle = (id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const fetchVehicle = async () => {
    try {
      setIsLoading(true);
      const vehicle = await database.get<Vehicle>('vehicles').find(id);
      setVehicle(vehicle);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const refetch = async () => {
    await fetchVehicle();
  };

  return { vehicle, isLoading, refetch };
};

import { useEffect, useState } from 'react';
import { database } from '@/database';
import Vehicle from '@shared/models/Vehicle';

const useVehicles = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const vehicles = await database.get<Vehicle>('vehicles').query().fetch();
      setVehicles(vehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const refetch = async () => {
    await fetchVehicles();
  };

  return { vehicles, refetch, isLoading };
};

export default useVehicles;

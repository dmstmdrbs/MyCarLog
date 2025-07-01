import { useEffect, useState } from 'react';
import { database } from '@/database';
import Vehicle from '@shared/models/Vehicle';

const useVehicle = (id: string) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      const vehicle = await database.get<Vehicle>('vehicles').find(id);
      setVehicle(vehicle);
    };
    fetchVehicle();
  }, [id]);

  return { vehicle };
};

export default useVehicle;

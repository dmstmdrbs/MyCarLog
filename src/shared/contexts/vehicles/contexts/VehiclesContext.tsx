import { database } from '@/database';
import Vehicle from '@/shared/models/Vehicle';
import { createContext, useContext, useEffect, useState } from 'react';

interface VehiclesContextType {
  vehicles: Vehicle[];
  refetch: () => Promise<void>;
  isLoading: boolean;
}

const VehiclesContext = createContext<VehiclesContextType>({
  vehicles: [],
  isLoading: true,
  refetch: async () => {},
});

const useVehiclesData = () => {
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

export const VehiclesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { vehicles, refetch, isLoading } = useVehiclesData();

  return (
    <VehiclesContext.Provider value={{ vehicles, refetch, isLoading }}>
      {children}
    </VehiclesContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehiclesContext);
  if (!context) {
    throw new Error('useVehicles must be used within a VehiclesProvider');
  }
  return context;
};

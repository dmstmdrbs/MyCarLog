import React, { createContext, useContext, useEffect, useState } from 'react';
import Vehicle from '@shared/models/Vehicle';
import { useVehicles } from '../hooks/useVehicleQueries';

interface SelectedVehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle) => void;
}

const SelectedVehicleContext = createContext<
  SelectedVehicleContextType | undefined
>(undefined);

export const SelectedVehicleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: vehicles = [] } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vehicles.length > 0) {
      const defaultProfile =
        vehicles.find((v: Vehicle) => v.isDefault) || vehicles[0];

      setSelectedVehicle(defaultProfile);
    }
  }, [vehicles]);

  return (
    <SelectedVehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        setSelectedVehicle,
      }}
    >
      {children}
    </SelectedVehicleContext.Provider>
  );
};

export const useSelectedVehicle = () => {
  const ctx = useContext(SelectedVehicleContext);
  if (!ctx)
    throw new Error(
      'useSelectedVehicle must be used within SelectedVehicleProvider',
    );
  return ctx;
};

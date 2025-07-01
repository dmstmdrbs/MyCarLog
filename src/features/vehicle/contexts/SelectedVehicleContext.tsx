import React, { createContext, useContext, useEffect, useState } from 'react';
import Vehicle from '@shared/models/Vehicle';
import { useVehicles } from '@shared/contexts/vehicles';

interface SelectedVehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (id: string) => void;
}

const SelectedVehicleContext = createContext<
  SelectedVehicleContextType | undefined
>(undefined);

export const SelectedVehicleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // TODO: WatermelonDB 연동, 일단 mock 데이터
  const { vehicles, refetch } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (vehicles.length > 0) {
      const defaultProfile = vehicles.find((v) => v.isDefault) || vehicles[0];
      console.log(defaultProfile);
      setSelectedVehicle(defaultProfile);
    }
  }, [vehicles]);

  const addVehicle = async (vehicle: Vehicle) => {
    await refetch();
    setSelectedVehicle(vehicle);
  };
  const removeVehicle = async (id: string) => {
    await refetch();
    if (selectedVehicle?.id === id) setSelectedVehicle(null);
  };

  return (
    <SelectedVehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        setSelectedVehicle,
        addVehicle,
        removeVehicle,
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

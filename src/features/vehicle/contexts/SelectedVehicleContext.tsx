import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import Vehicle, { VehicleType } from '@shared/models/Vehicle';
import { useVehicles } from '../hooks/useVehicleQueries';
import { isEqual } from 'lodash';
interface SelectedVehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: VehicleType | null;
  setSelectedVehicle: Dispatch<SetStateAction<VehicleType | null>>;
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
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null,
  );

  const getDefaultVehicle = () => {
    if (vehicles.length === 0) return null;
    return vehicles.find((v: VehicleType) => v.isDefault) || vehicles[0];
  };

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(getDefaultVehicle());
    }
  }, [vehicles, selectedVehicle]);

  useEffect(() => {
    if (vehicles.length > 0 && selectedVehicle) {
      const updated = vehicles.find((v) => v.id === selectedVehicle.id);

      if (updated) {
        if (!isEqual(updated, selectedVehicle)) {
          setSelectedVehicle(updated);
        }
      } else setSelectedVehicle(getDefaultVehicle());
    }
  }, [vehicles, selectedVehicle]);

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

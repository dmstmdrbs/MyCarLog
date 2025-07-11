import { useVehicles } from './useVehicleQueries';
import { useSelectedVehicle } from '../contexts/SelectedVehicleContext';
import { useMemo } from 'react';

export function useVehicleProfileSelector() {
  const { data: vehicles = [] } = useVehicles();
  const { selectedVehicle, setSelectedVehicle } = useSelectedVehicle();

  const vehicleSet = useMemo(() => {
    return new Map(vehicles.map((v) => [v.id, v]));
  }, [vehicles]);

  const selectVehicle = (vehicleId: string) => {
    const vehicle = vehicleSet.get(vehicleId);
    if (vehicle) {
      console.log('vehicle', vehicle);
      setSelectedVehicle(vehicle);
    }
  };

  return {
    vehicles,
    selectedVehicle,
    selectVehicle,
  };
}

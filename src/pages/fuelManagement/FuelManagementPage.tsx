import { FuelManagement } from '@widgets/fuelManagement';
import PageLayout from '@shared/components/layout/PageLayout';

import { useSelectedVehicle } from '@features/vehicle/contexts/SelectedVehicleContext';

export const FuelManagementPage = () => {
  const { selectedVehicle } = useSelectedVehicle();

  return (
    <PageLayout>
      {selectedVehicle && <FuelManagement vehicleId={selectedVehicle.id} />}
    </PageLayout>
  );
};

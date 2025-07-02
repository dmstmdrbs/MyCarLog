import { FuelManagement } from '@widgets/fuelManagement';
import PageLayout from '@shared/components/layout/PageLayout';

import { useVehicle } from '@features/vehicle/hooks/useVehicleQueries';
import { useSelectedVehicle } from '@features/vehicle';
import { Box } from '@/shared/components/ui/box';
import { Spinner } from '@/shared/components/ui/spinner';

export const FuelManagementPage = () => {
  // 기본 차량이 있으면 그 차량, 없으면 첫 번째 차량, 둘 다 없으면 안내

  const { selectedVehicle } = useSelectedVehicle();
  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(
    selectedVehicle?.id || '',
  );

  if (vehicleLoading || !vehicle) {
    return (
      <PageLayout>
        <Box className="flex-1 justify-center items-center">
          <Spinner size="large" />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <FuelManagement vehicleId={vehicle.id} />
    </PageLayout>
  );
};

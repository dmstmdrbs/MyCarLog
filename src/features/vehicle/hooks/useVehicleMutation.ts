import { database } from '@/database';
import Vehicle from '@/shared/models/Vehicle';
import { useVehicles } from '@shared/contexts/vehicles';

interface VehicleUpdateData {
  id: string;
  nickname?: string;
  manufacturer?: string;
  model?: string;
  type?: 'ICE' | 'EV';
  isDefault?: boolean;
}

export const useVehicleMutation = () => {
  const { refetch } = useVehicles();

  const addVehicle = async (vehicle: Partial<Vehicle>) => {
    await database.write(async () => {
      await database.get<Vehicle>('vehicles').create((record) => {
        record.type = vehicle.type!;
        record.nickname = vehicle.nickname!;
        record.manufacturer = vehicle.manufacturer || '';
        record.model = vehicle.model || '';
        record.isDefault = vehicle.isDefault || false;
      });
    });
    return refetch();
  };

  const deleteVehicle = async (id: string) => {
    const collection = database.get<Vehicle>('vehicles');
    const vehicle = await collection.find(id);
    await database.write(async () => {
      await vehicle.markAsDeleted();
      await vehicle.destroyPermanently();
    });
    return refetch();
  };

  const updateVehicle = async (updateData: VehicleUpdateData) => {
    await database.write(async () => {
      const record = await database
        .get<Vehicle>('vehicles')
        .find(updateData.id);
      await record.update((record) => {
        if (updateData.type !== undefined) record.type = updateData.type;
        if (updateData.nickname !== undefined)
          record.nickname = updateData.nickname;
        if (updateData.manufacturer !== undefined)
          record.manufacturer = updateData.manufacturer;
        if (updateData.model !== undefined) record.model = updateData.model;
        if (updateData.isDefault !== undefined)
          record.isDefault = updateData.isDefault;
      });
    });
    return refetch();
  };

  return { addVehicle, deleteVehicle, updateVehicle };
};

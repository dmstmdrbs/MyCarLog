import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import Vehicle from '@shared/models/Vehicle';
import { VehicleCard } from './VehicleCard';
import { Box } from '@shared/components/ui/box';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
}

export const VehicleList = ({ vehicles, onEdit }: VehicleListProps) => {
  return (
    <FlatList
      data={vehicles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onEdit(item)} activeOpacity={0.8}>
          <Box className="flex flex-row justify-between items-center p-4 border-b border-gray-200">
            <VehicleCard vehicle={item} />
          </Box>
        </TouchableOpacity>
      )}
    />
  );
};

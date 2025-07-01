import { Divider } from '@shared/components/ui/divider';
import { Text } from '@shared/components/ui/text';
import Vehicle from '@shared/models/Vehicle';
import { Box } from '@shared/components/ui/box';

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const { nickname, model, manufacturer, type, isDefault } = vehicle;

  return (
    <Box className="flex flex-row justify-between p-2 h-full max-h-20 w-full">
      <Box className="flex flex-col gap-2">
        <Text className="text-lg font-bold text-gray-900">{nickname}</Text>
        <Box className=" text-gray-600 text-sm flex flex-row items-center gap-2">
          <Text className="font-semibold">{model}</Text>
          <Divider className="mx-1 h-4" orientation="vertical" />
          <Text>{manufacturer}</Text>
          <Divider className="mx-1 h-4" orientation="vertical" />
          <Text>{type === 'ICE' ? '내연기관' : '전기차'}</Text>
        </Box>
      </Box>
      <Box className="flex flex-row items-center h-6">
        {isDefault && (
          <Text className="text-primary-900 font-semibold">기본차량</Text>
        )}
      </Box>
    </Box>
  );
};

export default VehicleCard;

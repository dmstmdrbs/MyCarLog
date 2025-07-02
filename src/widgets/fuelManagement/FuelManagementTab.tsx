import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';

export const TabItem = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Button
      className={`flex-1 py-3 flex flex-row items-center gap-2 justify-center bg-white`}
      onPress={onPress}
    >
      {icon}
      <ButtonText className="text-gray-600 text-sm">{label}</ButtonText>
    </Button>
  );
};

export const Tab = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box className="w-full flex-row bg-white border-b border-gray-200">
      {children}
    </Box>
  );
};

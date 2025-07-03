import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

export const TabItem = ({
  isActive,
  label,
  icon,
  onPress,
}: {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Button
      className={cn(
        'flex-1 py-3 flex flex-row items-center gap-2 justify-center bg-white rounded-none',
        isActive ? 'bg-primary-500' : 'bg-white',
      )}
      onPress={onPress}
    >
      {icon}
      <ButtonText
        className={cn('text-sm', isActive ? 'text-white' : 'text-gray-600')}
      >
        {label}
      </ButtonText>
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

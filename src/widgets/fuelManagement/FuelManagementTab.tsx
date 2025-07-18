import { Box } from '@/shared/components/ui/box';
import { Button, ButtonText } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

export const TabItem = ({
  isActive,
  label,
  icon,
  onPress,
  className,
}: {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  className?: string;
}) => {
  return (
    <Button
      className={cn(
        'flex-1 flex flex-row items-center justify-center gap-2 rounded-none bg-white h-12',
        isActive ? 'bg-primary-500' : 'bg-white',
        className,
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
    <Box className="w-full flex-row border-b border-gray-200 bg-white">
      {children}
    </Box>
  );
};

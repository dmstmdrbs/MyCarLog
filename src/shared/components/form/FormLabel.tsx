import { Text } from '@/shared/components/ui/text';
import { FormControlLabel } from '../ui/form-control';
import { FormControlLabelText } from '../ui/form-control';
import { cn } from '@/shared/utils/cn';

export const FormLabel = ({
  name,
  size = 'lg',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}) => {
  const textVariant = {
    sm: 'text-sm font-medium text-gray-700',
    md: 'text-base font-medium text-gray-800',
    lg: 'text-lg font-semibold text-gray-900',
    xl: 'text-xl font-bold text-gray-900',
    '2xl': 'text-2xl font-bold text-gray-900',
  };

  return (
    <FormControlLabel className="mb-2">
      <FormControlLabelText>
        <Text className={cn(textVariant[size])}>{name}</Text>
      </FormControlLabelText>
    </FormControlLabel>
  );
};

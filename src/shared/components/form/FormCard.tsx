import { Box } from '@/shared/components/ui/box';

export const FormCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 gap-2 flex flex-col">
      {children}
    </Box>
  );
};

import { useNoProfileGuard } from '@/shared/components/layout/useNoProfileGuard';
import { Box } from '@shared/components/ui/box';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  useNoProfileGuard();
  return <Box className="bg-background-light relative flex-1">{children}</Box>;
};

export default PageLayout;

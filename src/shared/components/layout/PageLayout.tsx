import { Box } from '@shared/components/ui/box';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box className="flex-1">{children}</Box>;
};

export default PageLayout;

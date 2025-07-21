import { Box } from '@shared/components/ui/box';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box className="bg-background-light relative flex-1">{children}</Box>;
};

export default PageLayout;

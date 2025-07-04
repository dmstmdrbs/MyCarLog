import { Box } from '../ui/box';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return <Box className="flex-1 bg-background-light">{children}</Box>;
};

export default PageLayout;

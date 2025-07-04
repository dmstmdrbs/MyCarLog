import { SafeAreaView } from 'react-native-safe-area-context';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {children}
    </SafeAreaView>
  );
};

export default PageLayout;

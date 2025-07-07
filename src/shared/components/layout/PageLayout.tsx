import { SafeAreaView } from 'react-native-safe-area-context';

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className="bg-background-light relative flex-1">
      {children}
    </SafeAreaView>
  );
};

export default PageLayout;

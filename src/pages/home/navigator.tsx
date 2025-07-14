import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomePage } from './HomePage';

export type HomeStackParamList = {
  HomeMain: { vehicleId: string };
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeMain"
        component={HomePage}
        options={{ title: '홈' }}
      />
    </HomeStack.Navigator>
  );
}

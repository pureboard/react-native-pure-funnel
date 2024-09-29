import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationFunnel } from './NavigationFunnel';

const Stack = createNativeStackNavigator();

export const FunnelNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={'funnel'} component={NavigationFunnel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

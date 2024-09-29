import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationFunnel } from './NavigationFunnel';
import { V2Funnel } from './V2Funnel';

const Stack = createNativeStackNavigator();

export const FunnelNavigator = ({ type }: { type: 'navigation' | 'v2' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={type}>
        <Stack.Screen name={'navigation'} component={NavigationFunnel} />
        <Stack.Screen name={'v2'} component={V2Funnel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

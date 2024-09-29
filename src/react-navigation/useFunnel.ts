import { useCoreFunnel } from '../core/hooks/useCoreFunnel';
import type { ArrayElement } from '../core/types/ArrayElement';
import type { NonEmptyArray } from '../core/types/NonEmptyArray';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export const useFunnel = <Steps extends NonEmptyArray<string>>(
  steps: Steps,
  options?: {
    initialStep?: ArrayElement<Steps>;
    gestureEnabled?: boolean;
    goBackAction?: () => void;
  }
) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  return useCoreFunnel(steps, options, navigation, isFocused);
};

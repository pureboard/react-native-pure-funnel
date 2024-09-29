import { useEffect } from 'react';
import { BackHandler, type NativeEventSubscription } from 'react-native';

interface BackHandlerHookParams {
  onPressBackButton: () => boolean;
  isFocused?: boolean;
}

export const useBackHandler = ({
  onPressBackButton,
  isFocused = true,
}: BackHandlerHookParams) => {
  useEffect(() => {
    let backHandler: NativeEventSubscription | null = null;
    if (isFocused) {
      backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onPressBackButton();
        return true;
      });
    } else {
      backHandler = null;
    }
    return backHandler?.remove;
  }, [onPressBackButton, isFocused]);
};

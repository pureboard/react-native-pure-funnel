import { useLayoutEffect, useState } from 'react';
import {
  Animated,
  Keyboard,
  useAnimatedValue,
  useWindowDimensions,
} from 'react-native';
import type { NonEmptyArray } from '../types/NonEmptyArray';
import type { ArrayElement } from '../types/ArrayElement';
import { isIOS } from '../utils/platform';
import { useBackHandler } from './utils/useBackHandler';
import { HeaderBackButton } from '../components/HeaderBackButton';

interface FunnelNavigationOptions {
  animated?: boolean;
}

export const funnelSlideAnimationDuration = 250;

export const useCoreFunnel = <Steps extends NonEmptyArray<string>>(
  steps: Steps,
  options?: {
    initialStep?: ArrayElement<Steps>;
    gestureEnabled?: boolean;
    goBackAction?: () => void;
  },
  navigation?: any,
  isFocused?: boolean
) => {
  type Step = ArrayElement<Steps>;

  const { width: screenWidth } = useWindowDimensions();

  const slideAnimation = useAnimatedValue(0);

  const firstStepItem = steps[0] as Step;

  const initialStack = [options?.initialStep || firstStepItem];

  const [funnelStack, setFunnelStack] = useState(initialStack);
  const currentStep = funnelStack.at(-1) || firstStepItem;

  const slideInAnimation = Animated.timing(slideAnimation, {
    toValue: 0,
    duration: funnelSlideAnimationDuration,
    useNativeDriver: true,
  });

  const slideOutAnimation = Animated.timing(slideAnimation, {
    toValue: screenWidth,
    duration: funnelSlideAnimationDuration,
    useNativeDriver: true,
  });

  const startSlideInAnimation = () => {
    // 화면 stack 전환과 애니메이션을 동시에 호출하면 특정 케이스에서 애니메이션이 동작하지 않는 이슈 대응을 위해 setTimeout으로 우선순위 낮춤
    setTimeout(() => {
      slideAnimation.setValue(screenWidth);
      slideInAnimation.start();
    }, 0);
  };

  const popStack = () =>
    setFunnelStack((prev) => {
      if (prev.length < 2) {
        return prev;
      }
      const newArray = [...prev];
      newArray.pop();
      return newArray;
    });

  const pushStack = (step: Step) => setFunnelStack((prev) => [...prev, step]);

  const goBack = (navigateOptions?: FunnelNavigationOptions) => {
    if (funnelStack.length < 2) {
      return options?.goBackAction
        ? options.goBackAction()
        : navigation
          ? navigation.goBack()
          : null;
    }

    if (navigateOptions?.animated ?? true) {
      return slideOutAnimation.start(() => {
        slideAnimation.setValue(0);
        popStack();
      });
    }

    Keyboard.dismiss();
    popStack();
  };

  const moveStep = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    Keyboard.dismiss();
    pushStack(step);

    if (navigateOptions?.animated ?? true) {
      startSlideInAnimation();
    }
  };

  const goForward = (navigateOptions?: FunnelNavigationOptions) => {
    const currentIndex = steps.findIndex((step) => step === currentStep) || 0;
    const nextIndex = Math.min(steps.length - 1, currentIndex + 1);
    const nextIndexStep = steps[nextIndex] as Step;

    moveStep(nextIndexStep, navigateOptions);
  };

  const reset = (stack?: Step[], navigateOptions?: FunnelNavigationOptions) => {
    Keyboard.dismiss();
    setFunnelStack(stack || initialStack);

    if (navigateOptions?.animated ?? true) {
      startSlideInAnimation();
    }
  };

  const navigate = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    if (currentStep === step) {
      return;
    }
    if (funnelStack.at(-2) === step) {
      return goBack(navigateOptions);
    }
    moveStep(step, navigateOptions);
  };

  const replace = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    popStack();
    moveStep(step, navigateOptions);
  };

  useBackHandler({ onPressBackButton: goBack, isFocused });

  useLayoutEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerLeft: () =>
          funnelStack.length > 1 ||
          navigation.canGoBack() ||
          options?.goBackAction ? (
            <HeaderBackButton onPress={goBack} />
          ) : null,
        gestureEnabled: isIOS && funnelStack.length <= 1,
      });
    }
  }, [currentStep, navigation]);

  return [
    funnelStack,
    {
      goBack,
      goForward,
      reset,
      navigate,
      replace,
    },
    {
      slideAnimation,
      slideInAnimation,
      slideOutAnimation,
    },
  ] as const;
};

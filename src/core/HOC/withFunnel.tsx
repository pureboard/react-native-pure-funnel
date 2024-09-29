import React, {
  type ComponentType,
  forwardRef,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import type { NonEmptyArray } from '../types/NonEmptyArray';
import type { ArrayElement } from '../types/ArrayElement';
import {
  Animated,
  Keyboard,
  useAnimatedValue,
  useWindowDimensions,
} from 'react-native';
import { useBackHandler } from '../hooks/utils/useBackHandler';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { usePreservedCallback } from '../hooks/utils/usePreservedCallback';

export const funnelSlideAnimationDuration = 250;

interface FunnelNavigationOptions {
  animated?: boolean;
}

interface FunnelOptions<Step> {
  initialStep?: Step | Step[];
  goBackAction?: () => void;
}

interface FunnelContext<Steps extends NonEmptyArray<string>> {
  initFunnel: (steps: Steps, options?: FunnelOptions<Steps>) => void;
  transitionInterface?: {
    slideAnimation: Animated.Value;
    slideInAnimation: Animated.CompositeAnimation;
    slideOutAnimation: Animated.CompositeAnimation;
  };
  funnelSteps: Steps | null;
  funnelStack: ArrayElement<Steps>[] | null;
  funnelOptions?: FunnelOptions<Steps>;
  funnelNavigation: {
    setOptions: (
      options: Partial<
        FunnelOptions<
          ArrayElement<Steps> extends string ? ArrayElement<Steps> : any
        >
      >
    ) => void;
    goBack: (navigateOptions?: FunnelNavigationOptions) => void;
    goForward: (navigateOptions?: FunnelNavigationOptions) => void;
    reset: (
      stack?: (ArrayElement<Steps> extends string
        ? ArrayElement<Steps>
        : any)[],
      navigateOptions?: FunnelNavigationOptions
    ) => void;
    navigate: (
      step: ArrayElement<Steps> extends string ? ArrayElement<Steps> : any,
      navigateOptions?: FunnelNavigationOptions
    ) => void;
    replace: (
      step: ArrayElement<Steps> extends string ? ArrayElement<Steps> : any,
      navigateOptions?: FunnelNavigationOptions
    ) => void;
  };
}

const FunnelContext = React.createContext<FunnelContext<any> | null>(null);
export const useFunnelContext = <Steps extends NonEmptyArray<string>>() => {
  return useContext(FunnelContext) as FunnelContext<Steps>;
};

const FunnelProvider = <Steps extends NonEmptyArray<string>>({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  type Step = ArrayElement<Steps>;

  const [funnelSteps, setFunnelSteps] = useState<Steps | null>(null);
  const [_funnelStack, setFunnelStack] = useState<Step[] | null>(null);
  const [funnelOptions, setFunnelOptions] = useState<FunnelOptions<Step>>({});

  const firstStepItem = funnelSteps ? (funnelSteps[0] as Step) : null;
  const initialStack = Array.isArray(funnelOptions.initialStep)
    ? funnelOptions.initialStep
    : funnelOptions.initialStep
      ? [funnelOptions.initialStep]
      : firstStepItem
        ? [firstStepItem]
        : null;

  const funnelStack = _funnelStack || initialStack;

  const initFunnel = (
    steps: Steps,
    options?: {
      initialStep?: Step | Step[];
      goBackAction?: () => void;
    }
  ) => {
    setFunnelOptions(options || {});
    setFunnelSteps(steps);
  };

  const currentStep =
    funnelStack?.at(-1) || (funnelSteps ? funnelSteps[0] : null);

  const slideAnimation = useAnimatedValue(0);

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

  const popStack = () => {
    setFunnelStack((_prev) => {
      const prev = _prev === null ? initialStack : _prev;
      if (!prev) {
        return prev;
      }
      if (prev.length < 2) {
        return prev;
      }
      const newArray = [...prev];
      newArray.pop();
      return newArray;
    });
  };

  const pushStack = (step: Step) => {
    setFunnelStack((_prev) => {
      const prev = _prev === null ? initialStack : _prev;
      return prev ? [...prev, step] : prev;
    });
  };

  const goBack = usePreservedCallback(
    (navigateOptions?: FunnelNavigationOptions) => {
      if (!funnelStack) {
        return false;
      }
      if (funnelStack.length < 2) {
        if (funnelOptions.goBackAction) {
          funnelOptions.goBackAction();
          return true;
        } else {
          return false;
        }
      }

      if (navigateOptions?.animated ?? true) {
        slideOutAnimation.start(() => {
          slideAnimation.setValue(0);
          popStack();
        });
        return true;
      }

      Keyboard.dismiss();
      popStack();
      return true;
    }
  );

  const moveStep = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    Keyboard.dismiss();
    pushStack(step);

    if (navigateOptions?.animated ?? true) {
      startSlideInAnimation();
    }
  };

  const goForward = (navigateOptions?: FunnelNavigationOptions) => {
    if (!funnelSteps) {
      return;
    }
    const currentIndex =
      funnelSteps.findIndex((step) => step === currentStep) || 0;
    const nextIndex = Math.min(funnelSteps.length - 1, currentIndex + 1);
    const nextIndexStep = funnelSteps[nextIndex] as Step;

    moveStep(nextIndexStep, navigateOptions);
  };

  const reset = (stack?: Step[], navigateOptions?: FunnelNavigationOptions) => {
    if (!initialStack) {
      return;
    }
    Keyboard.dismiss();
    setFunnelStack(stack || initialStack);

    if (navigateOptions?.animated ?? true) {
      startSlideInAnimation();
    }
  };

  const navigate = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    if (!funnelStack) {
      return;
    }
    if (currentStep === step) {
      return;
    }
    if (funnelStack.at(-2) === step) {
      goBack(navigateOptions);
      return;
    }

    moveStep(step, navigateOptions);
  };

  const replace = (step: Step, navigateOptions?: FunnelNavigationOptions) => {
    popStack();
    moveStep(step, navigateOptions);
  };

  const setOptions = (options: Partial<FunnelOptions<Step>>) => {
    setFunnelOptions((prev) => ({ ...prev, options }));
  };

  const funnelNavigation = {
    setOptions,
    goBack,
    goForward,
    reset,
    navigate,
    replace,
  };

  const transitionInterface = {
    slideAnimation,
    slideInAnimation,
    slideOutAnimation,
  };

  const contextValue = {
    funnelSteps,
    funnelStack,
    initFunnel,
    funnelNavigation,
    transitionInterface,
    funnelOptions,
  };

  useBackHandler({ onPressBackButton: goBack, isFocused });

  useLayoutEffect(() => {
    if (funnelStack) {
      navigation.setOptions({
        headerLeft: () =>
          funnelStack.length > 1 || funnelOptions?.goBackAction ? (
            <HeaderBackButton onPress={funnelNavigation.goBack} />
          ) : null,
      });
    }
  }, [funnelStack?.length, navigation]);

  return (
    <FunnelContext.Provider value={contextValue}>
      {children}
    </FunnelContext.Provider>
  );
};

export const withFunnel = <Steps extends NonEmptyArray<string>, P>(
  Component: ComponentType<P>
) => {
  return forwardRef<any, P>(function (props, ref) {
    return (
      <FunnelProvider<Steps>>
        <Component ref={ref} {...(props as P)} />
      </FunnelProvider>
    );
  });
};

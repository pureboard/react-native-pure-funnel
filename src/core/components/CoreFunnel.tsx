import {
  Children,
  isValidElement,
  type ReactElement,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';

import { SwipeDetector } from './SwipeDetector';
import type { NonEmptyArray } from '../types/NonEmptyArray';
import type { ArrayElement } from '../types/ArrayElement';
import { FunnelStepProvider } from './FunnelStepProvider';
import { isIOS } from '../utils/platform';
import type { StepProps } from './FunnelStep';

export interface FunnelProps<Steps extends NonEmptyArray<string>> {
  stack: ArrayElement<Steps>[];
  gestureEnabled?: boolean; // only iOS. default is true
  goBack: (navigateOptions?: { animated?: boolean }) => void;
  children:
    | Array<ReactElement<StepProps<Steps>>>
    | ReactElement<StepProps<Steps>>;
  transitionInterface?: {
    slideAnimation: Animated.Value;
    slideInAnimation: Animated.CompositeAnimation;
    slideOutAnimation: Animated.CompositeAnimation;
  };
  headerHeight?: number;
}

export const CoreFunnel = <Steps extends NonEmptyArray<string>>({
  stack,
  children,
  goBack,
  gestureEnabled: _gestureEnabled = true,
  transitionInterface,
  headerHeight = 0,
}: FunnelProps<Steps>) => {
  const validChildren = Children.toArray(children).filter(
    isValidElement
  ) as Array<ReactElement<StepProps<Steps>>>;

  const gestureEnabled = isIOS && _gestureEnabled && stack.length > 1;

  const onSwipeEnd = (isSwiped: boolean) => {
    if (!isSwiped) {
      return transitionInterface?.slideInAnimation?.start?.();
    }

    const transitionEnabled = !!transitionInterface;

    goBack({ animated: transitionEnabled });
  };

  const [isVisibleCurrentStep, setIsVisibleCurrentStep] = useState(true);
  const isVisibleCurrentStepRef = useRef<boolean>(true);
  const [_, forceRender] = useReducer((prev) => prev + 1, 0);

  const prevStack = useRef(stack);

  // 화면 stack 전환과 애니메이션을 동시에 호출하면 특정 케이스에서 애니메이션이 동작하지 않는 이슈 대응을 위해 slide in animation setTimeout으로 우선순위 낮추는 작업을 진행함.
  // setTimeout을 적용하면서 깜빡임이 감지되는 문제를 해결하기 위해 slideIn animation이 적용될 때 current step을 잠시 동안 보이지 않게 처리
  if (JSON.stringify(prevStack.current) !== JSON.stringify(stack)) {
    const isPop = prevStack.current.length > stack.length;
    prevStack.current = stack;

    if (!isPop) {
      setIsVisibleCurrentStep(false);
      isVisibleCurrentStepRef.current = false;
      setTimeout(() => {
        setIsVisibleCurrentStep(true);
        isVisibleCurrentStepRef.current = true;
        forceRender();
      }, 0);
    }
  }
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const contentViewHeight = screenHeight - headerHeight;

  const prevFunnelSlideAnimation =
    transitionInterface?.slideAnimation?.interpolate({
      inputRange: [0, screenWidth],
      outputRange: [-100, screenWidth * 0.25 - 100],
    });

  return (
    <SwipeDetector
      onSwipeEnd={onSwipeEnd}
      disabled={!gestureEnabled}
      onSwipe={({ deltaPageX }) =>
        transitionInterface?.slideAnimation?.setValue?.(deltaPageX)
      }
      style={styles.container}
    >
      {stack.map((step, index) => {
        const targetStep = validChildren.find(
          (child) => child.props.name === step
        );
        const isLastStackItem = index === stack.length - 1;
        const isPrevStackItem = index === stack.length - 2;

        const translateX =
          (isLastStackItem && transitionInterface?.slideAnimation) ||
          (isPrevStackItem && prevFunnelSlideAnimation) ||
          0;

        const isVisible =
          !isLastStackItem ||
          (isVisibleCurrentStep && isVisibleCurrentStepRef.current);

        return (
          <FunnelStepProvider focused={isLastStackItem} key={`${index}${step}`}>
            <Animated.View
              style={[
                styles.funnelContainer,
                isVisible ? styles.visible : styles.invisible,
                {
                  width: screenWidth,
                  height: contentViewHeight,
                  transform: [
                    {
                      translateX,
                    },
                  ],
                },
              ]}
            >
              {targetStep}
            </Animated.View>
          </FunnelStepProvider>
        );
      })}
    </SwipeDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  funnelContainer: {
    backgroundColor: 'white',
    position: 'absolute',
  },
  visible: {
    display: 'flex',
  },
  invisible: {
    display: 'none',
  },
});

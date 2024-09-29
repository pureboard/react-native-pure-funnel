import {
  Children,
  isValidElement,
  type ReactElement,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';

import type { NonEmptyArray } from '../types/NonEmptyArray';

import type { StepProps } from '../components/FunnelStep';
import { SwipeDetector } from '../components/SwipeDetector';
import { FunnelStepProvider } from '../components/FunnelStepProvider';
import { useFunnelContext } from './withFunnel';

export interface FunnelProps<Steps extends NonEmptyArray<string>> {
  gestureEnabled?: boolean; // only iOS. default is true

  children:
    | Array<ReactElement<StepProps<Steps>>>
    | ReactElement<StepProps<Steps>>;
  headerHeight?: number;
}

export const CoreFunnel = <Steps extends NonEmptyArray<string>>({
  children,
  gestureEnabled: _gestureEnabled = true,
  headerHeight = 0,
}: FunnelProps<Steps>) => {
  const validChildren = Children.toArray(children).filter(
    isValidElement
  ) as Array<ReactElement<StepProps<Steps>>>;

  const { funnelOptions, transitionInterface, funnelStack, funnelNavigation } =
    useFunnelContext<Steps>();

  const onSwipeEnd = (isSwiped: boolean) => {
    if (!isSwiped) {
      return transitionInterface?.slideInAnimation?.start?.();
    }

    const transitionEnabled = !!transitionInterface;

    funnelNavigation.goBack({ animated: transitionEnabled });
  };

  const [isVisibleCurrentStep, setIsVisibleCurrentStep] = useState(true);
  const isVisibleCurrentStepRef = useRef<boolean>(true);
  const [_, forceRender] = useReducer((prev) => prev + 1, 0);

  const prevStack = useRef<typeof funnelStack>(null);

  // 화면 stack 전환과 애니메이션을 동시에 호출하면 특정 케이스에서 애니메이션이 동작하지 않는 이슈 대응을 위해 slide in animation setTimeout으로 우선순위 낮추는 작업을 진행함.
  // setTimeout을 적용하면서 깜빡임이 감지되는 문제를 해결하기 위해 slideIn animation이 적용될 때 current step을 잠시 동안 보이지 않게 처리
  if (
    prevStack.current &&
    funnelStack &&
    JSON.stringify(prevStack.current) !== JSON.stringify(funnelStack)
  ) {
    const isPop = prevStack.current.length > funnelStack.length;
    prevStack.current = funnelStack;

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

  useEffect(() => {
    if (funnelStack !== null) {
      prevStack.current = funnelStack;
    }
  }, [funnelStack === null]);

  // initiation 이전까지 화면에 노출하지 않음.
  if (!funnelStack) {
    return null;
  }

  return (
    <SwipeDetector
      onSwipeEnd={onSwipeEnd}
      disabled={!funnelOptions?.gestureEnabled}
      onSwipe={({ deltaPageX }) =>
        transitionInterface?.slideAnimation?.setValue?.(deltaPageX)
      }
      style={styles.container}
    >
      {funnelStack?.map((step, index) => {
        const targetStep = validChildren.find(
          (child) => child.props.name === step
        );
        const isLastStackItem = index === funnelStack?.length - 1;
        const isPrevStackItem = index === funnelStack?.length - 2;

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

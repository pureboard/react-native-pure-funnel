import { Children, isValidElement, type ReactElement } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';

import type { NonEmptyArray } from '../types/NonEmptyArray';

import type { StepProps } from './FunnelStep';
import { SwipeDetector } from './SwipeDetector';
import { FunnelStepProvider } from './FunnelStepProvider';
import { useFunnel } from '../HOC/withFunnel';
import { isIOS } from '../utils/platform';

export interface FunnelProps<Steps extends NonEmptyArray<string>> {
  /**
   * only iOS. Whether it's possible to trigger funnel back navigation using swipe.
   * @default true
   */
  gestureEnabled?: boolean; // only iOS. default is true
  children:
    | Array<ReactElement<StepProps<Steps>>>
    | ReactElement<StepProps<Steps>>;
}

export const Funnel = <Steps extends NonEmptyArray<string>>({
  children,
  gestureEnabled: _gestureEnabled = true,
}: FunnelProps<Steps>) => {
  const validChildren = Children.toArray(children).filter(
    isValidElement
  ) as Array<ReactElement<StepProps<Steps>>>;

  const { transitionInterface, funnelStack, funnelNavigation } =
    useFunnel<Steps>();

  const gestureEnabled =
    isIOS && _gestureEnabled && (funnelStack ? funnelStack.length > 1 : true);

  const onSwipeEnd = (isSwiped: boolean) => {
    if (!isSwiped) {
      return transitionInterface?.slideInAnimation?.start?.();
    }

    const transitionEnabled = !!transitionInterface;

    funnelNavigation.goBack({ animated: transitionEnabled });
  };

  const { width: screenWidth } = useWindowDimensions();

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

        return (
          <FunnelStepProvider focused={isLastStackItem} key={`${index}${step}`}>
            <Animated.View
              style={[
                styles.funnelContainer,
                {
                  width: screenWidth,
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
    height: '100%',
  },
  visible: {
    display: 'flex',
  },
  invisible: {
    display: 'none',
  },
});

import { useRef } from 'react';
import {
  type StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

interface SwiperDetectorProps extends ViewProps {
  onSwipe?: (params: { pageX: number; deltaPageX: number }) => void;
  onSwipeEnd?: (isSwiped: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const minBoundary = 100;
const maxBoundary = 240;

const widthBoundaryRatio = 0.32; // standard boundary 120 / display width: 375

export const SwipeDetector = ({
  children,
  onSwipeEnd,
  onSwipe,
  disabled,
  style,
  ...rest
}: SwiperDetectorProps) => {
  const startingPosition = useRef<number | null>(null);

  const { width: screenWidth } = useWindowDimensions();

  const swipeBoundaryWidth = Math.min(
    Math.max(screenWidth * widthBoundaryRatio, minBoundary),
    maxBoundary
  );
  const touchBoundaryWidth = swipeBoundaryWidth / 2;

  return (
    <View
      onTouchStart={(e) => {
        if (disabled) {
          return;
        }

        const pageX = e.nativeEvent.pageX;
        if (pageX > touchBoundaryWidth) {
          return;
        }
        startingPosition.current = pageX;
      }}
      onTouchEnd={(e) => {
        if (!startingPosition.current) {
          return;
        }
        const pageX = e.nativeEvent.pageX;

        const isSwiped = Boolean(
          pageX - startingPosition.current > swipeBoundaryWidth
        );

        onSwipeEnd?.(isSwiped);

        startingPosition.current = null;
      }}
      onTouchMove={(e) => {
        if (!startingPosition.current) {
          return;
        }

        const pageX = e.nativeEvent.pageX;
        const deltaPageX = pageX - startingPosition.current;
        onSwipe?.({ pageX, deltaPageX });
      }}
      style={[styles.flex, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

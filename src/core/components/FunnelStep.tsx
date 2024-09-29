import type { NonEmptyArray } from '../types/NonEmptyArray';
import { type ReactElement, useEffect } from 'react';
import { useIsFunnelFocused } from './FunnelStepProvider';
import { useIsFirstRender } from '../hooks/utils/useIsFirstRender';

export interface StepProps<Steps extends NonEmptyArray<string>> {
  name: Steps[number];
  children: ReactElement;
  onMount?: () => void;
  onFocused?: () => void;
}

export const FunnelStep = <Steps extends NonEmptyArray<string>>({
  children,
  onMount,
  onFocused,
}: StepProps<Steps>) => {
  const isFocused = useIsFunnelFocused();
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (isFirstRender) {
      onMount?.();
    }
    if (isFocused) {
      onFocused?.();
    }
  }, [isFocused]);

  return children;
};

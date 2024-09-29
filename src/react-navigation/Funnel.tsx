import { useHeaderHeight } from '@react-navigation/elements';
import { CoreFunnel } from 'react-native-pure-funnel';
import type { NonEmptyArray } from '../core/types/NonEmptyArray';
import type { FunnelProps } from '../core/components/CoreFunnel';

export const Funnel = <Steps extends NonEmptyArray<string>>({
  headerHeight,
  children,
  ...props
}: FunnelProps<Steps>) => {
  const _headerHeight = useHeaderHeight();
  return (
    <CoreFunnel {...props} headerHeight={headerHeight || _headerHeight}>
      {children}
    </CoreFunnel>
  );
};

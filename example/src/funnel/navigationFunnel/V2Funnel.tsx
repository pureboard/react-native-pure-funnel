import { FunnelStep, FunnelV2, withFunnel } from 'react-native-pure-funnel';
import { FunnelContent } from '../../components/FunnelContent';
import { useFunnelContext } from '../../../../src/core/v2/withFunnel';
import { useEffect } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';

const steps = ['A', 'B', 'C'] as const;

export const V2Funnel = withFunnel(() => {
  const navigation = useNavigation();
  const { initFunnel, funnelNavigation } = useFunnelContext<typeof steps>();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    initFunnel(steps, {
      gestureEnabled: true,
      goBackAction: navigation.goBack,
    });
  }, []);

  return (
    <FunnelV2<typeof steps> headerHeight={headerHeight}>
      <FunnelStep name={'A'} onFocused={() => console.log('A')}>
        <FunnelContent
          backgroundColor={'red'}
          name={'A'}
          prev={''}
          next={'B'}
          goToNext={() => funnelNavigation.navigate('B')}
        />
      </FunnelStep>
      <FunnelStep name={'B'} onFocused={() => console.log('B')}>
        <FunnelContent
          backgroundColor={'blue'}
          name={'B'}
          prev={'A'}
          next={'C'}
          goToNext={() => funnelNavigation.navigate('C')}
        />
      </FunnelStep>
      <FunnelStep name={'C'} onFocused={() => console.log('C')}>
        <FunnelContent
          backgroundColor={'green'}
          name={'C'}
          prev={'B'}
          next={'A'}
          goToNext={() => funnelNavigation.navigate('A')}
        />
      </FunnelStep>
    </FunnelV2>
  );
});

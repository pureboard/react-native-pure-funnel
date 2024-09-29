import {
  CoreFunnel,
  FunnelStep,
  useCoreFunnel,
} from 'react-native-pure-funnel';
import { FunnelContent } from '../components/FunnelContent';

const steps = ['A', 'B', 'C'] as const;

export const PureFunnel = () => {
  const [funnelStack, { navigate, goBack }, transitionInterface] =
    useCoreFunnel(steps);

  return (
    <CoreFunnel<typeof steps>
      stack={funnelStack}
      goBack={goBack}
      transitionInterface={transitionInterface}
      gestureEnabled
    >
      <FunnelStep name={'A'} onFocused={() => console.log('A')}>
        <FunnelContent
          backgroundColor={'red'}
          name={'A'}
          prev={''}
          next={'B'}
          goToNext={() => navigate('B')}
        />
      </FunnelStep>
      <FunnelStep name={'B'} onFocused={() => console.log('B')}>
        <FunnelContent
          backgroundColor={'blue'}
          name={'B'}
          prev={'A'}
          next={'C'}
          goToNext={() => navigate('C')}
        />
      </FunnelStep>
      <FunnelStep name={'C'} onFocused={() => console.log('C')}>
        <FunnelContent
          backgroundColor={'green'}
          name={'C'}
          prev={'B'}
          next={'A'}
          goToNext={() => navigate('A')}
        />
      </FunnelStep>
    </CoreFunnel>
  );
};

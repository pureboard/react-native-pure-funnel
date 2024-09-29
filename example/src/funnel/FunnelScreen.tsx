import {
  Funnel,
  FunnelStep,
  withFunnel,
} from '@pureboard/react-native-pure-funnel';
import { FunnelContent } from '../components/FunnelContent';
import { useFunnel } from '../../../src/core/HOC/withFunnel';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { HeaderBackButton, useHeaderHeight } from '@react-navigation/elements';
import { usePreservedCallback } from '../hooks/usePreservedCallback';
import { useBackHandler } from '../hooks/useBackHandler';

const steps = ['A', 'B', 'C'] as const;

export const FunnelScreen = withFunnel(() => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { funnelNavigation } = useFunnel<typeof steps>(steps, {
    goBackAction: navigation.goBack,
  });
  const headerHeight = useHeaderHeight();

  const goBackFunnel = usePreservedCallback(() => {
    funnelNavigation.goBack();
    return true;
  });
  useBackHandler({ onPressBackButton: goBackFunnel, isFocused });
  useFocusEffect(
    usePreservedCallback(() => {
      navigation.setOptions({
        headerLeft: () => <HeaderBackButton onPress={goBackFunnel} />,
      });
    })
  );

  return (
    <Funnel<typeof steps> extraHeight={headerHeight}>
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
    </Funnel>
  );
});

# react-native-pure-funnel

easy handling funnel in react native.

This library was inspired by Toss's useFunnel and is designed for use in React Native.

ref. [toss slash useFunnel](https://www.slash.page/ko/libraries/react/use-funnel/README.i18n), [useFunnel youtube](https://www.youtube.com/watch?v=NwLWX2RNVcw)

## Installation

```sh
npm install @pureboard/react-native-pure-funnel
yarn add @pureboard/react-native-pure-funnel
```

## Usage

how to use `react-native-pure-funnel`
1. Wrap the component where you want to apply the funnel with the `withFunnel` HOC.
2. Place `FunnelStep` components within the `Funnel` component to set up the desired funnel.
3. Import the `useFunnel` hook and call initFunnel.
4. You can handle funnel transitions using `funnelNavigation`.
5. Configure the Android back button and the react-navigation header appropriately (using funnelNavigation.goBack).
6. Each funnel step has the default dimensions of the `viewport’s screenWidth and screenHeight`. If you're using react-navigation's stack navigator, pass the `headerHeight` to the Funnel as `extraHeight` prop.
7. For more details, refer to the usage code below or the example app in the repository.

```js
import {
  Funnel,
  FunnelStep,
  withFunnel,
  useFunnel
} from '@pureboard/react-native-pure-funnel';
import {
  useNavigation,
} from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';

const steps = ['A', 'B', 'C'] as const;

// you must wrap your component with `withFunnel` HOC
export const FunnelScreen = withFunnel(() => {
  const navigation = useNavigation();
  const headerHeight = useHeaderHeight();

  const { initFunnel, funnelNavigation } = useFunnel<typeof steps>();
  
  useEffect(() => {
    initFunnel(steps, {
      goBackAction: navigation.goBack,
    });
  }, []);

  return (
    <Funnel<typeof steps> extraHeight={headerHeight}>
      <FunnelStep name={'A'}>
        {/* A funnel content*/}
        <View>
           <Button label={'go to B funnel} onPress={()=>funnelNavigation.goForward()}/>
        </View>
      </FunnelStep>
      <FunnelStep name={'B'}>
        {/* B funnel content*/}
      </FunnelStep>
      <FunnelStep name={'C'}>
        {/* C funnel content*/}
      </FunnelStep>
    </Funnel>
  );
});
```


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PureFunnel } from './funnel/PureFunnel';
import { useState } from 'react';
import { FunnelNavigator } from './funnel/navigationFunnel/FunnelNavigator';

export default function App() {
  const [funnelType, setFunnelType] = useState<'pure' | 'navigation' | 'v2'>(
    'pure'
  );
  const counterFunnelType =
    funnelType === 'pure'
      ? 'navigation'
      : funnelType === 'navigation'
        ? 'v2'
        : 'pure';
  const switchFunnelType = () => {
    setFunnelType(counterFunnelType);
  };

  return (
    <View style={styles.container}>
      {funnelType === 'pure' ? (
        <PureFunnel />
      ) : (
        <FunnelNavigator type={funnelType} key={funnelType} />
      )}
      <TouchableOpacity style={styles.switch} onPress={switchFunnelType}>
        <Text>Switch to {counterFunnelType} funnel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switch: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    borderRadius: 30,
    padding: 12,
    backgroundColor: 'white',
  },
});

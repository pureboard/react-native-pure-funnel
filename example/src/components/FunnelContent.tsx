import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IProps {
  backgroundColor: string;
  name: string;
  prev: string;
  next: string;
  goToNext: () => void;
}

export const FunnelContent = ({
  backgroundColor,
  name,
  next,
  goToNext,
}: IProps) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>here is {name}</Text>
      <TouchableOpacity onPress={goToNext}>
        <Text style={styles.text}>go to {next}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 50,
    color: 'white',
  },
});

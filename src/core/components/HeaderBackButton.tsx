import {
  I18nManager,
  Image,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

interface IProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const HeaderBackButton = ({ onPress, style, imageStyle }: IProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <Image
        style={[styles.icon, imageStyle]}
        source={require('../assets/back-icon.png')}
        fadeDuration={0}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    height: 24,
    width: 24,
    margin: 3,
    resizeMode: 'contain',
    transform: [{ scaleX: I18nManager.getConstants().isRTL ? -1 : 1 }],
  },
});

import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../../themes';

export default function Card({ children, style, onPress }) {
  return (
    <Animated.View style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
}); 
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../themes';

export default function Button({ title, onPress, variant = 'primary', style }) {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variant === 'secondary' && styles.buttonSecondary,
        style
      ]} 
      onPress={onPress}
    >
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.buttonTextSecondary
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.buttonPrimary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.buttonPrimary,
  },
  buttonText: {
    color: theme.colors.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: theme.colors.buttonPrimary,
  },
}); 
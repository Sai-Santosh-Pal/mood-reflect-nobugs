import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../../themes';

export default function AuthButton({ title, onPress, loading = false, style }) {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      disabled={loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary, // #949aff
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.buttonText, // White text for contrast
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
  },
}); 
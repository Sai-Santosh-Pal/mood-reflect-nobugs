import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../themes';

export default function AuthInput({ placeholder, value, onChangeText, secureTextEntry = false, icon, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={focused ? theme.colors.primary : theme.colors.inactive}
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.inactive}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={secureTextEntry ? 'none' : props.autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.inputFocusedBackground,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    height: '100%',
  },
});

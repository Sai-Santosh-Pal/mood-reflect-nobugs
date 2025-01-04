import { TextInput, StyleSheet } from 'react-native';

export default function AuthInput({ placeholder, value, onChangeText, secureTextEntry = false, ...props }) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={secureTextEntry ? 'none' : props.autoCapitalize}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#FEBE",
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    paddingHorizontal: 10,
  },
}); 
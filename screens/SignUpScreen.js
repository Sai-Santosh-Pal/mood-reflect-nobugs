import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import { theme } from '../themes';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={styles.signUpButtonText}>{loading ? 'Please wait...' : 'Create Account'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.colors.card, // Use theme card color
  },
  secondaryButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary, // Use theme primary color
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: theme.colors.primary, // Use theme primary color
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    letterSpacing: 0.2,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: theme.colors.primary, // Use theme primary color
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.6,
  },
  signUpButtonText: {
    color: theme.colors.buttonText, // Use theme button text color (white)
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
  },
}); 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoadingLocal(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        await setToken(data.token);
        setUser(data.user);
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Make sure the backend is running.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
        />
      </View>

      <Text style={styles.label}>Select Role</Text>
      <View style={styles.roleContainer}>
        {['EMPLOYEE', 'TECHNICIAN', 'ADMIN'].map(r => (
          <TouchableOpacity 
            key={r} 
            style={[styles.roleBtn, role === r && styles.roleBtnActive]}
            onPress={() => setRole(r)}
          >
            <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={isLoadingLocal}
      >
        {isLoadingLocal ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#111827' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: '#374151', marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 15, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#2563eb', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#2563eb', textAlign: 'center', marginTop: 20, fontSize: 14 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginHorizontal: 2, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleBtnText: { color: '#374151', fontSize: 12, fontWeight: 'bold' },
  roleBtnTextActive: { color: '#fff' }
});

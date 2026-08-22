import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN'>('EMPLOYEE');
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
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>resolve<Text style={{color: '#2563eb'}}>X</Text></Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.card}>
            {/* Role Selection */}
            <Text style={styles.label}>Select Role</Text>
            <View style={styles.tabContainer}>
              {(['EMPLOYEE', 'TECHNICIAN', 'ADMIN'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.tabBtn, role === r && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabBtnText, role === r && styles.tabBtnTextActive]}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoadingLocal && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={isLoadingLocal}
            >
              {isLoadingLocal ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 36, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8, fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24, marginTop: 8 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabBtnText: { fontSize: 13, fontWeight: 'bold', color: '#64748b' },
  tabBtnTextActive: { color: '#1d4ed8' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#0f172a' },
  button: { backgroundColor: '#1d4ed8', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkContainer: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#64748b', fontSize: 14 },
  linkTextBold: { color: '#1d4ed8', fontWeight: 'bold' }
});

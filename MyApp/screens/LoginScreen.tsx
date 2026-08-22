import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const PREFILLS = {
  EMPLOYEE: { email: 'pranavshende97@gmail.com', password: 'Password@123' },
  TECHNICIAN: { email: 'hannaturkey15@gmail.com', password: 'Password@123' },
  ADMIN: { email: 'mayankgotmare0915@gmail.com', password: 'Password@123' },
};

export default function LoginScreen({ navigation }: any) {
  const [activeRole, setActiveRole] = useState<'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN'>('EMPLOYEE');
  const [email, setEmail] = useState(PREFILLS.EMPLOYEE.email);
  const [password, setPassword] = useState(PREFILLS.EMPLOYEE.password);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleRoleSelect = (role: 'EMPLOYEE' | 'TECHNICIAN' | 'ADMIN') => {
    setActiveRole(role);
    setEmail(PREFILLS[role].email);
    setPassword(PREFILLS[role].password);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setIsLoadingLocal(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        await setToken(data.token);
        setUser(data.user);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error. Make sure the backend is running.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.header}>
          <Text style={styles.title}>resolve<Text style={{color: '#2563eb'}}>X</Text></Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.card}>
          {/* Role Tabs */}
          <View style={styles.tabContainer}>
            {(['EMPLOYEE', 'TECHNICIAN', 'ADMIN'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => handleRoleSelect(role)}
                style={[styles.tabBtn, activeRole === role && styles.tabBtnActive]}
              >
                <Text style={[styles.tabBtnText, activeRole === role && styles.tabBtnTextActive]}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
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

          <TouchableOpacity 
            style={[styles.button, isLoadingLocal && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoadingLocal}
          >
            {isLoadingLocal ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 36, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8, fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 24 },
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

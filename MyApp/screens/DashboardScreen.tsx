import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.name}>{user?.name || user?.email}</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{user?.name || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoValue}>{user?.role}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9fafb', justifyContent: 'center' },
  welcome: { fontSize: 20, color: '#6b7280', textAlign: 'center' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoLabel: { fontSize: 15, color: '#6b7280' },
  infoValue: { fontSize: 15, fontWeight: '500', color: '#111827' },
  logoutButton: { backgroundColor: '#ef4444', padding: 15, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

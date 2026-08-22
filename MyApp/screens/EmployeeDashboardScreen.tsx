import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import SlaTimer from '../components/SlaTimer';
import RequestTimelineModal from '../components/RequestTimelineModal';

export default function EmployeeDashboardScreen() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/requests/my');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/resolve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/accept`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRequest = async () => {
    // For MVP, just creating a dummy request from mobile. 
    // In a full app, this would navigate to a separate form screen.
    try {
      const res = await apiFetch('/requests', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Issue reported from Mobile',
          description: 'Description of the issue from mobile app',
          category: 'OTHER',
          priority: 'MEDIUM',
        })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Maintenance request raised successfully');
        fetchRequests();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to create request');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hi, {user?.name}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}><Text style={styles.statValue}>{requests.length}</Text><Text>Total</Text></View>
        <View style={styles.statBox}><Text style={styles.statValue}>{requests.filter(r => r.status === 'PENDING').length}</Text><Text>Pending</Text></View>
        <View style={styles.statBox}><Text style={styles.statValue}>{requests.filter(r => r.status === 'ESCALATED').length}</Text><Text>Escalated</Text></View>
      </View>

      {user?.role === 'EMPLOYEE' && (
        <TouchableOpacity onPress={handleCreateRequest} style={styles.createButton}>
          <Text style={styles.createButtonText}>Raise Quick Request</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED'].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.filterBtn, filter === status && styles.filterBtnActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterBtnText, filter === status && styles.filterBtnTextActive]}>
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.sectionTitle}>{user?.role === 'TECHNICIAN' ? 'My Assigned Tickets' : 'My Requests'}</Text>
      
      <RequestTimelineModal 
        visible={!!viewingRequestId} 
        requestId={viewingRequestId || ''} 
        onClose={() => setViewingRequestId(null)} 
      />

      <FlatList
        data={filter === 'ALL' ? requests : requests.filter(r => r.status === filter)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestTitle}>{item.title}</Text>
              <Text style={styles.requestStatus}>Status: {item.status}</Text>
              <Text style={styles.requestDate}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <SlaTimer createdAt={item.createdAt} status={item.status} acceptedAt={item.acceptedAt} />
              <TouchableOpacity onPress={() => setViewingRequestId(item.id)} style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View Details</Text>
              </TouchableOpacity>
              {user?.role === 'TECHNICIAN' && item.status === 'PENDING' && (
                <TouchableOpacity onPress={() => handleAccept(item.id)} style={styles.acceptButton}>
                  <Text style={styles.acceptButtonText}>Accept Request</Text>
                </TouchableOpacity>
              )}
              {user?.role === 'TECHNICIAN' && item.status === 'IN_PROGRESS' && (
                <TouchableOpacity onPress={() => handleResolve(item.id)} style={styles.resolveButton}>
                  <Text style={styles.resolveButtonText}>Mark Resolved</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: { padding: 8, backgroundColor: '#ef4444', borderRadius: 4 },
  logoutText: { color: '#fff' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { backgroundColor: '#fff', padding: 16, borderRadius: 8, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  createButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  filterContainer: { flexDirection: 'row', marginBottom: 15 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterBtnText: { color: '#4b5563', fontSize: 12, fontWeight: 'bold' },
  filterBtnTextActive: { color: '#ffffff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  requestCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  requestTitle: { fontSize: 16, fontWeight: 'bold' },
  requestStatus: { marginTop: 4, color: '#4b5563', fontWeight: 'bold' },
  requestDate: { marginTop: 4, fontSize: 12, color: '#9ca3af' },
  viewBtn: { marginTop: 10, backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  viewBtnText: { color: '#4f46e5', fontSize: 12, fontWeight: 'bold' },
  acceptButton: { marginTop: 10, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  resolveButton: { marginTop: 10, backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  resolveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});

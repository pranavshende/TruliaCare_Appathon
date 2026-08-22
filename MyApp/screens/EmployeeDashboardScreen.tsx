import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE_URL } from '../services/api';
import SlaTimer from '../components/SlaTimer';
import RequestTimelineModal from '../components/RequestTimelineModal';

export default function EmployeeDashboardScreen() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]); // Employee
  const [availableTickets, setAvailableTickets] = useState<any[]>([]); // Tech
  const [assignedTickets, setAssignedTickets] = useState<any[]>([]); // Tech
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ASSIGNED'>('AVAILABLE');

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/requests/my');
      const data = await res.json();
      if (data.success) {
        if (user?.role === 'TECHNICIAN') {
          setAvailableTickets(data.availableTickets || []);
          setAssignedTickets(data.assignedTickets || []);
        } else {
          setRequests(data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/resolve`, { method: 'PATCH' });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/accept`, { method: 'PATCH' });
      if (res.ok) {
        fetchRequests();
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.message || 'Error accepting ticket');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Socket.io for Real-time updates
    const socketUrl = API_BASE_URL.replace('/api', '');
    const socket: Socket = io(socketUrl);
    
    socket.on('ticket_created', () => fetchRequests());
    socket.on('ticket_accepted', () => fetchRequests());
    socket.on('ticket_resolved', () => fetchRequests());

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const activeRequests = user?.role === 'TECHNICIAN'
    ? (activeTab === 'AVAILABLE' ? availableTickets : assignedTickets)
    : requests;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hi, {user?.name}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {user?.role === 'EMPLOYEE' && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}><Text style={styles.statValue}>{requests.length}</Text><Text>Total</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{requests.filter(r => r.status === 'PENDING').length}</Text><Text>Pending</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{requests.filter(r => r.status === 'ESCALATED').length}</Text><Text>Escalated</Text></View>
        </View>
      )}

      {user?.role === 'TECHNICIAN' && (
        <View style={styles.techTabs}>
          <TouchableOpacity 
            style={[styles.techTabBtn, activeTab === 'AVAILABLE' && styles.techTabBtnActive]} 
            onPress={() => setActiveTab('AVAILABLE')}
          >
            <Text style={[styles.techTabText, activeTab === 'AVAILABLE' && styles.techTabTextActive]}>Ticket Pool ({availableTickets.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.techTabBtn, activeTab === 'ASSIGNED' && styles.techTabBtnActive]} 
            onPress={() => setActiveTab('ASSIGNED')}
          >
            <Text style={[styles.techTabText, activeTab === 'ASSIGNED' && styles.techTabTextActive]}>My Assigned ({assignedTickets.length})</Text>
          </TouchableOpacity>
        </View>
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

      <Text style={styles.sectionTitle}>{user?.role === 'TECHNICIAN' ? (activeTab === 'AVAILABLE' ? 'Available Tickets' : 'My Tickets') : 'My Requests'}</Text>
      
      <RequestTimelineModal 
        visible={!!viewingRequestId} 
        requestId={viewingRequestId || ''} 
        onClose={() => setViewingRequestId(null)} 
      />

      <FlatList
        data={filter === 'ALL' ? activeRequests : activeRequests.filter(r => r.status === filter)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestTitle}>{item.title}</Text>
              <Text style={styles.requestDate}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.requestStatus}>Status: {item.status}</Text>
              <Text style={styles.requestDesc} numberOfLines={3}>{item.description}</Text>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
              )}
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10 }}>
              <SlaTimer createdAt={item.createdAt} status={item.status} acceptedAt={item.acceptedAt} />
              <TouchableOpacity onPress={() => setViewingRequestId(item.id)} style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View Details</Text>
              </TouchableOpacity>
              {user?.role === 'TECHNICIAN' && activeTab === 'AVAILABLE' && item.status === 'PENDING' && (
                <TouchableOpacity onPress={() => handleAccept(item.id)} style={styles.acceptButton}>
                  <Text style={styles.acceptButtonText}>Accept Request</Text>
                </TouchableOpacity>
              )}
              {user?.role === 'TECHNICIAN' && activeTab === 'ASSIGNED' && item.status === 'IN_PROGRESS' && (
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
  techTabs: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' },
  techTabBtn: { flex: 1, padding: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  techTabBtnActive: { borderBottomColor: '#2563eb' },
  techTabText: { fontWeight: 'bold', color: '#6b7280' },
  techTabTextActive: { color: '#2563eb' },
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
  requestDesc: { marginTop: 8, fontSize: 14, color: '#4b5563' },
  cardImage: { width: 80, height: 80, borderRadius: 8, marginTop: 10 },
  viewBtn: { marginTop: 10, backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  viewBtnText: { color: '#4f46e5', fontSize: 12, fontWeight: 'bold' },
  acceptButton: { marginTop: 10, backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  resolveButton: { marginTop: 10, backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  resolveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});

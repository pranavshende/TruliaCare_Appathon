import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE_URL } from '../services/api';
import SlaTimer from '../components/SlaTimer';
import RequestTimelineModal from '../components/RequestTimelineModal';
import FeedbackModal from '../components/FeedbackModal';

export default function EmployeeDashboardScreen() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]); // Employee
  const [availableTickets, setAvailableTickets] = useState<any[]>([]); // Tech
  const [assignedTickets, setAssignedTickets] = useState<any[]>([]); // Tech
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ASSIGNED'>('AVAILABLE');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Resolution State
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [workPerformed, setWorkPerformed] = useState('');
  const [resourcesUsed, setResourcesUsed] = useState('');
  const [cost, setCost] = useState('');
  const [timeSpentHours, setTimeSpentHours] = useState('');

  const fetchRequests = async () => {
    setRefreshing(true);
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
    } finally {
      setRefreshing(false);
    }
  };

  const submitResolve = async () => {
    if (!resolvingTicketId || !workPerformed) return Alert.alert('Error', 'Work Performed is required');
    try {
      const res = await apiFetch(`/requests/${resolvingTicketId}/resolve`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workPerformed, resourcesUsed, cost, timeSpentHours })
      });
      if (res.ok) {
        setResolvingTicketId(null);
        setWorkPerformed('');
        setResourcesUsed('');
        setCost('');
        setTimeSpentHours('');
        fetchRequests();
        Alert.alert('Success', 'Ticket resolved');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to resolve ticket');
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
        <View>
          <Text style={styles.headerTitle}>Hi, {user?.name}</Text>
          <Text style={styles.headerSubtitle}>Manage and track maintenance tickets.</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setShowFeedbackModal(true)}>
            <Text style={styles.headerBtnText}>🚩 Report/Rate</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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

      <RequestTimelineModal 
        visible={!!viewingRequestId} 
        requestId={viewingRequestId || ''} 
        onClose={() => setViewingRequestId(null)} 
      />
      
      <FeedbackModal visible={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      <Modal visible={!!resolvingTicketId} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Resolve Ticket</Text>
            <Text style={styles.label}>Work Performed</Text>
            <TextInput style={styles.input} value={workPerformed} onChangeText={setWorkPerformed} multiline />
            <Text style={styles.label}>Resources Used</Text>
            <TextInput style={styles.input} value={resourcesUsed} onChangeText={setResourcesUsed} />
            <View style={styles.rowGrid}>
              <View style={styles.col}>
                <Text style={styles.label}>Cost</Text>
                <TextInput style={styles.input} value={cost} onChangeText={setCost} keyboardType="numeric" />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Hours</Text>
                <TextInput style={styles.input} value={timeSpentHours} onChangeText={setTimeSpentHours} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setResolvingTicketId(null)}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={submitResolve}>
                <Text style={styles.btnSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filter === 'ALL' ? activeRequests : activeRequests.filter(r => r.status === filter)}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={fetchRequests}
        ListEmptyComponent={
          refreshing ? null : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#6b7280' }}>
              No tickets found.
            </Text>
          )
        }
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
                <TouchableOpacity style={styles.resolveButton} onPress={() => setResolvingTicketId(item.id)}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  headerBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  headerBtnText: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
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
  resolveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 4 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 12 },
  rowGrid: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#f1f5f9' },
  btnCancelText: { color: '#64748b', fontWeight: 'bold' },
  btnSubmit: { backgroundColor: '#10b981' },
  btnSubmitText: { color: '#fff', fontWeight: 'bold' }
});

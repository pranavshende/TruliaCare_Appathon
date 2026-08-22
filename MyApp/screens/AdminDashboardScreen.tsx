import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import SlaTimer from '../components/SlaTimer';
import RequestTimelineModal from '../components/RequestTimelineModal';
import ReassignModal from '../components/ReassignModal';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, escalated: 0, resolved: 0 });
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [reassigningRequestId, setReassigningRequestId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, reqsRes] = await Promise.all([
        apiFetch('/admin/dashboard'),
        apiFetch('/admin/requests')
      ]);
      const [statsData, reqsData] = await Promise.all([statsRes.json(), reqsRes.json()]);
      
      if (statsData.success) setStats(statsData.stats);
      if (reqsData.success) setRequests(reqsData.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string) => {
    await apiFetch(`/admin/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}><Text style={styles.statValue}>{stats.total}</Text><Text style={styles.statLabel}>Total</Text></View>
        <View style={styles.statBox}><Text style={styles.statValue}>{stats.escalated}</Text><Text style={styles.statLabel}>Escalated</Text></View>
      </View>

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

      <Text style={styles.sectionTitle}>All Requests</Text>
      
      <RequestTimelineModal 
        visible={!!viewingRequestId} 
        requestId={viewingRequestId || ''} 
        onClose={() => setViewingRequestId(null)} 
      />

      <ReassignModal 
        visible={!!reassigningRequestId} 
        requestId={reassigningRequestId || ''} 
        onClose={() => setReassigningRequestId(null)} 
        onSuccess={() => { setReassigningRequestId(null); fetchData(); }} 
      />

      <FlatList
        data={filter === 'ALL' ? requests : requests.filter(r => r.status === filter)}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={fetchData}
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
              <Text style={styles.requestStatus}>Status: {item.status}</Text>
              <Text style={styles.requestDate}>By: {item.employee?.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <SlaTimer createdAt={item.createdAt} status={item.status} />
              
              <View style={styles.actionButtonsRow}>
                {(item.status === 'PENDING' || item.status === 'ESCALATED') && (
                  <TouchableOpacity onPress={() => setReassigningRequestId(item.id)} style={styles.reassignBtn}>
                    <Text style={styles.reassignBtnText}>Reassign</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setViewingRequestId(item.id)} style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>Details</Text>
                </TouchableOpacity>
              </View>

              {item.status !== 'RESOLVED' && (
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
  statLabel: { fontSize: 12, color: '#6b7280' },
  filterContainer: { flexDirection: 'row', marginBottom: 15 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#2563eb' },
  filterBtnText: { color: '#4b5563', fontSize: 12, fontWeight: 'bold' },
  filterBtnTextActive: { color: '#ffffff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  requestCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  requestTitle: { fontSize: 16, fontWeight: 'bold' },
  requestStatus: { marginTop: 4, color: '#4b5563', fontWeight: 'bold' },
  requestDate: { marginTop: 4, fontSize: 14, color: '#6b7280' },
  resolveButton: { marginTop: 10, backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, alignItems: 'center' },
  resolveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  actionButtonsRow: { flexDirection: 'row', marginTop: 10 },
  reassignBtn: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, marginRight: 8 },
  reassignBtnText: { color: '#b45309', fontSize: 12, fontWeight: 'bold' },
  viewBtn: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  viewBtnText: { color: '#4f46e5', fontSize: 12, fontWeight: 'bold' }
});

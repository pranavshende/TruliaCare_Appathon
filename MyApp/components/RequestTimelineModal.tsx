import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RequestTimelineModal({ requestId, visible, onClose }: { requestId: string, visible: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const endpoint = user?.role === 'ADMIN' ? `/admin/requests/${requestId}` : `/requests/${requestId}`;
        const res = await apiFetch(endpoint);
        const data = await res.json();
        if (data.success) {
          setRequest(data.request);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [requestId, visible, user?.role]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Timeline: #{requestId.slice(-4)}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>X</Text></TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 50 }} />
          ) : request ? (
            <ScrollView style={styles.scrollArea}>
              <View style={styles.infoBox}>
                <Text style={styles.title}>{request.title}</Text>
                <Text style={styles.desc}>{request.description}</Text>
                <Text style={styles.meta}>Status: {request.status}</Text>
              </View>

              <Text style={styles.historyTitle}>Activity History</Text>
              
              <View style={styles.timelineContainer}>
                {/* Created Event */}
                <View style={styles.timelineItem}>
                  <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineHeader}>Request Created</Text>
                    <Text style={styles.timelineTime}>{new Date(request.createdAt).toLocaleString()}</Text>
                  </View>
                </View>

                {/* Escalation Logs */}
                {request.escalationLogs?.map((log: any) => (
                  <View key={log.id} style={styles.timelineItem}>
                    <View style={[styles.dot, { backgroundColor: log.newStatus === 'ESCALATED' ? '#ef4444' : '#eab308' }]} />
                    <View style={styles.timelineCard}>
                      <Text style={styles.timelineHeader}>{log.newStatus}</Text>
                      <Text style={styles.timelineTime}>{new Date(log.createdAt).toLocaleString()}</Text>
                      <Text style={styles.timelineReason}>{log.reason}</Text>
                    </View>
                  </View>
                ))}

                {/* Resolved Event */}
                {request.status === 'RESOLVED' && (
                  <View style={styles.timelineItem}>
                    <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                    <View style={styles.timelineCard}>
                      <Text style={styles.timelineHeader}>Request Resolved</Text>
                      <Text style={styles.timelineTime}>{new Date(request.updatedAt).toLocaleString()}</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>Failed to load.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 8, flex: 0.8, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { fontSize: 20, fontWeight: 'bold', color: '#888' },
  scrollArea: { padding: 16 },
  infoBox: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 6, marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 'bold' },
  desc: { color: '#4b5563', marginVertical: 4 },
  meta: { fontSize: 12, color: '#6b7280', fontWeight: 'bold' },
  historyTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  timelineContainer: { paddingLeft: 10, borderLeftWidth: 2, borderColor: '#e5e7eb', marginLeft: 10, paddingBottom: 20 },
  timelineItem: { marginBottom: 20, position: 'relative' },
  dot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', left: -17, top: 4, borderWidth: 2, borderColor: '#fff' },
  timelineCard: { backgroundColor: '#fff', padding: 12, borderRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginLeft: 10 },
  timelineHeader: { fontWeight: 'bold' },
  timelineTime: { fontSize: 12, color: '#6366f1', marginVertical: 2 },
  timelineReason: { fontSize: 12, color: '#6b7280' }
});

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { apiFetch } from '../services/api';

export default function ReassignModal({ 
  visible, 
  requestId, 
  onClose, 
  onSuccess 
}: { 
  visible: boolean, 
  requestId: string, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      fetchTechs();
    }
  }, [visible]);

  const fetchTechs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/technicians/status');
      const data = await res.json();
      if (data.success) {
        setTechnicians(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedTech) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/admin/requests/${requestId}/reassign`, {
        method: 'PUT',
        body: JSON.stringify({ technicianId: selectedTech, reason })
      });
      if (res.ok) {
        Alert.alert("Success", "Ticket reassigned successfully");
        onSuccess();
      } else {
        Alert.alert('Error', 'Failed to reassign');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Error during reassignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Reassign #{requestId.slice(-4)}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.body}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" />
            ) : technicians.length === 0 ? (
              <Text style={styles.emptyText}>No technicians found.</Text>
            ) : (
              <View style={styles.list}>
                <Text style={styles.label}>Select Technician</Text>
                {technicians.map(tech => (
                  <TouchableOpacity 
                    key={tech.id} 
                    onPress={() => setSelectedTech(tech.id)}
                    style={[styles.techCard, selectedTech === tech.id && styles.techCardActive]}
                  >
                    <View style={styles.techInfo}>
                      <Text style={styles.techName}>{tech.name}</Text>
                      <Text style={styles.techEmail}>{tech.email}</Text>
                    </View>
                    <View style={styles.techStatus}>
                      <View style={[
                        styles.badge,
                        tech.availability === 'AVAILABLE' ? styles.badgeGreen :
                        tech.availability === 'MODERATE' ? styles.badgeYellow :
                        styles.badgeRed
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          tech.availability === 'AVAILABLE' ? styles.badgeTextGreen :
                          tech.availability === 'MODERATE' ? styles.badgeTextYellow :
                          styles.badgeTextRed
                        ]}>{tech.availability}</Text>
                      </View>
                      <Text style={styles.activeCount}>Active: {tech.activeTicketCount}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.reasonContainer}>
              <Text style={styles.label}>Reason (Optional)</Text>
              <TextInput 
                style={styles.input}
                value={reason}
                onChangeText={setReason}
                placeholder="e.g. Current tech unavailable"
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.cancelBtn]}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleReassign} 
              disabled={!selectedTech || submitting}
              style={[styles.btn, styles.confirmBtn, (!selectedTech || submitting) && styles.disabledBtn]}
            >
              <Text style={styles.confirmBtnText}>{submitting ? 'Working...' : 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#f9fafb' },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  closeText: { fontSize: 18, color: '#9ca3af' },
  body: { padding: 16 },
  emptyText: { color: '#6b7280', textAlign: 'center', padding: 20 },
  list: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  techCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#f3f4f6', marginBottom: 8 },
  techCardActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  techInfo: { flex: 1 },
  techName: { fontWeight: 'bold', color: '#111827' },
  techEmail: { fontSize: 12, color: '#6b7280' },
  techStatus: { alignItems: 'flex-end' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
  badgeGreen: { backgroundColor: '#d1fae5' },
  badgeYellow: { backgroundColor: '#fef3c7' },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  badgeTextGreen: { color: '#047857' },
  badgeTextYellow: { color: '#b45309' },
  badgeTextRed: { color: '#b91c1c' },
  activeCount: { fontSize: 12, color: '#6b7280' },
  reasonContainer: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, backgroundColor: '#f9fafb' },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#f9fafb' },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancelBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  cancelBtnText: { fontWeight: 'bold', color: '#374151' },
  confirmBtn: { backgroundColor: '#2563eb' },
  disabledBtn: { opacity: 0.5 },
  confirmBtnText: { fontWeight: 'bold', color: '#fff' },
});

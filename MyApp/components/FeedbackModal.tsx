import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { apiFetch } from '../services/api';

export default function FeedbackModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const [mode, setMode] = useState<'SELECT' | 'FLAG' | 'RATE'>('SELECT');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('FACILITY');
  const [loading, setLoading] = useState(false);

  const handleFlag = async () => {
    if (!location) return Alert.alert('Error', 'Location is required');
    setLoading(true);
    try {
      const res = await apiFetch('/feedback/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, category })
      });
      if (res.ok) {
        Alert.alert('Success', 'Flag submitted anonymously. Thanks!');
        reset();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (val: number) => {
    if (!location) return Alert.alert('Error', 'Location is required to rate');
    setLoading(true);
    try {
      const res = await apiFetch('/feedback/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, rating: val })
      });
      if (res.ok) {
        Alert.alert('Success', 'Rating submitted. Thanks!');
        reset();
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode('SELECT');
    setLocation('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'SELECT' ? 'Feedback & Reports' : mode === 'FLAG' ? 'Anonymous Flag' : 'Rate Location'}
            </Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {mode === 'SELECT' ? (
              <View style={styles.spaceY}>
                <TouchableOpacity style={styles.optionBtn} onPress={() => setMode('FLAG')}>
                  <Text style={styles.optionEmoji}>🚩</Text>
                  <View>
                    <Text style={styles.optionTitle}>Flag an Issue</Text>
                    <Text style={styles.optionSub}>Quick, anonymous report without a ticket</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionBtn} onPress={() => setMode('RATE')}>
                  <Text style={styles.optionEmoji}>⭐</Text>
                  <View>
                    <Text style={styles.optionTitle}>Rate a Location</Text>
                    <Text style={styles.optionSub}>Rate cleanliness or condition</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.spaceY}>
                <Text style={styles.label}>Location</Text>
                <TextInput 
                  style={styles.input} 
                  value={location} 
                  onChangeText={setLocation} 
                  placeholder="e.g. 3rd Floor Washroom" 
                />

                {mode === 'FLAG' && (
                  <>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.pickerContainer}>
                      <Picker selectedValue={category} onValueChange={setCategory}>
                        <Picker.Item label="IT" value="IT" />
                        <Picker.Item label="Facility" value="FACILITY" />
                        <Picker.Item label="Electrical" value="ELECTRICAL" />
                        <Picker.Item label="Plumbing" value="PLUMBING" />
                        <Picker.Item label="HVAC" value="HVAC" />
                        <Picker.Item label="Other" value="OTHER" />
                      </Picker>
                    </View>
                    <TouchableOpacity style={styles.submitBtn} onPress={handleFlag} disabled={loading}>
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Flag</Text>}
                    </TouchableOpacity>
                  </>
                )}

                {mode === 'RATE' && (
                  <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map(val => (
                      <TouchableOpacity key={val} onPress={() => handleRate(val)} disabled={loading}>
                        <Text style={styles.ratingEmoji}>{val <= 2 ? '😠' : val === 3 ? '😐' : '😊'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.backBtn} onPress={() => setMode('SELECT')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30 },
  header: { backgroundColor: '#1e293b', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  closeBtn: { color: '#94a3b8', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  spaceY: { gap: 16 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  optionEmoji: { fontSize: 24, marginRight: 12 },
  optionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
  optionSub: { fontSize: 12, color: '#64748b' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: -10 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 14 },
  pickerContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8 },
  submitBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  ratingEmoji: { fontSize: 36 },
  backBtn: { alignItems: 'center', marginTop: 10 },
  backBtnText: { color: '#64748b', fontSize: 14 }
});

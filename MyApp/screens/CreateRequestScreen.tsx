import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { apiFetch } from '../services/api';
import { useNavigation } from '@react-navigation/native';

export default function CreateRequestScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT');
  const [priority, setPriority] = useState('LOW');
  const [location, setLocation] = useState('');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission required", "You need to allow camera access.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.5,
            });
            if (!result.canceled) {
              setPhoto(result.assets[0]);
            }
          }
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission required", "You need to allow photo library access.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.5,
            });
            if (!result.canceled) {
              setPhoto(result.assets[0]);
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill out all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      if (location) formData.append('location', location);

      if (photo) {
        const fileExt = photo.uri.substring(photo.uri.lastIndexOf('.') + 1);
        const fileName = `photo.${fileExt}`;

        formData.append('photo', {
          uri: photo.uri,
          name: fileName,
          type: `image/${fileExt}`
        } as any);
      }

      const res = await apiFetch('/requests', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Request submitted successfully');
        setTitle('');
        setDescription('');
        setPhoto(null);
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Broken AC" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Describe the issue" multiline numberOfLines={4} />

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

      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={priority} onValueChange={setPriority}>
          <Picker.Item label="Low" value="LOW" />
          <Picker.Item label="Medium" value="MEDIUM" />
          <Picker.Item label="High" value="HIGH" />
          <Picker.Item label="Critical" value="CRITICAL" />
        </Picker>
      </View>

      <Text style={styles.label}>Location (Optional)</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. 3rd Floor Washroom" />

      <Text style={styles.label}>Photo (Optional)</Text>
      <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
        <Text style={styles.imagePickerBtnText}>{photo ? 'Change Photo' : 'Select Photo'}</Text>
      </TouchableOpacity>
      {photo && <Image source={{ uri: photo.uri }} style={styles.imagePreview} />}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitBtnText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#374151' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  pickerContainer: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginBottom: 16 },
  imagePickerBtn: { backgroundColor: '#e0e7ff', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  imagePickerBtnText: { color: '#4f46e5', fontWeight: 'bold' },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16, resizeMode: 'cover' },
  submitBtn: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

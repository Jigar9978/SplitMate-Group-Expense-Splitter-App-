import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const AddGroupScreen = ({ navigation }: any) => {
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  const addMember = () => {
    if (memberName.trim()) {
      setMembers([...members, memberName]);
      setMemberName('');
    }
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim() || members.length === 0) return;

    const newGroup = {
      id: uuid.v4() as string,
      name: groupName.trim(),
      members,
      expenses: [],
    };

    try {
      const existingGroups = await AsyncStorage.getItem('groups');
      const groups = existingGroups ? JSON.parse(existingGroups) : [];
      const updatedGroups = [...groups, newGroup];
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Create New Group</Text>

      <TextInput
        placeholder="Enter group name"
        placeholderTextColor="#999"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />

      <View style={styles.memberRow}>
        <TextInput
          placeholder="Enter member name"
          placeholderTextColor="#999"
          value={memberName}
          onChangeText={setMemberName}
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity style={styles.addMemberBtn} onPress={addMember}>
          <Text style={styles.addMemberBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <Text style={styles.memberName}>👤 {item}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveGroup}>
        <Text style={styles.saveButtonText}>💾 Save Group</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default AddGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fd',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    elevation: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMemberBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 10,
    elevation: 2,
  },
  addMemberBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

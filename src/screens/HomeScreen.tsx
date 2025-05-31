import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Group } from '../types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2;

const HomeScreen = ({ navigation }: any) => {
  const [groups, setGroups] = useState<Group[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadGroups = async () => {
        const json = await AsyncStorage.getItem('groups');
        setGroups(json ? JSON.parse(json) : []);
      };
      loadGroups();
    }, [])
  );

  const handleDeleteGroup = (id: string) => {
    Alert.alert(
      'Are you sure?',
      'This will delete the group permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const json = await AsyncStorage.getItem('groups');
            const currentGroups = json ? JSON.parse(json) : [];
            const updatedGroups = currentGroups.filter((g: Group) => g.id !== id);
            await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
            setGroups(updatedGroups);
          },
        },
      ]
    );
  };

  const renderGroupItem = ({ item, index }: { item: Group; index: number }) => {
    const colors = [
      ['#A770EF', '#FDB99B'],
      ['#43E97B', '#38F9D7'],
      ['#FDC830', '#F37335'],
      ['#667eea', '#764ba2'],
    ];
    const bg = colors[index % colors.length];

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('GroupDetail', { group: item })}
        style={[styles.groupCard, { backgroundColor: bg[0] }]}
      >
        <View style={styles.cardContent}>
          <Text style={styles.groupName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleDeleteGroup(item.id)}>
            <Text style={styles.deleteBtn}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Your Groups</Text>

      {groups.length === 0 ? (
        <Text style={styles.emptyText}>No groups yet. Tap + to create one.</Text>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddGroup')}
      >
        <Text style={styles.addButtonText}>＋ Add Group</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f5f7fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
  },
  groupCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    marginBottom: 20,
    padding: 15,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardContent: {
    justifyContent: 'space-between',
    height: '100%',
  },
  groupName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteBtn: {
    fontSize: 20,
    color: '#fff',
    alignSelf: 'flex-end',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

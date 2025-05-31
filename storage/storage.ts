import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group } from '../src/types';

const GROUPS_KEY = 'GROUPS';

export const getGroups = async (): Promise<Group[]> => {
  try {
    const data = await AsyncStorage.getItem(GROUPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading groups:', error);
    return [];
  }
};

export const saveGroup = async (newGroup: Group): Promise<void> => {
  try {
    const existingGroups = await getGroups();
    const updatedGroups = [...existingGroups, newGroup];
    await AsyncStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
  } catch (error) {
    console.error('Error saving group:', error);
  }
};

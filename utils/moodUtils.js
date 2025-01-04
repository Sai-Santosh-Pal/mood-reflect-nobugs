import { database } from '../firebase';
import { ref, set, get, update, push, serverTimestamp } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveMoodEntry = async (userId, moodData) => {
  try {
    const moodsRef = ref(database, `users/${userId}/moods`);
    const newMoodData = {
      ...moodData,
      timestamp: Date.now(),
      createdAt: serverTimestamp()
    };
    await push(moodsRef, newMoodData);
  } catch (error) {
    console.error('Error saving mood:', error);
    throw error;
  }
};

export const getUserMoodEntries = async (userId) => {
  try {
    const userMoodsRef = ref(database, `users/${userId}/moods`);
    const snapshot = await get(userMoodsRef);
    
    if (snapshot.exists()) {
      const moods = snapshot.val();
      return Object.values(moods)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    return [];
  } catch (error) {
    console.error("Error getting mood entries:", error);
    return [];
  }
};

export const syncOfflineEntries = async (userId) => {
  try {
    const localData = await AsyncStorage.getItem(`moodEntries_${userId}`);
    if (localData) {
      const localEntries = JSON.parse(localData);
      const unsynced = Object.values(localEntries).filter(entry => !entry.synced);
      
      if (unsynced.length > 0) {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val() || {};
        const existingMoods = userData.moods || {};
        
        // Merge unsynced entries with existing moods
        const updatedMoods = {
          ...existingMoods,
          ...unsynced.reduce((acc, entry) => ({
            ...acc,
            [entry.id]: {
              ...entry,
              synced: true
            }
          }), {})
        };
        
        // Update all moods at once
        await update(userRef, {
          moods: updatedMoods
        });
        
        // Clear local storage after successful sync
        await AsyncStorage.removeItem(`moodEntries_${userId}`);
      }
    }
  } catch (error) {
    console.error("Error syncing offline entries:", error);
  }
};

export const deleteMoodEntry = async (userId, moodId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const moods = userData.moods || {};
      
      // Remove the specified mood
      delete moods[moodId];
      
      // Update the user's moods
      await update(userRef, {
        moods: moods
      });
    }
    return true;
  } catch (error) {
    console.error("Error deleting mood entry: ", error);
    throw error;
  }
};

export const getMoodColor = (moodType) => {
  switch (moodType) {
    case 'VERY_HAPPY':
      return '#4CAF50'; // Green
    case 'HAPPY':
      return '#8BC34A'; // Light Green
    case 'NEUTRAL':
      return '#FFC107'; // Amber
    case 'SAD':
      return '#FF9800'; // Orange
    case 'VERY_SAD':
      return '#F44336'; // Red
    default:
      return '#9E9E9E'; // Grey (default)
  }
};
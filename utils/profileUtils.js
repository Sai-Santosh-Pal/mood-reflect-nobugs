import { database } from '../firebase';
import { ref, set, get, update } from 'firebase/database';

export const initializeUserProfile = async (userId, email) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      const defaultProfile = {
        name: email.split('@')[0],
        email,
        bio: '',
        photoURL: null,
        joinedDate: new Date().toISOString(),
        totalMoods: 0
      };
      await set(userRef, defaultProfile);
      return defaultProfile;
    }
    return snapshot.val();
  } catch (error) {
    console.error('Error initializing profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    await update(userRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}; 
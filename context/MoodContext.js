import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { getUserMoodEntries } from '../utils/moodUtils';

export const MoodContext = createContext();

export function MoodProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecentMoods = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const moods = await getUserMoodEntries(auth.currentUser.uid);
      setRecentMoods(moods);
    } catch (error) {
      console.error('Error loading moods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load moods when the provider mounts
  useEffect(() => {
    loadRecentMoods();
  }, []);

  const refreshAnalytics = () => {
    setRefreshTrigger(prev => prev + 1);
    loadRecentMoods();
  };

  return (
    <MoodContext.Provider value={{ 
      refreshTrigger,
      refreshAnalytics,
      recentMoods,
      loading,
      loadRecentMoods // Make sure this is included in the value
    }}>
      {children}
    </MoodContext.Provider>
  );
}

export const useMood = () => useContext(MoodContext);
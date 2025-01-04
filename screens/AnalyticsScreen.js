import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import MoodAnalytics from '../components/mood/MoodAnalytics';
import DreamAnalytics from '../components/dream/DreamAnalytics';
import { theme } from '../themes';

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState('moods');
  const [moodData, setMoodData] = useState(null);
  const [dreamData, setDreamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Load moods with proper reference path
      const moodsRef = ref(database, `users/${userId}/moods`);
      const moodsSnapshot = await get(moodsRef);
      
      if (moodsSnapshot.exists()) {
        const moods = [];
        moodsSnapshot.forEach((childSnapshot) => {
          const moodData = childSnapshot.val();
          moods.push({
            id: childSnapshot.key,
            ...moodData,
            timestamp: moodData.timestamp || Date.now() // Fallback if timestamp missing
          });
        });
        
        // Sort moods by timestamp
        moods.sort((a, b) => b.timestamp - a.timestamp);

        // Calculate mood distribution
        const moodDistribution = {};
        moods.forEach((mood) => {
          moodDistribution[mood.moodType] = (moodDistribution[mood.moodType] || 0) + 1;
        });

        // Calculate depression risk
        const totalMoods = moods.length;
        const negativeMoods = moods.filter(
          (mood) => mood.moodType === "VERY_SAD" || mood.moodType === "SAD"
        ).length;
        const depressionRisk = totalMoods > 0 ? (negativeMoods / totalMoods) * 100 : 0;

        setMoodData({
          moods,
          moodDistribution,
          depressionRisk,
          tips: generateTips(depressionRisk)
        });
      }

      // Load dreams
      const dreamsRef = ref(database, `users/${auth.currentUser.uid}/dreams`);
      const dreamsSnapshot = await get(dreamsRef);
      
      if (dreamsSnapshot.exists()) {
        const dreams = [];
        dreamsSnapshot.forEach((childSnapshot) => {
          dreams.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        setDreamData(dreams);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateTips = (risk) => {
    if (risk > 70) {
      return [
        "Consider talking to a mental health professional",
        "Try to engage in activities you enjoy",
        "Reach out to friends or family for support",
      ];
    } else if (risk > 40) {
      return [
        "Practice self-care activities",
        "Try meditation or mindfulness exercises",
        "Maintain a regular sleep schedule",
      ];
    }
    return [
      "Keep up the good work!",
      "Continue your positive activities",
      "Share your happiness with others",
    ];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'moods' && styles.activeTab]}
          onPress={() => setActiveTab('moods')}
        >
          <Text style={[styles.tabText, activeTab === 'moods' && styles.activeTabText]}>
            Moods
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dreams' && styles.activeTab]}
          onPress={() => setActiveTab('dreams')}
        >
          <Text style={[styles.tabText, activeTab === 'dreams' && styles.activeTabText]}>
            Dreams
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'moods' ? (
        <MoodAnalytics
          moodData={moodData?.moodDistribution}
          depressionRisk={moodData?.depressionRisk}
          tips={moodData?.tips}
        />
      ) : (
        <DreamAnalytics dreamData={dreamData} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.semiBold,
  },
});

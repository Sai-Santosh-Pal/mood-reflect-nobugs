import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
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

      const moodsRef = ref(database, `users/${userId}/moods`);
      const moodsSnapshot = await get(moodsRef);
      
      if (moodsSnapshot.exists()) {
        const moods = [];
        moodsSnapshot.forEach((childSnapshot) => {
          const moodData = childSnapshot.val();
          moods.push({
            id: childSnapshot.key,
            ...moodData,
            timestamp: moodData.timestamp || Date.now()
          });
        });
        
        moods.sort((a, b) => b.timestamp - a.timestamp);

        const moodDistribution = {};
        moods.forEach((mood) => {
          moodDistribution[mood.moodType] = (moodDistribution[mood.moodType] || 0) + 1;
        });

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
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../assets/animations/loading.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text style={styles.headerTitle}>Analytics</Text>

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
    backgroundColor: "#FEBE",
  },
  contentContainer: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FEBE",
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: 52,
    marginBottom: 16,
    paddingHorizontal: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontFamily: theme.fonts.semiBold,
    color: '#888',
  },
  activeTabText: {
    color: '#fff',
  },
});

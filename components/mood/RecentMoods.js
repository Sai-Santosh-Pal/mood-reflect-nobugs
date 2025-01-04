import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useMood } from '../../context/MoodContext';
import { MOOD_TYPES } from '../../utils/moodTypes';
import { theme } from '../../themes';

export default function RecentMoods() {
  const { recentMoods, loadRecentMoods, loading } = useMood();

  useEffect(() => {
    loadRecentMoods();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading recent moods...</Text>
      </View>
    );
  }

  if (!recentMoods || recentMoods.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No moods recorded yet</Text>
      </View>
    );
  }

  const renderMoodItem = ({ item }) => (
    <View style={styles.moodItem}>
      <Text style={styles.moodEmoji}>{MOOD_TYPES[item.moodType]?.emoji}</Text>
      <Text style={styles.moodTime}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Moods</Text>
      <FlatList
        data={recentMoods.slice(0, 5)} // Show only last 5 moods
        renderItem={renderMoodItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.sm,
  },
  moodItem: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  moodTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    fontStyle: 'italic',
  },
}); 
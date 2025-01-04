import React from 'react';
import { View, StyleSheet } from 'react-native';
import MoodList from '../components/mood/MoodList';
import { useMood } from '../context/MoodContext';
import { theme } from '../themes';

export default function AllMoodsScreen() {
  const { recentMoods } = useMood();

  return (
    <View style={styles.container}>
      <MoodList entries={recentMoods} showAll={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}); 
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../../firebase';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { theme } from '../../themes';
import { MOOD_TYPES } from '../../utils/moodTypes';

export default function MoodList({ showAll = false }) {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodEntries();
  }, []);

  const loadMoodEntries = async () => {
    try {
      const moodsRef = ref(database, `users/${auth.currentUser.uid}/moods`);
      const moodsQuery = query(moodsRef, orderByChild('timestamp'));
      const snapshot = await get(moodsQuery);
      
      if (snapshot.exists()) {
        const moodsData = [];
        snapshot.forEach((child) => {
          moodsData.push({
            id: child.key,
            ...child.val(),
            timestamp: new Date(child.val().timestamp)
          });
        });
        
        // Sort by timestamp descending (newest first)
        moodsData.sort((a, b) => b.timestamp - a.timestamp);
        setEntries(moodsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading moods:', error);
      setLoading(false);
    }
  };

  const displayEntries = showAll ? entries : entries.slice(0, 2);

  const renderMoodItem = ({ item }) => (
    <View style={styles.moodItem}>
      <View style={styles.moodContent}>
        <View style={styles.moodHeader}>
          <Text style={styles.moodType}>
            {MOOD_TYPES[item.moodType]?.emoji} {MOOD_TYPES[item.moodType]?.label}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {item.note && <Text style={styles.note}>{item.note}</Text>}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading moods...</Text>
      </View>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No mood entries yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Recent Moods</Text>
        {!showAll && entries.length > 2 && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('AllMoods')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayEntries}
        renderItem={renderMoodItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={showAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
  },
  viewAllButton: {
    padding: theme.spacing.xs,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  moodItem: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  moodContent: {
    gap: theme.spacing.xs,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodType: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  note: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  listContent: {
    flexGrow: 1,
  },
}); 
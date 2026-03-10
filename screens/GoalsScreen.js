import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../themes';
import { auth, database } from '../firebase';
import { ref, push, update, get } from 'firebase/database';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const goalsRef = ref(database, `users/${auth.currentUser.uid}/goals`);
      const snapshot = await get(goalsRef);
      if (snapshot.exists()) {
        const goalsData = [];
        snapshot.forEach((child) => {
          goalsData.push({
            id: child.key,
            ...child.val()
          });
        });
        setGoals(goalsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading goals:', error);
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    try {
      const goalsRef = ref(database, `users/${auth.currentUser.uid}/goals`);
      await push(goalsRef, {
        text: newGoal,
        completed: false,
        timestamp: new Date().toISOString(),
      });
      setNewGoal('');
      loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const toggleGoal = async (id, completed) => {
    try {
      const goalRef = ref(database, `users/${auth.currentUser.uid}/goals/${id}`);
      await update(goalRef, { completed: !completed });
      loadGoals();
    } catch (error) {
      console.error('Error toggling goal:', error);
    }
  };

  const renderGoal = ({ item }) => (
    <View style={styles.goalCard}>
      <View style={styles.goalContent}>
        <TouchableOpacity 
          onPress={() => toggleGoal(item.id, item.completed)}
          style={styles.checkbox}
        >
          {item.completed ? (
            <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#FFD700" />
          )}
        </TouchableOpacity>
        <Text style={[
          styles.goalText,
          item.completed && styles.completedGoal
        ]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goals</Text>
      
      {/* New Goal Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new goal..."
          value={newGoal}
          onChangeText={setNewGoal}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addGoal}
        >
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      {loading ? (
        <Text style={styles.loadingText}>Loading goals...</Text>
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
  },
  inputContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  input: {
    height: 40,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: '#FFD700',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonText: {
    color: '#000000',
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  goalCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  checkbox: {
    marginRight: theme.spacing.sm,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalText: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  completedGoal: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginLeft: 50,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.lg,
  },
}); 
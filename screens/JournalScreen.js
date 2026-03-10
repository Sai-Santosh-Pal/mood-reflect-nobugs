import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  FlatList 
} from 'react-native';
import { theme } from '../themes';
import { auth, database } from '../firebase';
import { ref, push, get } from 'firebase/database';

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const entriesRef = ref(database, `users/${auth.currentUser.uid}/journal`);
      const snapshot = await get(entriesRef);
      if (snapshot.exists()) {
        const entriesData = [];
        snapshot.forEach((child) => {
          entriesData.push({
            id: child.key,
            ...child.val()
          });
        });
        setEntries(entriesData.reverse()); // Most recent first
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      const entriesRef = ref(database, `users/${auth.currentUser.uid}/journal`);
      await push(entriesRef, {
        text: newEntry,
        timestamp: new Date().toISOString(),
      });
      setNewEntry('');
      loadEntries(); // Reload entries
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entryCard}>
      <Text style={styles.entryText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      
      {/* New Entry Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write your thoughts..."
          value={newEntry}
          onChangeText={setNewEntry}
          multiline
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addEntry}
        >
          <Text style={styles.addButtonText}>Add Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      {loading ? (
        <Text style={styles.loadingText}>Loading entries...</Text>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
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
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
  },
  addButton: {
    backgroundColor: theme.colors.dreamPositive,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  addButtonText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    fontSize: 16,
  },
  entryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  entryText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
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
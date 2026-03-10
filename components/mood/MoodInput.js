import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { MOOD_TYPES } from '../../utils/moodTypes';
import { theme } from '../../themes';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MoodInput({ onSaveMood }) {
  const [moodNote, setMoodNote] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!moodNote.trim() || !selectedMood) return;
    
    setLoading(true);
    try {
      await onSaveMood({
        note: moodNote,
        moodType: selectedMood,
        value: MOOD_TYPES[selectedMood].value,
        timestamp: new Date()
      });
      setMoodNote('');
      setSelectedMood(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.moodSelector}>
        {Object.entries(MOOD_TYPES).map(([key, mood]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.moodButton,
              selectedMood === key && styles.selectedMood
            ]}
            onPress={() => setSelectedMood(key)}
          >
            <FontAwesome5 
              name={mood.icon} 
              size={24} 
              color={selectedMood === key ? theme.colors.white : theme.colors.tabBarIconInactive}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="How are you feeling?"
          placeholderTextColor={theme.colors.inactive}
          value={moodNote}
          onChangeText={setMoodNote}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!selectedMood || !moodNote.trim()) && styles.sendButtonDisabled]}
          onPress={handleSave}
          disabled={loading || !selectedMood || !moodNote.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <FontAwesome5 name="paper-plane" size={18} color={theme.colors.white} solid />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  moodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
  },
  moodButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.card,
  },
  selectedMood: {
    backgroundColor: theme.colors.backgroundLight + "20",
    borderWidth: 2,
    borderColor: theme.colors.backgroundLight,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.sendButton,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

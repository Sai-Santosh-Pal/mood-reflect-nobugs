import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useState } from 'react';
import { MOOD_TYPES } from '../../utils/moodTypes';
import AuthInput from '../auth/AuthInput';
import AuthButton from '../auth/AuthButton';
import { theme } from '../../themes';

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
            <Image 
              source={mood.image} 
              style={styles.moodImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </View>
      <AuthInput
        placeholder="How are you feeling?"
        value={moodNote}
        onChangeText={setMoodNote}
        multiline
        style={styles.input}
      />
      <AuthButton 
        title="Save Mood" 
        onPress={handleSave}
        loading={loading}
        disabled={!selectedMood}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: theme.spacing.md,
  },
  moodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  moodButton: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
  },
  selectedMood: {
    backgroundColor: "#FEBE" + "20",
    borderWidth: 2,
    borderColor: "#FEBE",
  },
  moodImage: {
    width: 30,
    height: 30,
  },
  input: {
    marginBottom: theme.spacing.md,
    fontSize: 20,
  },
}); 
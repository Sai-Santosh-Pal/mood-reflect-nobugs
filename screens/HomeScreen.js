import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import MoodInput from '../components/mood/MoodInput';
import { saveMoodEntry } from '../utils/moodUtils';
import { useMood } from '../context/MoodContext';
import { theme } from '../themes';
import { useNavigation } from '@react-navigation/native';
import InfoSection from '../components/info/InfoSection';
import { FontAwesome5 } from '@expo/vector-icons';
import { MOOD_TYPES } from '../utils/moodTypes';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { refreshAnalytics, loadRecentMoods, recentMoods } = useMood();
  const [userName, setUserName] = useState('');
  const [dreamData, setDreamData] = useState([]);

  useEffect(() => {
    loadRecentMoods();
    loadUserProfile();
    loadDreamData();
  }, []);

  const loadDreamData = async () => {
    try {
      const dreamsRef = ref(database, `users/${auth.currentUser.uid}/dreams`);
      const snapshot = await get(dreamsRef);
      if (snapshot.exists()) {
        const dreams = [];
        snapshot.forEach((child) => {
          dreams.push({ id: child.key, ...child.val() });
        });
        setDreamData(dreams);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}/profile`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const profileData = snapshot.val();
        setUserName(profileData.name || 'User');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setUserName('User');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const handleSaveMood = async (moodData) => {
    try {
      console.log('Saving mood:', moodData);
      await saveMoodEntry(auth.currentUser.uid, moodData);
      refreshAnalytics();
      loadRecentMoods();
      console.log('Mood saved successfully');
    } catch (error) {
      console.error('Error saving mood:', error);
      throw error;
    }
  };

  const handleEmergencyCall = () => {
    const phoneNumber = 'tel:18005990019';
    Linking.openURL(phoneNumber);
  };

  const infoSections = [
    {
      title: "Meditation Basics",
      items: [
        {
          title: "Breathing Techniques",
          shortDescription:
            "Master essential breathing exercises for deep meditation and instant calm",
          imageUrl:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
          onPress: (item) => navigation.navigate("InfoDetail", { item }),
          fullDescription: `Breathing is the foundation of meditation and mindfulness practice. Learn these essential techniques to transform your practice:

1. Box Breathing (Square Breathing)
• Inhale for 4 counts
• Hold for 4 counts
• Exhale for 4 counts
• Hold empty for 4 counts
• Repeat 5-10 times
Benefits: Reduces stress, improves focus, calms anxiety

2. 4-7-8 Breathing
• Inhale quietly for 4 counts
• Hold breath for 7 counts
• Exhale completely for 8 counts
• Repeat 4 times
Benefits: Helps with sleep, reduces anxiety, manages cravings

3. Diaphragmatic Breathing
• Place one hand on chest, other on belly
• Breathe deeply into belly, keeping chest still
• Exhale slowly through pursed lips
• Practice for 5-10 minutes
Benefits: Increases oxygen, reduces stress, improves core stability

Practice Tips:
• Start with 5 minutes daily
• Find a quiet, comfortable space
• Keep a consistent practice time
• Don't force or strain
• Notice how each technique affects you differently

Remember: The key to successful breathing practice is consistency rather than duration. Even a few minutes of focused breathing can make a significant difference in your day.`,
        },
        {
          title: "Body Scan Meditation",
          shortDescription:
            "Experience deep relaxation through systematic body awareness practice",
          imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e",
          onPress: (item) => navigation.navigate("InfoDetail", { item }),
          fullDescription: `The Body Scan Meditation is a powerful technique for developing body awareness and releasing tension. Here's your complete guide:

What is Body Scan Meditation?
A systematic practice of bringing attention to each part of your body, promoting relaxation and awareness.

Step-by-Step Guide:

1. Preparation
• Lie down in a comfortable position
• Close your eyes
• Take several deep breaths
• Set aside 15-20 minutes

2. The Practice
• Start with your toes
• Move attention slowly up through each body part
• Notice any sensations (temperature, pressure, tingling)
• Release tension in each area
• Continue to the top of your head

3. Common Areas to Focus On:
• Toes and feet
• Ankles and calves
• Knees and thighs
• Hips and lower back
• Abdomen and chest
• Shoulders and arms
• Neck and face
• Scalp and whole body

Benefits:
• Reduces physical tension
• Improves sleep quality
• Increases body awareness
• Reduces chronic pain
• Helps with anxiety and stress
• Promotes emotional release

Tips for Success:
• Practice at the same time daily
• Stay warm and comfortable
• Don't worry about falling asleep
• Be patient with wandering thoughts
• Start with shorter sessions
• Use guided recordings initially

Remember: There's no "right" way to feel during a body scan. Whatever you experience is valid and valuable for your practice.`,
        },
      ],
    },
    {
      title: "Mindfulness Practices",
      items: [
        {
          title: "Daily Mindfulness",
          shortDescription:
            "Transform everyday activities into powerful mindfulness practices",
          imageUrl:
            "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7",
          onPress: (item) => navigation.navigate("InfoDetail", { item }),
          fullDescription: `Integrate mindfulness into your daily life with these practical techniques and exercises:

1. Morning Mindfulness Routine
• Take 3 mindful breaths upon waking
• Notice physical sensations while stretching
• Observe thoughts without judgment
• Set intentions for the day
Duration: 5-10 minutes

2. Mindful Eating Practice
• Observe food appearance and aroma
• Take small, deliberate bites
• Notice flavors and textures
• Eat without distractions
Duration: During any meal

3. Mindful Walking
• Feel each step fully
• Notice leg movements
• Observe surroundings
• Maintain steady breathing
Duration: 10-15 minutes

4. Mindful Work
• Single-task focus
• Regular breath awareness
• Mindful transitions
• Conscious communications
Throughout the day

5. Evening Wind-Down
• Body scan meditation
• Gratitude reflection
• Mindful review of the day
Duration: 10-15 minutes

Key Benefits:
• Reduced stress and anxiety
• Improved focus and concentration
• Better emotional regulation
• Enhanced self-awareness
• Improved sleep quality
• Greater life satisfaction

Tips for Success:
• Start with one practice
• Set reminders
• Be patient with yourself
• Notice small improvements
• Maintain consistency
• Join a mindfulness community

Remember: Mindfulness is not about perfection but about returning to the present moment again and again with kindness and curiosity.`,
        },
        {
          title: "Stress Management",
          shortDescription:
            "Effective techniques for immediate and long-term stress relief",
          imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
          onPress: (item) => navigation.navigate("InfoDetail", { item }),
          fullDescription: `Comprehensive guide to managing stress through proven techniques and strategies:

Immediate Stress Relief:

1. Quick Breathing Exercises
• 4-7-8 Breathing
• Box Breathing
• Deep Belly Breathing
Duration: 1-3 minutes

2. Physical Techniques
• Progressive Muscle Relaxation
• Shoulder and Neck Rolls
• Hand and Finger Stretches
Duration: 2-5 minutes

3. Mental Techniques
• Counting Backward
• Visualization
• Positive Affirmations
Duration: 1-2 minutes

Long-term Stress Management:

1. Daily Practices
• Morning Meditation
• Regular Exercise
• Healthy Sleep Routine
• Balanced Nutrition
• Time in Nature

2. Lifestyle Changes
• Set Boundaries
• Practice Time Management
• Regular Breaks
• Digital Detox
• Social Connections

3. Emotional Regulation
• Journal Writing
• Art Therapy
• Music Therapy
• Talk Therapy
• Support Groups

Warning Signs of Stress:
• Sleep Disturbances
• Appetite Changes
• Mood Swings
• Physical Tension
• Concentration Issues

Prevention Strategies:
• Regular Exercise
• Balanced Diet
• Adequate Sleep
• Social Support
• Professional Help When Needed

Remember: Stress management is personal - find what works best for you and make it a regular part of your routine.`,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.moodCardWrapper}>
          <View style={styles.moodInputContainer}>
            <Text style={styles.introText}>
              {`${getGreeting()}, ${userName}`}
            </Text>
            <Text style={styles.welcomeText}>How are you feeling today?</Text>
            <MoodInput onSaveMood={handleSaveMood} />
          </View>
          <TouchableOpacity 
            style={styles.sosButton}
            onPress={handleEmergencyCall}
          >
            <FontAwesome5 name="phone-alt" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Overview Header */}
        <View style={styles.overviewSectionHeader}>
          <Text style={styles.overviewSectionTitle}>Overview</Text>
          <View style={styles.overviewNavBtns}>
            <TouchableOpacity style={styles.quickNavBtn} onPress={() => navigation.navigate('Journal')}>
              <FontAwesome5 name="book" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickNavBtn} onPress={() => navigation.navigate('Goals')}>
              <FontAwesome5 name="bullseye" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mood Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Mood Overview</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recentMoods?.length || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {recentMoods?.filter(m => m.moodType === 'VERY_HAPPY' || m.moodType === 'HAPPY').length || 0}
              </Text>
              <Text style={styles.statLabel}>Positive</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>
                {recentMoods?.filter(m => m.moodType === 'NEUTRAL').length || 0}
              </Text>
              <Text style={styles.statLabel}>Neutral</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF4D4D' }]}>
                {recentMoods?.filter(m => m.moodType === 'SAD' || m.moodType === 'VERY_SAD').length || 0}
              </Text>
              <Text style={styles.statLabel}>Negative</Text>
            </View>
          </View>
          {recentMoods?.length > 0 && (
            <View style={styles.moodBarContainer}>
              {(() => {
                const total = recentMoods.length;
                const positive = recentMoods.filter(m => m.moodType === 'VERY_HAPPY' || m.moodType === 'HAPPY').length;
                const neutral = recentMoods.filter(m => m.moodType === 'NEUTRAL').length;
                const negative = total - positive - neutral;
                return (
                  <View style={styles.moodBar}>
                    {positive > 0 && <View style={[styles.moodBarSegment, { flex: positive, backgroundColor: '#4CAF50', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />}
                    {neutral > 0 && <View style={[styles.moodBarSegment, { flex: neutral, backgroundColor: '#FFA500' }]} />}
                    {negative > 0 && <View style={[styles.moodBarSegment, { flex: negative, backgroundColor: '#FF4D4D', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />}
                  </View>
                );
              })()}
            </View>
          )}
        </View>

        {/* Dream Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Dream Overview</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dreamData.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFD700' }]}>
                {dreamData.filter(d => d.type === 'Lucid Dream' || d.type === 'Vivid Dream').length}
              </Text>
              <Text style={styles.statLabel}>Positive</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>
                {dreamData.filter(d => d.type === 'Recurring Dream').length}
              </Text>
              <Text style={styles.statLabel}>Neutral</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF4D4D' }]}>
                {dreamData.filter(d => d.type === 'Nightmare' || d.type === 'Prophetic Dream').length}
              </Text>
              <Text style={styles.statLabel}>Negative</Text>
            </View>
          </View>
          {dreamData.length > 0 && (
            <View style={styles.moodBarContainer}>
              {(() => {
                const total = dreamData.length;
                const positive = dreamData.filter(d => d.type === 'Lucid Dream' || d.type === 'Vivid Dream').length;
                const neutral = dreamData.filter(d => d.type === 'Recurring Dream').length;
                const negative = total - positive - neutral;
                return (
                  <View style={styles.moodBar}>
                    {positive > 0 && <View style={[styles.moodBarSegment, { flex: positive, backgroundColor: '#FFD700', borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />}
                    {neutral > 0 && <View style={[styles.moodBarSegment, { flex: neutral, backgroundColor: '#FFA500' }]} />}
                    {negative > 0 && <View style={[styles.moodBarSegment, { flex: negative, backgroundColor: '#FF4D4D', borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />}
                  </View>
                );
              })()}
            </View>
          )}
        </View>

        {/* Info Sections */}
        {infoSections.map((section, index) => (
          <InfoSection
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEBE",
  },
  moodCardWrapper: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  moodInputContainer: {
    backgroundColor: "#FEBE00",
    paddingVertical: 12,
    borderRadius: 16,
  },
  welcomeText: {
    fontSize: 25,
    fontFamily: theme.fonts.bold,
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
  },
  introText: {
    fontSize: 20,
    fontFamily: theme.fonts.regular,
    marginLeft: 20,
    marginBottom: -2,
  },
  sosButton: {
    position: "absolute",
    top: -12,
    right: -12,
    backgroundColor: "#FF3B30",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  overviewCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  overviewTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.semiBold,
    color: "#000",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 26,
    fontFamily: theme.fonts.bold,
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: "#888",
    marginTop: 2,
  },
  moodBarContainer: {
    marginTop: 14,
  },
  moodBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  moodBarSegment: {
    height: 8,
  },
  overviewSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 2,
  },
  overviewSectionTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: "#000",
  },
  overviewNavBtns: {
    flexDirection: "row",
    gap: 10,
  },
  quickNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEBE00",
    alignItems: "center",
    justifyContent: "center",
  },
}); 
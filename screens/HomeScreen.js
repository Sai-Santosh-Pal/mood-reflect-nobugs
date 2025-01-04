import React, { useState, useEffect } from 'react';
import { View, Text,Dimensions, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { auth, database } from '../firebase';
import { ref, get } from 'firebase/database';
import MoodInput from '../components/mood/MoodInput';
import { saveMoodEntry } from '../utils/moodUtils';
import { useMood } from '../context/MoodContext';
import { theme } from '../themes';
import { useNavigation } from '@react-navigation/native';
import InfoSection from '../components/info/InfoSection';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { refreshAnalytics, loadRecentMoods } = useMood();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadRecentMoods();
    loadUserProfile();
  }, []);

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
            "https://kripalu.org/sites/default/files/Meditation_Ref_GettyImages-658448794.jpg",
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
          <Text style={styles.sosButtonText}>🆘 Emergency SOS</Text>
        </TouchableOpacity>
        <View style={styles.columnContainer}>
          <TouchableOpacity style={styles.column} onPress={() => navigation.navigate('Journal')}>
            <Text style={styles.columnEmoji}>📝</Text>
            <Text style={styles.columnTitle}>Journal</Text>
            <Text style={styles.columnSubtext}>Record your thoughts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.column} onPress={() => navigation.navigate('Goals')}>
            <Text style={styles.columnEmoji}>🎯</Text>
            <Text style={styles.columnTitle}>Goals</Text>
            <Text style={styles.columnSubtext}>Track your progress</Text>
          </TouchableOpacity>
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
    // padding: 20,
    backgroundColor: "#FEBE",
  },
  moodInputContainer: {
    backgroundColor: "#FEBE00",
    paddingBlock: 20,
    borderRadius: 30,
    marginTop: 50,
    marginHorizontal: 20,
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
    marginBottom: -20,
  },
  sosButton: {
    backgroundColor: "#FFD700",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sosButtonText: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: "#000000",
  },
  columnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.sm,
  },
  column: {
    flex: 1,
    backgroundColor: "#FFD700",
    padding: theme.spacing.lg,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 120,
  },
  columnEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  columnTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: "#000000",
    marginBottom: theme.spacing.xs,
  },
  columnSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: "#000000",
    textAlign: "center",
  },
}); 
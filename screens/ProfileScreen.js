import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { auth, database } from '../firebase';
import { ref, get, set } from 'firebase/database';
import { signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import { theme } from '../themes';
import { uploadImageToImgBB } from '../utils/imageUtils';

export default function ProfileScreen() {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    photoURL: null,
    joinedDate: '',
    totalMoods: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}/profile`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      } else {
        // Set default profile if none exists
        const defaultProfile = {
          name: auth.currentUser.email.split('@')[0],
          bio: 'No bio yet',
          photoURL: null,
          joinedDate: new Date().toISOString(),
          totalMoods: 0
        };
        await set(userRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setLoading(true);
        const imageUrl = await uploadImageToImgBB(result.assets[0].uri);
        
        // Update profile with new image URL
        await updateProfile({ photoURL: imageUrl });
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const userRef = ref(database, `users/${auth.currentUser.uid}/profile`);
      const newProfile = { ...profile, ...updatedData };
      await set(userRef, newProfile);
      setProfile(newProfile);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          onPress: () => signOut(auth),
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleImagePick}>
          <View style={styles.imageContainer}>
            {profile.photoURL ? (
              <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
            ) : (
              <MaterialIcons name="person" size={60} color="#666" />
            )}
            <View style={styles.editIconContainer}>
              <MaterialIcons name="edit" size={20} color="white" />
            </View>
          </View>
        </TouchableOpacity>
        
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{auth.currentUser.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.bio}>{profile.bio}</Text>
        <Text style={styles.statsText}>Total Moods: {profile.totalMoods}</Text>
        <Text style={styles.statsText}>
          Joined: {new Date(profile.joinedDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ProfileEditModal 
        visible={isEditing}
        profile={profile}
        onClose={() => setIsEditing(false)}
        onSave={updateProfile}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.card,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
  infoSection: {
    backgroundColor: theme.colors.card,
    marginTop: 20,
    padding: 20,
  },
  bio: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  buttonContainer: {
    padding: 20,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: theme.colors.card,
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
  },
  signOutButton: {
    backgroundColor: theme.colors.error,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: theme.colors.card,
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
  },
}); 
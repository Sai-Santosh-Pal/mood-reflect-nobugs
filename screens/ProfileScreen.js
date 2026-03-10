import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { auth, database } from "../firebase";
import { ref, get, set } from "firebase/database";
import { signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import ProfileEditModal from "../components/profile/ProfileEditModal";
import { theme } from "../themes";
import { uploadImageToImgBB } from "../utils/imageUtils";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    photoURL: null,
    joinedDate: "",
    totalMoods: 0,
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
        const defaultProfile = {
          name: auth.currentUser.email.split("@")[0],
          bio: "No bio yet",
          photoURL: null,
          joinedDate: new Date().toISOString(),
          totalMoods: 0,
        };
        await set(userRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
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
        await updateProfile({ photoURL: imageUrl });
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Alert.alert("Error", "Failed to update profile picture.");
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
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: () => signOut(auth),
        style: "destructive",
      },
    ]);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getMemberSince = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/animations/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero section */}
      <View style={[styles.heroSection, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={handleImagePick} activeOpacity={0.8}>
          <View style={styles.avatarWrapper}>
            {profile.photoURL ? (
              <Image
                source={{ uri: profile.photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {getInitials(profile.name)}
                </Text>
              </View>
            )}
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{auth.currentUser.email}</Text>

        {profile.bio && profile.bio !== "No bio yet" ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="happy" size={22} color="#FF9800" />
          </View>
          <Text style={styles.statValue}>{profile.totalMoods || 0}</Text>
          <Text style={styles.statLabel}>Moods Logged</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconBg, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="calendar" size={22} color="#4CAF50" />
          </View>
          <Text style={styles.statValue}>{getMemberSince(profile.joinedDate)}</Text>
          <Text style={styles.statLabel}>Member Since</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setIsEditing(true)}
        >
          <View style={[styles.menuIconBg, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="person-outline" size={20} color="#2196F3" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Edit Profile</Text>
            <Text style={styles.menuItemSubtitle}>Update name and bio</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleImagePick}
        >
          <View style={[styles.menuIconBg, { backgroundColor: "#F3E5F5" }]}>
            <Ionicons name="image-outline" size={20} color="#9C27B0" />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Change Photo</Text>
            <Text style={styles.menuItemSubtitle}>Pick a new profile picture</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.inactive} />
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.signOutItem}
          onPress={handleSignOut}
        >
          <View style={[styles.menuIconBg, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Made with ❤️ by Team Mood Reflectors</Text>

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
    backgroundColor: theme.colors.backgroundLight,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundLight,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.inactive,
  },
  // Hero
  heroSection: {
    alignItems: "center",
    backgroundColor: theme.colors.card,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrapper: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: `${theme.colors.primary}40`,
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: theme.fonts.bold,
    color: "#fff",
  },
  cameraButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.card,
  },
  name: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    marginTop: 8,
  },
  editProfileText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: "center",
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    marginTop: 2,
  },
  // Menu
  menuSection: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
  },
  menuSectionTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.inactive,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    marginTop: 1,
  },
  signOutItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.error,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { database } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../themes";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = () => {
    const usersRef = ref(database, "users");
    return onValue(usersRef, (snapshot) => {
      const usersData = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.profile) {
          usersData.push({
            id: childSnapshot.key,
            username: userData.profile.username || "Anonymous",
            bio: userData.profile.bio,
            totalMoods: userData.profile.totalMoods || 0,
          });
        }
      });
      setUsers(usersData);
      setRefreshing(false);
    });
  };

  useEffect(() => {
    const unsubscribe = loadUsers();
    return () => unsubscribe();
  }, []);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = theme.colors.avatarColors || ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View
        style={[styles.avatar, { backgroundColor: getAvatarColor(item.username) }]}
      >
        <Text style={styles.avatarText}>{getInitials(item.username)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="happy-outline" size={14} color={theme.colors.inactive} />
            <Text style={styles.statText}>{item.totalMoods} moods</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={theme.colors.inactive} />
      <Text style={styles.emptyTitle}>No users yet</Text>
      <Text style={styles.emptySubtitle}>
        Community members will appear here once they set up their profiles.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          users.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          users.length > 0 ? (
            <Text style={styles.memberCount}>
              {users.length} {users.length === 1 ? "member" : "members"}
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadUsers();
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  memberCount: {
    fontSize: 13,
    fontFamily: theme.fonts.medium,
    color: theme.colors.inactive,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 18,
    fontFamily: theme.fonts.bold,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  bio: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    marginBottom: 6,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.inactive,
    marginLeft: 4,
  },
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.inactive,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});

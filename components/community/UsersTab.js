import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { theme } from '../../themes';

export default function UsersTab() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData.profile) {
          usersData.push({
            id: childSnapshot.key,
            username: userData.profile.username || 'Anonymous',
            bio: userData.profile.bio,
            totalMoods: userData.profile.totalMoods || 0,
          });
        }
      });
      setUsers(usersData);
    });
  
    return () => unsubscribe();
  }, []);

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.bio && <Text style={styles.bio}>{item.bio}</Text>}
        <Text style={styles.stats}>Total Moods: {item.totalMoods}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
  },
  userCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  stats: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
  },
}); 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { theme } from '../themes';
import { auth, database } from '../firebase';
import { ref, get, remove, push, set } from 'firebase/database';

export default function ChatHistoryScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const createNewChat = async () => {
    try {
      navigation.replace('AIChat', { 
        chatId: null,
        messages: [{
          id: 1,
          text: "Hello! I'm your mental health AI assistant. How can I help you today?",
          sender: 'ai',
        }]
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  const loadChats = async () => {
    try {
      const chatsRef = ref(database, `users/${auth.currentUser.uid}/chats`);
      const snapshot = await get(chatsRef);
      
      if (snapshot.exists()) {
        const chatsData = [];
        snapshot.forEach((child) => {
          chatsData.push({
            id: child.key,
            ...child.val(),
          });
        });
        setChats(chatsData.reverse());
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const chatRef = ref(database, `users/${auth.currentUser.uid}/chats/${chatId}`);
      await remove(chatRef);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
      Alert.alert('Error', 'Failed to delete chat');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('AIChat', { chatId: item.id, messages: item.messages })}
    >
      <View style={styles.chatInfo}>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.lastMessage}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Chat',
            'Are you sure you want to delete this chat?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => deleteChat(item.id), style: 'destructive' }
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.newChatButton}
        onPress={createNewChat}
      >
        <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
        <Text style={styles.newChatText}>New Chat</Text>
      </TouchableOpacity>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
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
    padding: theme.spacing.sm,
  },
  chatItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  newChatText: {
    color: '#FFFFFF',
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
}); 
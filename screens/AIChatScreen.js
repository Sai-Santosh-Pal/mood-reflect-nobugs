import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { theme } from '../themes';
import { Ionicons } from "@expo/vector-icons";
import Markdown from 'react-native-markdown-display';
import { startGeminiChat, getRemainingTime, getMessageCount } from '../utils/gemini';
import { auth, database } from '../firebase';
import { ref, set, push } from 'firebase/database';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AIChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState(
    route.params?.messages || [{
      id: 1,
      text: "Hello! I'm ReflectX, your mental health AI assistant. How can I help you today?",
      sender: 'ai'
    }]
  );
  const [chatId] = useState(route.params?.chatId);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);
  const chatRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [waitTime, setWaitTime] = useState(0);

  const handleNewChat = useCallback(() => {
    navigation.replace('AIChat', {
      chatId: null,
      messages: [{
        id: 1,
        text: "Hello! I'm your mental health AI assistant. How can I help you today?",
        sender: 'ai'
      }]
    });
  }, [navigation]);

  const handleHistory = useCallback(() => {
    navigation.navigate('ChatHistory');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 10 }}>
          <TouchableOpacity 
            onPress={() => {
              // console.log('History button pressed');
              navigation.navigate('ChatHistory');
            }}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => {
              // console.log('New chat button pressed');
              navigation.replace('AIChat', {
                chatId: null,
                messages: [{
                  id: 1,
                  text: "Hello! I'm your mental health AI assistant. How can I help you today?",
                  sender: 'ai'
                }]
              });
            }}
          >
            <Ionicons name="add-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const createNewChat = async (messages) => {
    try {
      const chatsRef = ref(database, `users/${auth.currentUser.uid}/chats`);
      const newChatRef = push(chatsRef);
      const timestamp = new Date().toISOString();
      
      await set(newChatRef, {
        timestamp,
        lastMessage: messages[messages.length - 1].text.substring(0, 100),
        messages
      });

      navigation.setParams({ chatId: newChatRef.key });
      
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const saveMessageToHistory = async (userMessage, aiMessage) => {
    if (messages.length <= 1) return;
    
    const currentMessages = [...messages, userMessage, aiMessage];
    
    try {
      if (!chatId) {
        await createNewChat(currentMessages);
      } else {
        const chatRef = ref(database, `users/${auth.currentUser.uid}/chats/${chatId}`);
        await set(chatRef, {
          messages: currentMessages,
          timestamp: new Date().toISOString(),
          lastMessage: aiMessage.text.substring(0, 100),
        });
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  const initializeChat = async () => {
    try {
      const chat = await startGeminiChat();
      chatRef.current = chat;
      setChatInitialized(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I'm having trouble connecting. Please try again later.",
        sender: 'ai',
      }]);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    let intervalId;
    if (waitTime > 0) {
      intervalId = setInterval(() => {
        setWaitTime(prev => Math.max(0, prev - 1000));
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [waitTime]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const remainingTime = getRemainingTime();
    if (remainingTime > 0) {
      setWaitTime(remainingTime);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        await initializeChat();
      }

      if (!chatRef.current) {
        throw new Error('Chat initialization failed');
      }

      // Call the Gemini chat's sendMessage method
      const result = await chatRef.current.sendMessage(userMessage.text);
      const responseText = result.response.text();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'ai',
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save messages to chat history
      await saveMessageToHistory(userMessage, aiMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        sender: 'ai',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message) => {
    return (
      <View style={styles.messageContentContainer}>
        <View style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userMessage : styles.aiMessage,
        ]}>
          <View style={[
            styles.bubbleContent,
            message.sender === 'user' ? styles.userBubbleContent : styles.aiBubbleContent
          ]}>
            {message.sender === 'ai' && (
              <View style={styles.iconContainer}>
                <Ionicons name="logo-android" size={16} color={theme.colors.primary} />
              </View>
            )}
            <View style={styles.textContainer}>
              {message.sender === 'user' ? (
                <Text style={[styles.messageText, styles.userMessageText]}>
                  {message.text}
                </Text>
              ) : (
                <Markdown style={{
                  body: styles.markdownBody,
                  paragraph: styles.markdownParagraph,
                  link: styles.markdownLink,
                  bullet_list: styles.markdownList,
                  ordered_list: styles.markdownList,
                  code_block: styles.markdownCodeBlock,
                  code_inline: styles.markdownCodeInline,
                  blockquote: styles.markdownBlockquote,
                }}>
                  {message.text}
                </Markdown>
              )}
            </View>
            {message.sender === 'user' && (
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle" size={16} color={theme.colors.primary} />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {messages.map((message) => (
          <View key={message.id}>
            {renderMessage(message)}
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            maxLength={500}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={!inputText.trim() || isLoading ? theme.colors.textSecondary : theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  messageContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  messageBubble: {
    flex: 1,
    maxWidth: '85%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
  },
  bubbleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userBubbleContent: {
    flexDirection: 'row-reverse',
  },
  aiBubbleContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    // marginTop: 10,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 4,
    // marginTop: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: `${theme.colors.primary}80`,
    marginLeft: 'auto',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.card,
  },
  messageText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    lineHeight: 22,
  },
  userMessageText: {
    color: theme.colors.text,
  },
  aiMessageText: {
    color: theme.colors.text,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
}); 
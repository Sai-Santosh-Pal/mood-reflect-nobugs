import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { auth, database } from '../firebase';
import {
  ref,
  get,
  push,
  query,
  orderByChild,
  update,
  remove,
} from 'firebase/database';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import AuthInput from '../components/auth/AuthInput';
import { generateDreamImage } from '../utils/dreamUtils';
import { theme } from '../themes';

const DREAM_TYPES = {
  LUCID: 'Lucid Dream',
  NIGHTMARE: 'Nightmare',
  RECURRING: 'Recurring Dream',
  VIVID: 'Vivid Dream',
  PROPHETIC: 'Prophetic Dream',
};

export default function DreamScreen() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dreamTitle, setDreamTitle] = useState('');
  const [dreamDescription, setDreamDescription] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    loadDreams();
  }, []);

  const loadDreams = async () => {
    try {
      const dreamsRef = ref(database, `users/${auth.currentUser.uid}/dreams`);
      const snapshot = await get(dreamsRef);
      
      if (snapshot.exists()) {
        const dreamsData = [];
        snapshot.forEach((child) => {
          dreamsData.push({
            id: child.key,
            ...child.val(),
          });
        });
        setDreams(dreamsData.reverse());
      }
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading dreams:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddDream = async () => {
    if (!dreamTitle.trim() || !dreamDescription.trim() || !selectedType) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setGeneratingImage(true);
      // Here you would call your AI image generation API
      const imageUrl = await generateDreamImage(dreamDescription);
      
      const dreamsRef = ref(database, `users/${auth.currentUser.uid}/dreams`);
      const newDreamRef = push(dreamsRef);
      
      await update(newDreamRef, {
        title: dreamTitle,
        description: dreamDescription,
        type: selectedType,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
      });

      setModalVisible(false);
      setDreamTitle('');
      setDreamDescription('');
      setSelectedType(null);
      loadDreams();
    } catch (error) {
      console.error('Error adding dream:', error);
      Alert.alert('Error', 'Failed to add dream');
    } finally {
      setGeneratingImage(false);
    }
  };

  const renderDream = ({ item }) => (
    <Card style={styles.dreamCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.dreamImage} />
      )}
      <View style={styles.dreamContent}>
        <Text style={styles.dreamTitle}>{item.title}</Text>
        <Text style={styles.dreamType}>{item.type}</Text>
        <Text style={styles.dreamDescription}>{item.description}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dreams}
        renderItem={renderDream}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadDreams} />
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Card style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Dream</Text>
            
            <AuthInput
              placeholder="Dream Title"
              value={dreamTitle}
              onChangeText={setDreamTitle}
            />
            
            <AuthInput
              placeholder="Dream Description"
              value={dreamDescription}
              onChangeText={setDreamDescription}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.typeContainer}>
              {Object.entries(DREAM_TYPES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeButton,
                    selectedType === value && styles.selectedType,
                  ]}
                  onPress={() => setSelectedType(value)}
                >
                  <Text style={styles.typeText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title={generatingImage ? 'Adding Dream...' : 'Add Dream'}
              onPress={handleAddDream}
              disabled={generatingImage}
            />
            
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              type="secondary"
            />
          </Card>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dreamCard: {
    margin: theme.spacing.sm,
  },
  dreamImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
  },
  dreamContent: {
    padding: theme.spacing.md,
  },
  dreamTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.bold,
    marginBottom: -10,
    // marginBottom: theme.spacing.xs,
  },
  dreamType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    // marginBottom: theme.spacing.xs,
  },
  dreamDescription: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.md,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.card,
  },
  selectedType: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
}); 
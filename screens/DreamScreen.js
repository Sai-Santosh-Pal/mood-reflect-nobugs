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
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/common/Card';
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

  const handleDeleteDream = (dreamId) => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const dreamRef = ref(database, `users/${auth.currentUser.uid}/dreams/${dreamId}`);
              await remove(dreamRef);
              setDreams((prev) => prev.filter((d) => d.id !== dreamId));
              Alert.alert('Success', 'Dream deleted successfully');
            } catch (error) {
              console.error('Error deleting dream:', error);
              Alert.alert('Error', 'Failed to delete dream');
            }
          },
        },
      ]
    );
  };

  const renderDream = ({ item }) => (
    <Card style={styles.dreamCard}>
      <View style={{ position: 'relative' }}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.dreamImage} />
        )}
        <TouchableOpacity
          onPress={() => handleDeleteDream(item.id)}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.dreamContent}>
        <View style={styles.titleRow}>
          <Text style={styles.dreamTitle}>{item.title}</Text>
        </View>
        <View style={styles.divider} />
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
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.pageTitle}>Dreams</Text>
            <View style={styles.overviewCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{dreams.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.dreamPositive }]}>
                    {dreams.filter(d => d.type === 'Lucid Dream' || d.type === 'Vivid Dream').length}
                  </Text>
                  <Text style={styles.statLabel}>Positive</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.dreamNeutral }]}>
                    {dreams.filter(d => d.type === 'Recurring Dream').length}
                  </Text>
                  <Text style={styles.statLabel}>Neutral</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.dreamNegative }]}>
                    {dreams.filter(d => d.type === 'Nightmare' || d.type === 'Prophetic Dream').length}
                  </Text>
                  <Text style={styles.statLabel}>Negative</Text>
                </View>
              </View>
              {dreams.length > 0 && (
                <View style={styles.barContainer}>
                  {(() => {
                    const positive = dreams.filter(d => d.type === 'Lucid Dream' || d.type === 'Vivid Dream').length;
                    const neutral = dreams.filter(d => d.type === 'Recurring Dream').length;
                    const negative = dreams.length - positive - neutral;
                    return (
                      <View style={styles.bar}>
                        {positive > 0 && <View style={[styles.barSegment, { flex: positive, backgroundColor: theme.colors.dreamPositive, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />}
                        {neutral > 0 && <View style={[styles.barSegment, { flex: neutral, backgroundColor: theme.colors.dreamNeutral }]} />}
                        {negative > 0 && <View style={[styles.barSegment, { flex: negative, backgroundColor: theme.colors.dreamNegative, borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />}
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadDreams} />
        }
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name="plus" size={20} color={theme.colors.black} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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

            <Text style={styles.typeLabel}>Dream Type</Text>
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
                  <Text style={[
                    styles.typeText,
                    selectedType === value && styles.selectedTypeText,
                  ]}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, generatingImage && { opacity: 0.5 }]}
              onPress={handleAddDream}
              disabled={generatingImage}
            >
              <Text style={styles.addBtnText}>
                {generatingImage ? 'Adding Dream...' : 'Add Dream'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundLight,
  },
  listContent: {
    paddingTop: 50,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginLeft: 20,
    marginBottom: 12,
  },
  overviewCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 16,
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
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  barContainer: {
    marginTop: 14,
  },
  bar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: theme.colors.divider,
  },
  barSegment: {
    height: 8,
  },
  dreamCard: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    padding: 0,
    overflow: 'hidden',
  },
  dreamImage: {
    width: '100%',
    height: 180,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: 6,
    zIndex: 2,
  },
  dreamContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dreamTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 10,
  },
  dreamType: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  dreamDescription: {
    fontSize: 15,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textDark,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
    lineHeight: 21,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 90,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundLight,
  },
  selectedType: {
    backgroundColor: theme.colors.primary,
  },
  typeText: {
    fontSize: 13,
    color: theme.colors.textDark,
    fontFamily: theme.fonts.medium,
  },
  selectedTypeText: {
    color: theme.colors.text,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
}); 
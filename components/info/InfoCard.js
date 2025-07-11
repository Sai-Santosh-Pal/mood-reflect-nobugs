import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { theme } from '../../themes';

export default function InfoCard({ title, description, imageUrl, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card, // Soft purple from theme
    borderRadius: theme.borderRadius.lg,
    width: 250,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 150,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text, // Changed from "#000000"
  },
  description: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text, // Changed from "#000000"
    opacity: 0.8,
  },
}); 
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
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    width: 250,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 140,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
    color: theme.colors.text,
  },
  description: {
    fontSize: 13,
    fontFamily: theme.fonts.regular,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
}); 
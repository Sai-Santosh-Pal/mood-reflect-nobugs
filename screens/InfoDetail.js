import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { theme } from '../themes';

export default function InfoDetail({ route }) {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.fullDescription}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    lineHeight: 24,
  },
}); 
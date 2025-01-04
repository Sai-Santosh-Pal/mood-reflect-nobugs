import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import InfoCard from './InfoCard';
import { theme } from '../../themes';

export default function InfoSection({ title, items }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContainer}
      >
        {items.map((item, index) => (
          <InfoCard 
            key={index}
            title={item.title}
            description={item.shortDescription}
            imageUrl={item.imageUrl}
            onPress={() => item.onPress(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: (theme.spacing.lg - 10),
    marginBottom: 10,
},
sectionTitle: {
    paddingLeft: 10,
    fontSize: 20,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
  },
  cardsContainer: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.md,
  },
}); 
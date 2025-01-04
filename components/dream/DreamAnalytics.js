import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { theme } from '../../themes';
import { getDreamCategoryCount } from '../../utils/dreamAnalytics';

const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.85;

const DREAM_TYPE_COLORS = {
  "Lucid Dream": "#FFD700", // Fresh Green
  "Vivid Dream": "#FEBE00", // Bright Blue
  "Recurring Dream": "#FFA500", // Orange
  Nightmare: "#FF4D4D", // Red
  "Prophetic Dream": "#FF0000", // Orange
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
  },
  strokeWidth: 2,
  useShadowColorFromDataset: true,
  propsForBackgroundLines: {
    strokeDasharray: '',
    strokeWidth: 0.5,
  },
  propsForLabels: {
    fontSize: 10,
  }
};

export default function DreamAnalytics({ dreamData }) {
  const [weeklyDreamData, setWeeklyDreamData] = useState(null);

  useEffect(() => {
    if (dreamData?.length > 0) {
      const chartData = getDreamCategoryCount(dreamData);
      setWeeklyDreamData(chartData);
    }
  }, [dreamData]);

  const dreamTypeCount = dreamData.reduce((acc, dream) => {
    acc[dream.type] = (acc[dream.type] || 0) + 1;
    return acc;
  }, {});

  const totalDreams = dreamData.length;
  const positiveCount = dreamData.filter(dream => 
    dream.type === 'Lucid Dream' || dream.type === 'Vivid Dream'
  ).length;
  const neutralCount = dreamData.filter(dream => 
    dream.type === 'Recurring Dream'
  ).length;
  const negativeCount = dreamData.filter(dream => 
    dream.type === 'Nightmare' || dream.type === 'Prophetic Dream'
  ).length;

  const positivePercentage = ((positiveCount / totalDreams) * 100).toFixed(1);
  const neutralPercentage = ((neutralCount / totalDreams) * 100).toFixed(1);
  const negativePercentage = ((negativeCount / totalDreams) * 100).toFixed(1);

  const pieChartData = Object.entries(dreamTypeCount).map(([type, count]) => ({
    name: type,
    population: count,
    color: DREAM_TYPE_COLORS[type],
    legendFontColor: theme.colors.text,
    legendFontSize: 14,
    legendFontFamily: theme.fonts.medium,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dream Analysis</Text>
      
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Dream Pattern Analysis</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statPercentage, { color: 'rgba(46, 204, 113, 1)' }]}>
              {positivePercentage}%
            </Text>
            <Text style={styles.statLabel}>Positive Dreams</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statPercentage, { color: 'rgba(241, 196, 15, 1)' }]}>
              {neutralPercentage}%
            </Text>
            <Text style={styles.statLabel}>Neutral Dreams</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statPercentage, { color: 'rgba(231, 76, 60, 1)' }]}>
              {negativePercentage}%
            </Text>
            <Text style={styles.statLabel}>Negative Dreams</Text>
          </View>
        </View>
        <Text style={styles.totalDreams}>Total Dreams: {totalDreams}</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartsContainer}
      >
        <View style={[styles.chartCard, { width: cardWidth }]}>
          <Text style={styles.chartTitle}>Dream Type Distribution</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieChartData}
              width={cardWidth - 40}
              height={200}
              chartConfig={{
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.text,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>

        {weeklyDreamData && (
          <View style={[styles.chartCard, { width: cardWidth }]}>
            <Text style={styles.chartTitle}>Weekly Dream Patterns</Text>
            <LineChart
              data={weeklyDreamData}
              width={cardWidth - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
              fromZero
              yAxisInterval={1}
              segments={4}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(46, 204, 113, 1)' }]} />
                <Text style={styles.legendText}>Positive Dreams</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(241, 196, 15, 1)' }]} />
                <Text style={styles.legendText}>Neutral Dreams</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(231, 76, 60, 1)' }]} />
                <Text style={styles.legendText}>Negative Dreams</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  chartCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  statsContainer: {
    marginBottom: theme.spacing.md,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.xs,
  },
  statsSubtitle: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
  },
  typeList: {
    marginTop: theme.spacing.md,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  typeText: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
  },
  percentageText: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
  },
  tip: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  analysisCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analysisTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statPercentage: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
    textAlign: 'center',
  },
  totalDreams: {
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
}); 
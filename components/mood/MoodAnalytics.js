import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { auth, database } from '../../firebase';
import { ref, get } from 'firebase/database';
import { theme } from '../../themes';
import { MOOD_TYPES } from '../../utils/moodTypes';
import RiskGauge from '../common/RiskGauge';
import { getMoodCategoryCount } from '../../utils/moodAnalytics';

const getLevel = (value) => {
  if (value <= 30) return "Low";
  if (value <= 70) return "Moderate";
  return "High";
};


const screenWidth = Dimensions.get('window').width;
const cardWidth = screenWidth * 0.85;

const getMoodColor = (moodType) => {
  const colors = {  
    VERY_HAPPY: theme.colors.moodVeryHappy,
    HAPPY: theme.colors.moodHappy,
    NEUTRAL: theme.colors.moodNeutralType,
    SAD: theme.colors.moodSad,
    VERY_SAD: theme.colors.moodVerySad,
  };
  return colors[moodType] || theme.colors.moodDefault;
};

const getRiskColor = (value) => {
  if (value <= 30) return theme.colors.riskLow;
  if (value <= 70) return theme.colors.riskModerate;
  return theme.colors.riskHigh;
};

const chartConfig = {
  backgroundColor: theme.colors.chartBackground,
  backgroundGradientFrom: theme.colors.chartBackground,
  backgroundGradientTo: theme.colors.chartBackground,
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
    strokeDasharray: '', // solid background lines
    strokeWidth: 0.5,
  },
  propsForLabels: {
    fontSize: 10,
  }
};

export default function MoodAnalytics({ moodData, depressionRisk = 0, tips = [] }) {
  const [weeklyMoodData, setWeeklyMoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    try {
      const moodsRef = ref(database, `users/${auth.currentUser.uid}/moods`);
      const snapshot = await get(moodsRef);

      if (snapshot.exists()) {
        const moods = [];
        snapshot.forEach((childSnapshot) => {
          moods.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });

        // Sort moods by timestamp
        moods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        const chartData = prepareLineChartData(moods);
        setWeeklyMoodData(chartData);
      }
    } catch (error) {
      console.error("Error loading mood data:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareLineChartData = (moods) => {
    if (!moods?.length) return null;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    const dailyMoods = last7Days.reduce((acc, date) => {
      acc[date] = {
        positive: 0,
        neutral: 0,
        negative: 0,
        count: 0,
      };
      return acc;
    }, {});

    moods.forEach((mood) => {
      const moodDate = new Date(mood.timestamp).toISOString().split("T")[0];
      if (dailyMoods[moodDate]) {
        if (mood.moodType === 'VERY_HAPPY' || mood.moodType === 'HAPPY') {
          dailyMoods[moodDate].positive++;
        } else if (mood.moodType === 'NEUTRAL') {
          dailyMoods[moodDate].neutral++;
        } else {
          dailyMoods[moodDate].negative++;
        }
        dailyMoods[moodDate].count++;
      }
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          data: last7Days.map(date => {
            const day = dailyMoods[date];
            return day.count > 0 ? (day.positive / day.count) * 100 : 0;
          }),
          color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`, // Gold for positive
          strokeWidth: 2,
        },
        {
          data: last7Days.map(date => {
            const day = dailyMoods[date];
            return day.count > 0 ? (day.neutral / day.count) * 100 : 0;
          }),
          color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange for neutral
          strokeWidth: 2,
        },
        {
          data: last7Days.map(date => {
            const day = dailyMoods[date];
            return day.count > 0 ? (day.negative / day.count) * 100 : 0;
          }),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Red for negative
          strokeWidth: 2,
        }
      ],
      legend: ['Positive', 'Neutral', 'Negative']
    };
  };

  if (!moodData || Object.keys(moodData).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No mood data available yet</Text>
        <Text style={styles.tip}>Start tracking your moods to see analytics!</Text>
      </View>
    );
  }

  const total = Object.values(moodData).reduce((sum, value) => sum + value, 0);

  // Prepare pie chart data with fixed colors
  const pieChartData = Object.entries(moodData).map(([key, value]) => ({
    name: MOOD_TYPES[key]?.label || key,
    population: value,
    color: getMoodColor(key),
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Mood Analysis</Text>
      
      {/* Charts ScrollView */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Pie Chart Card */}
        <View style={[styles.card, { width: cardWidth }]}>
          <Text style={styles.cardTitle}>Mood Distribution</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieChartData}
              width={cardWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                color: (opacity = 1) => `rgba(255, 215, 0, ${opacity})`,
                labelColor: (opacity = 1) => theme.colors.text,
                strokeWidth: 2,
                useShadowColorFromDataset: false,
                decimalPlaces: 0,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[cardWidth / 4 - 20, 0]}
              absolute
              hasLegend={false}
            />
            <View style={styles.pieLegendContainer}>
              {pieChartData.map((item, index) => (
                <View key={index} style={styles.pieLegendItem}>
                  <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.pieLegendLabel}>{item.name} ({item.population})</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Add new line chart card */}
        {weeklyMoodData && (
          <View style={[styles.card, { width: Dimensions.get('window').width - 48 }]}>
            <Text style={styles.cardTitle}>Weekly Mood Trends</Text>
            <LineChart
              data={weeklyMoodData}
              width={Dimensions.get('window').width - 80}
              height={220}
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
            {/* <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(46, 204, 113, 1)' }]} />
                <Text style={styles.legendText}>Positive</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(241, 196, 15, 1)' }]} />
                <Text style={styles.legendText}>Neutral</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(231, 76, 60, 1)' }]} />
                <Text style={styles.legendText}>Negative</Text>
              </View>
            </View> */}
          </View>
        )}
      </ScrollView>
        

      {/* Depression Risk Section */}
      <View style={styles.riskContainer}>
        <Text style={styles.riskTitle}>Depression Risk Assessment</Text>
        <View style={styles.riskWrapper}>
          <RiskGauge value={Math.round(depressionRisk)} size={220} />
          <Text style={[styles.riskValue, { color: getRiskColor(depressionRisk) }]}>
            {Math.round(depressionRisk)}%
          </Text>
          <Text style={styles.riskLevel}>{getLevel(depressionRisk)} Risk</Text>
        </View>
      </View>

      {/* Mood Distribution Details */}
      <View style={styles.statsContainer}>
        {Object.entries(moodData).map(([key, value]) => (
          <View key={key} style={styles.statItem}>
            <View style={styles.moodLabel}>
              <Text style={styles.emoji}>{MOOD_TYPES[key]?.emoji}</Text>
              <Text style={styles.moodType}>{MOOD_TYPES[key]?.label}</Text>
            </View>
            <Text style={styles.percentage}>
              {((value / total) * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>

      {/* AI Suggestions */}
      {tips && tips.length > 0 && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>AI Suggestions</Text>
          {tips.map((tip, index) => (
            <Text key={index} style={styles.tip}>• {tip}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  scrollContainer: {
    paddingRight: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    minWidth: 200,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  moodLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  moodType: {
    fontSize: 16,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
  percentage: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
  },
  tipsContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  tipsTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  tip: {
    fontSize: 14,
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  riskContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: 36,
    // marginBottom: theme.spacing.md,
  },
  riskTitle: {
    fontSize: 18,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  riskWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.md,
  },
  riskValue: {
    fontSize: 32,
    fontFamily: theme.fonts.bold,
    marginTop: 4,
    textAlign: 'center',
  },
  riskLevel: {
    fontSize: 14,
    fontFamily: theme.fonts.medium,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.textLight
  },
  pieLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.colors.white,
    borderRadius: 20,
  },
  pieLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  pieLegendLabel: {
    fontSize: 12,
    fontFamily: theme.fonts.medium,
    color: theme.colors.text,
  },
}); 
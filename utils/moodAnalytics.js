import { MOOD_TYPES } from './moodTypes';

export function analyzeMoods(entries) {
  // console.log('Analyzing moods:', entries);
  
  if (!entries || entries.length === 0) {
    return {
      distribution: {},
      depressionRisk: 0,
      suggestions: [],
    };
  }

  // Count occurrences of each mood type
  const distribution = entries.reduce((acc, entry) => {
    const moodType = entry.moodType;
    acc[moodType] = (acc[moodType] || 0) + 1;
    return acc;
  }, {});

  // console.log('Mood distribution:', distribution);

  // Calculate depression risk (simplified example)
  const negativeCount = entries.filter(entry => 
    MOOD_TYPES[entry.moodType]?.value <= 2
  ).length;
  
  const depressionRisk = (negativeCount / entries.length) * 100;

  // console.log('Depression risk:', depressionRisk);

  // Generate suggestions based on mood patterns
  const suggestions = generateSuggestions(distribution, depressionRisk);

  return {
    distribution,
    depressionRisk,
    suggestions,
  };
}

function generateSuggestions(distribution, risk) {
  const suggestions = [];

  if (risk >= 70) {
    suggestions.push(
      'Consider talking to a mental health professional',
      'Try to engage in activities you usually enjoy',
      'Reach out to friends or family for support'
    );
  } else if (risk >= 40) {
    suggestions.push(
      'Practice self-care activities',
      'Try meditation or mindfulness exercises',
      'Maintain a regular sleep schedule'
    );
  } else {
    suggestions.push(
      'Keep up the good work!',
      'Continue your positive activities',
      'Share your mood-boosting strategies with others'
    );
  }

  return suggestions;
}

export const getMoodCategoryCount = (moods) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  // Initialize data structure for last 7 days
  const dateLabels = [];
  const positiveData = [];
  const neutralData = [];
  const negativeData = [];

  // Create array of last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dateLabels.push(dateStr);
    positiveData[6-i] = 0;
    neutralData[6-i] = 0;
    negativeData[6-i] = 0;
  }

  // Process moods
  Object.values(moods || {}).forEach(mood => {
    const moodDate = new Date(mood.timestamp);
    const moodDateStr = moodDate.toISOString().split('T')[0];
    
    if (moodDate >= last7Days && dateLabels.includes(moodDateStr)) {
      const dayIndex = dateLabels.indexOf(moodDateStr);
      
      if (mood.moodType === 'VERY_HAPPY' || mood.moodType === 'HAPPY') {
        positiveData[dayIndex]++;
      } else if (mood.moodType === 'NEUTRAL') {
        neutralData[dayIndex]++;
      } else if (mood.moodType === 'SAD' || mood.moodType === 'VERY_SAD') {
        negativeData[dayIndex]++;
      }
    }
  });

  return {
    labels: dateLabels.map(date => date.slice(5)), // Show only MM-DD
    datasets: [
      {
        data: positiveData,
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // Green
        label: 'Positive'
      },
      {
        data: neutralData,
        color: (opacity = 1) => `rgba(241, 196, 15, ${opacity})`, // Yellow
        label: 'Neutral'
      },
      {
        data: negativeData,
        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`, // Red
        label: 'Negative'
      }
    ]
  };
}; 
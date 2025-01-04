export const getDreamCategoryCount = (dreams) => {
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

  // Process dreams
  dreams.forEach(dream => {
    const dreamDate = new Date(dream.timestamp);
    const dreamDateStr = dreamDate.toISOString().split('T')[0];
    
    if (dreamDate >= last7Days && dateLabels.includes(dreamDateStr)) {
      const dayIndex = dateLabels.indexOf(dreamDateStr);
      
      // Categorize dreams based on type
      if (dream.type === 'Lucid Dream' || dream.type === 'Vivid Dream') {
        positiveData[dayIndex]++;
      } else if (dream.type === 'Recurring Dream') {
        neutralData[dayIndex]++;
      } else {
        // Nightmares and Prophetic dreams
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
export const MOOD_TYPES = {
  VERY_HAPPY: {
    value: 5,
    emoji: "😄",
    image: require("../assets/emotions/very-happy.png"),
    label: "Very Happy",
  },
  HAPPY: {
    value: 4,
    emoji: "🙂",
    image: require("../assets/emotions/happy.png"),
    label: "Happy",
  },
  NEUTRAL: {
    value: 3,
    emoji: "😐",
    image: require("../assets/emotions/neutral.png"),
    label: "Neutral",
  },
  SAD: {
    value: 2,
    emoji: "😔",
    image: require("../assets/emotions/sad.png"),
    label: "Sad",
  },
  VERY_SAD: {
    value: 1,
    emoji: "😢",
    image: require("../assets/emotions/very-sad.png"),
    label: "Very Sad",
  },
};

export const DEPRESSION_THRESHOLDS = {
  HIGH: 2.0,
  MEDIUM: 3.0,
  LOW: 4.0
}; 
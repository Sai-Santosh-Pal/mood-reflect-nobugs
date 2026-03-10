export const MOOD_TYPES = {
  VERY_HAPPY: {
    value: 5,
    emoji: "😄",
    image: require("../assets/emotions/very-happy.png"),
    icon: "laugh-beam",
    label: "Very Happy",
  },
  HAPPY: {
    value: 4,
    emoji: "🙂",
    image: require("../assets/emotions/happy.png"),
    icon: "smile",
    label: "Happy",
  },
  NEUTRAL: {
    value: 3,
    emoji: "😐",
    image: require("../assets/emotions/neutral.png"),
    icon: "meh",
    label: "Neutral",
  },
  SAD: {
    value: 2,
    emoji: "😔",
    image: require("../assets/emotions/sad.png"),
    icon: "frown",
    label: "Sad",
  },
  VERY_SAD: {
    value: 1,
    emoji: "😢",
    image: require("../assets/emotions/very-sad.png"),
    icon: "sad-tear",
    label: "Very Sad",
  },
};

export const DEPRESSION_THRESHOLDS = {
  HIGH: 2.0,
  MEDIUM: 3.0,
  LOW: 4.0
}; 
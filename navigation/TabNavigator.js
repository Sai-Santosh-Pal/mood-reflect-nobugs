import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AllMoodsScreen from '../screens/AllMoodsScreen';
import AIChatScreen from '../screens/AIChatScreen';
import ChatHistoryScreen from '../screens/ChatHistoryScreen';
import DreamScreen from '../screens/DreamScreen';
import JournalScreen from '../screens/JournalScreen';
import GoalsScreen from '../screens/GoalsScreen';
import InfoDetail from '../screens/InfoDetail';
import { theme } from '../themes';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AnalyticsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AnalyticsTab" 
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AllMoods" 
        component={AllMoodsScreen}
        options={{ 
          headerShown: true,
          title: 'All Moods',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          },
        }}
      />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AIChat" 
        component={AIChatScreen}
        options={{
          title: 'AI Talk',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          }
        }}
      />
      <Stack.Screen 
        name="ChatHistory" 
        component={ChatHistoryScreen}
        options={{ 
          title: 'Chat History',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          }
        }}
      />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InfoDetail"
        component={InfoDetail}
        options={({ route }) => ({
          title: route.params.item.title,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          },
        })}
      />
      <Stack.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          headerShown: true,
          title: "Journal",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          },
        }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          headerShown: true,
          title: "Goals",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontFamily: theme.fonts.medium,
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home";
          } else if (route.name === "Analytics") {
            iconName = focused ? "bar-chart" : "bar-chart";
          } else if (route.name === "Community") {
            iconName = focused ? "people" : "people";
          } else if (route.name === "AI Talk") {
            iconName = focused ? "chat" : "chat";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person";
          } else if (route.name === "Dreams") {
            iconName = focused ? "cloud" : "cloud";
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Dreams"
        component={DreamScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cloud" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen
        name="AIChatTab"
        component={ChatStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={size}
              color={color}
            />
          ),
          tabBarLabel: "AI Talk",
          headerShown: false,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
} 
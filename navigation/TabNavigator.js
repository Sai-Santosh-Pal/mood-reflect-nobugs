import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FontAwesome6 } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
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
          title: 'ReflectX',
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

const TAB_ICONS = {
  Home: 'house',
  Dreams: 'cloud-moon',
  Analytics: 'chart-simple',
  Community: 'users',
  AIChatTab: 'robot',
  Profile: 'circle-user',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <View style={styles.tabBarWrapper}>
          <BottomTabBar {...props} safeAreaInsets={{ bottom: 0, top: 0 }} />
        </View>
      )}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const iconName = TAB_ICONS[route.name];
          return (
            <View style={[
              styles.circle,
              focused && styles.circleFocused,
            ]}>
              <FontAwesome6
                name={iconName}
                size={15}
                color={focused ? theme.colors.white : theme.colors.tabBarIconInactive}
                solid
              />
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 0,
          width: '80%',
          maxWidth: 400,
          height: 56,
          minHeight: 56,
          maxHeight: 56,
          borderRadius: 28,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'stretch',
          paddingHorizontal: 16,
          paddingVertical: 0,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 12,
        },
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
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="AIChatTab"
        component={ChatStack}
        options={{
          tabBarLabel: 'ReflectX',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.tabBarInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  circleFocused: {
    backgroundColor: theme.colors.tabBarActive,
  },
});

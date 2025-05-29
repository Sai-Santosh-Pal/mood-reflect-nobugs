import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import MainTabNavigator from './navigation/TabNavigator';
import AllMoodsScreen from './screens/AllMoodsScreen';
import { MoodContext } from './context/MoodContext';
import { getUserMoodEntries } from './utils/moodUtils';
import { theme } from './themes';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecentMoods = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const moods = await getUserMoodEntries(auth.currentUser.uid);
      setRecentMoods(moods);
    } catch (error) { 
      console.error('Error loading moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    loadRecentMoods();
  }, []);

  const loadFonts = async () => {
    await Font.loadAsync({
      "Inter-Black": require("./fonts/SF-Pro-Display-Black.otf"),
      "Inter-Bold": require("./fonts/SF-Pro-Display-Bold.otf"),
      "Inter-ExtraBold": require("./fonts/SF-Pro-Display-Heavy.otf"),
      "Inter-ExtraLight": require("./fonts/SF-Pro-Display-Thin.otf"),
      "Inter-Light": require("./fonts/SF-Pro-Display-Light.otf"),
      "Inter-Medium": require("./fonts/SF-Pro-Display-Medium.otf"),
      "Inter-Regular": require("./fonts/SF-Pro-Display-Regular.otf"),
      "Inter-SemiBold": require("./fonts/SF-Pro-Display-Semibold.otf"),
      "Inter-Thin": require("./fonts/SF-Pro-Display-Thin.otf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    Promise.all([
      loadFonts(),
      new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          if (initializing) setInitializing(false);
          resolve();
        });
        return unsubscribe;
      }),
    ]);
  }, []);

  useEffect(() => {
    loadRecentMoods();
  }, [user]);

  if (initializing || !fontsLoaded) return null;

  return (
    <MoodContext.Provider value={{ 
      refreshAnalytics, 
      refreshTrigger,
      recentMoods,
      loading,
      loadRecentMoods
    }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />
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
            </>
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MoodContext.Provider>
  );
}

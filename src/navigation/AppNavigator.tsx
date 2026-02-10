/**
 * Role-based navigation. App always opens with IntroScreen only (opening + loading).
 * IntroScreen is shown for at least MIN_INTRO_MS so loading visibly happens there; then Login.
 */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';

/** Minimum time IntroScreen is shown as opening/loading (ms). Ensures loading uses IntroScreen. */
const MIN_INTRO_MS = 2500;
import IntroScreen from '../screens/IntroScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ContactScreen from '../screens/ContactScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import LearnerHomeScreen from '../screens/LearnerHomeScreen';
import LearnerAllCoursesScreen from '../screens/LearnerAllCoursesScreen';
import LearnerProfileScreen from '../screens/LearnerProfileScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import FacultyDashboard from '../screens/FacultyDashboard';
import StudentDashboard from '../screens/StudentDashboard';
import CourseListScreen from '../screens/CourseListScreen';
import LearnerCourseViewScreen from '../screens/LearnerCourseViewScreen';
import VideoListScreen from '../screens/VideoListScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import LearnerNotificationsScreen from '../screens/LearnerNotificationsScreen';
import LearnerLiveClassScreen from '../screens/LearnerLiveClassScreen';
import Icon from '../components/Icon';
export type RootStackParamList = {
  Intro: { standalone?: boolean } | undefined;
  Login: undefined;
  Register: undefined;
  Contact: undefined;
  Chatbot: undefined;
  LearnerHome: undefined;
  LearnerAllCourses: { vertical?: string } | undefined;
  LearnerProfile: undefined;
  FacultyDashboard: undefined;
  StudentDashboard: undefined;
  CourseList: undefined;
  CourseDetail: { courseId: string };
  VideoList: { courseId: string };
  VideoPlayer: { videoUri: string; title: string };
  Notifications: undefined;
  LiveClasses: undefined;
  ProfileSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function FacultyStack() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerRight: () => (
            <View style={{ marginRight: 8 }}>
              <Icon
                name="contact_support"
                size={22}
                color="#0061A4"
                onPress={() => navigation.navigate('Chatbot')}
              />
            </View>
          ),
        })}
      >
        <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} options={{ title: 'Faculty Dashboard' }} />
        <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'My Courses' }} />
        <Stack.Screen name="CourseDetail" component={LearnerCourseViewScreen} options={{ title: 'Course' }} />
        <Stack.Screen name="VideoList" component={VideoListScreen} options={{ title: 'Recorded Videos' }} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: 'Video Player', headerShown: true, headerStyle: { backgroundColor: '#0a0e27' }, headerTintColor: '#ffffff' }} />
        <Stack.Screen name="Notifications" component={LearnerNotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="LiveClasses" component={LearnerLiveClassScreen} options={{ title: 'Live Classes', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Support' }} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chat Support' }} />
      </Stack.Navigator>
    </View>
  );
}

function StudentStack() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerRight: () => (
            <View style={{ marginRight: 8 }}>
              <Icon
                name="contact_support"
                size={22}
                color="#0061A4"
                onPress={() => navigation.navigate('Chatbot')}
              />
            </View>
          ),
        })}
      >
        <Stack.Screen
          name="LearnerHome"
          component={LearnerHomeScreen}
          options={{ title: 'GuruSetu', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }}
        />
        <Stack.Screen
          name="LearnerAllCourses"
          component={LearnerAllCoursesScreen}
          options={{ title: 'Courses', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }}
        />
        <Stack.Screen
          name="LearnerProfile"
          component={LearnerProfileScreen}
          options={{ title: 'Profile', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }}
        />
        <Stack.Screen
          name="ProfileSettings"
          component={ProfileSettingsScreen}
          options={{ title: 'Profile Settings', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }}
        />
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} options={{ title: 'My Learning' }} />
        <Stack.Screen name="CourseList" component={CourseListScreen} options={{ title: 'My Courses' }} />
        <Stack.Screen name="CourseDetail" component={LearnerCourseViewScreen} options={{ title: 'Course' }} />
        <Stack.Screen name="VideoList" component={VideoListScreen} options={{ title: 'Videos' }} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: 'Video Player', headerShown: true, headerStyle: { backgroundColor: '#0a0e27' }, headerTintColor: '#ffffff' }} />
        <Stack.Screen name="Notifications" component={LearnerNotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="LiveClasses" component={LearnerLiveClassScreen} options={{ title: 'Live Classes', headerStyle: { backgroundColor: '#101622' }, headerTintColor: '#f1f5f9' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'Contact Support' }} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Chat Support' }} />
      </Stack.Navigator>
    </View>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [introMinTimeElapsed, setIntroMinTimeElapsed] = useState(false);

  // Ensure IntroScreen is used for opening + loading for at least MIN_INTRO_MS
  useEffect(() => {
    const t = setTimeout(() => setIntroMinTimeElapsed(true), MIN_INTRO_MS);
    return () => clearTimeout(t);
  }, []);

  // Show IntroScreen only until BOTH loading is done AND minimum intro time has passed
  const showIntroAsOpeningAndLoading = isLoading || !introMinTimeElapsed;

  if (showIntroAsOpeningAndLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Intro" component={IntroScreen} initialParams={{ standalone: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  const isFaculty = role === 'Professor' || role === 'admin';

  return (
    <NavigationContainer
      onReady={() => console.log('Navigation ready')}
      onStateChange={(state) => state && console.log('Nav:', state.routes?.[state.index]?.name ?? state)}
    >
      {!isAuthenticated ? (
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Create Account' }} />
          <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: true, title: 'Contact Support' }} />
        </Stack.Navigator>
      ) : isFaculty ? (
        <FacultyStack />
      ) : (
        <StudentStack />
      )}
    </NavigationContainer>
  );
}

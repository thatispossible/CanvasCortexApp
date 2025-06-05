import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider } from './src/context/AppContext';
import ProjectsScreen from './src/screens/ProjectsScreen';
import KanbanScreen from './src/screens/KanbanScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ChatScreen from './src/screens/ChatScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Projects') {
                  iconName = focused ? 'folder' : 'folder-outline';
                } else if (route.name === 'Kanban') {
                  iconName = focused ? 'grid' : 'grid-outline';
                } else if (route.name === 'Calendar') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                } else if (route.name === 'Chat') {
                  iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#2196F3',
              tabBarInactiveTintColor: '#666',
              tabBarStyle: {
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E0E0E0',
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
              },
              headerShown: false,
            })}
          >
            <Tab.Screen
              name="Projects"
              component={ProjectsScreen}
              options={{
                tabBarLabel: 'Projects',
              }}
            />
            <Tab.Screen
              name="Kanban"
              component={KanbanScreen}
              options={{
                tabBarLabel: 'Kanban',
              }}
            />
            <Tab.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{
                tabBarLabel: 'Calendar',
              }}
            />
            <Tab.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                tabBarLabel: 'AI Chat',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </GestureHandlerRootView>
  );
};

export default App; 
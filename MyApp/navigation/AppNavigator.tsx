import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EmployeeDashboardScreen from '../screens/EmployeeDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function EmployeeTabs() {
  const { user } = useAuth();
  return (
    <Tab.Navigator screenOptions={{ headerTitleAlign: 'center', headerTintColor: '#2563eb' }}>
      <Tab.Screen name="Dashboard" component={EmployeeDashboardScreen} options={{ title: 'My Tickets' }} />
      {user?.role === 'EMPLOYEE' && (
        <Tab.Screen name="Raise Request" component={CreateRequestScreen} options={{ title: 'Raise Request' }} />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Screens based on role
          user.role === 'ADMIN' ? (
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerTitle: 'Admin Dashboard' }} />
          ) : (
            <Stack.Screen name="EmployeeTabs" component={EmployeeTabs} />
          )
        ) : (
          // Auth Screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ListDetailScreen } from './src/screens/ListDetailScreen';
import { ComparisonScreen } from './src/screens/ComparisonScreen';
import { PriceHistoryScreen } from './src/screens/PriceHistoryScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { CreateListScreen } from './src/screens/CreateListScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import BudgetDashboardScreen from './src/screens/BudgetDashboardScreen';
import { InflationDashboardScreen } from './src/screens/InflationDashboardScreen';
import AiAssistantScreen from './src/screens/AiAssistantScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import PremiumScreen from './src/screens/PremiumScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          id="app-stack"
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAFAFA' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={HomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateList" component={CreateListScreen} />
          <Stack.Screen name="ListDetail" component={ListDetailScreen} />
          <Stack.Screen name="Comparison" component={ComparisonScreen} />
          <Stack.Screen name="PriceHistory" component={PriceHistoryScreen} />
          <Stack.Screen name="Alerts" component={AlertsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen name="BudgetDashboard" component={BudgetDashboardScreen} />
          <Stack.Screen name="InflationDashboard" component={InflationDashboardScreen} />
          <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

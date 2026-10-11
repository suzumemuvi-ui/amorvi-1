import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { AmorviScreen, ChatsScreen, ConnectionsScreen, ConversationScreen, EditProfileScreen, HomeDesignScreen, LikesScreen, ProfileScreen, RadarScreen } from '../screens/DesignScreens';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen}/>
    <Stack.Screen name="EditProfile" component={EditProfileScreen}/>
    <Stack.Screen name="Likes" component={LikesScreen}/>
    <Stack.Screen name="Connections" component={ConnectionsScreen}/>
  </Stack.Navigator>;
}

function HomeStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="HomeMain" component={HomeDesignScreen}/></Stack.Navigator>;
}

function ChatStack() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatList" component={ChatsScreen}/>
    <Stack.Screen name="Conversation" component={ConversationScreen}/>
  </Stack.Navigator>;
}

export default function TabNavigator() {
  const { dark } = useTheme();
  const bg = dark ? '#07131d' : '#ffffff';
  const inactive = dark ? '#d0d6de' : '#28415e';
  const icon = (name: string) => ({ color, size }: any) => <Icon name={name} size={size} color={color}/>;
  return <Tab.Navigator screenOptions={{ headerShown:false, tabBarStyle:{ backgroundColor:bg, borderTopColor:dark?'#223342':'#e8ebef', height:67, paddingTop:5 }, tabBarActiveTintColor:'#ff075b', tabBarInactiveTintColor:inactive, tabBarLabelStyle:{fontSize:11,fontWeight:'600'} }}>
    <Tab.Screen name="Home" component={HomeStack} options={{tabBarIcon:icon('home-outline')}}/>
    <Tab.Screen name="Amorvi" component={AmorviScreen} options={{tabBarIcon:icon('flame-outline')}}/>
    <Tab.Screen name="Radar" component={RadarScreen} options={{tabBarIcon:icon('radio-button-on-outline')}}/>
    <Tab.Screen name="Chats" component={ChatStack} options={{tabBarIcon:icon('chatbubble-outline'), tabBarBadge:'3', tabBarBadgeStyle:{backgroundColor:'#ff075b',color:'#fff',fontSize:10}}}/>
    <Tab.Screen name="Profile" component={ProfileStack} options={{tabBarIcon:icon('person-outline')}}/>
  </Tab.Navigator>;
}

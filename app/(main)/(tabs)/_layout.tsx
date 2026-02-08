import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import {
  AlignJustify,
  Bell,
  Ellipsis,
  Home,
  LogOut,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Settings,
  User,
  Users,
  Video,
} from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

const TabLayout = () => {
  const router = useRouter();
  const { removeToken } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const dangerColor = useThemeColor({}, 'red');

  const HeaderActions = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-row items-center mr-1">{children}</View>
  );

  const ActionButton = ({
    icon,
    onPress,
    destructive = false,
  }: {
    icon: any;
    onPress?: () => void;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="mr-2 items-center justify-center rounded-full border border-border/70 bg-card p-2.5"
      activeOpacity={0.75}
    >
      <Icon as={icon} size={18} color={destructive ? dangerColor : textColor} />
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        headerStyle: { backgroundColor },
        headerTitleStyle: { fontSize: 20, fontWeight: '700', color: textColor },
        sceneStyle: { backgroundColor },
        tabBarStyle: {
          backgroundColor: cardColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 7,
          paddingBottom: 8,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: mutedColor,
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Home',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <Icon as={Home} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Plus} onPress={() => router.push('/(main)/(create)/post')} />
              <ActionButton
                icon={MessageCircle}
                onPress={() => router.push('/(main)/(chats)/main')}
              />
            </HeaderActions>
          ),
        }}
      />
      <Tabs.Screen
        name="friends/index"
        options={{
          title: 'Friends',
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color, size }) => <Icon as={Users} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Search} />
            </HeaderActions>
          ),
        }}
      />
      <Tabs.Screen
        name="reels/index"
        options={{
          title: 'Reels',
          tabBarLabel: 'Reels',
          tabBarIcon: ({ color, size }) => <Icon as={Video} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Plus} onPress={() => router.push('/(main)/(create)/reel')} />
              <ActionButton icon={Search} />
            </HeaderActions>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Icon as={User} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Pencil} />
              <ActionButton icon={Search} />
              <ActionButton
                icon={LogOut}
                destructive
                onPress={async () => {
                  await removeToken();
                  router.replace('/');
                }}
              />
            </HeaderActions>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: 'Activity',
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => <Icon as={Bell} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Ellipsis} />
              <ActionButton icon={Search} />
            </HeaderActions>
          ),
        }}
      />
      <Tabs.Screen
        name="menu/index"
        options={{
          title: 'Menu',
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => <Icon as={AlignJustify} size={size} color={color} />,
          headerRight: () => (
            <HeaderActions>
              <ActionButton icon={Settings} />
              <ActionButton icon={Search} />
            </HeaderActions>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

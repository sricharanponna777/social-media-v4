import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

import { useThemeColor } from '@/hooks/useThemeColor';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function MaterialTopTabsLayout() {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'textMuted');
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarActiveTintColor: text,
        tabBarInactiveTintColor: muted,
        tabBarStyle: { backgroundColor: card, elevation: 0, shadowOpacity: 0 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600', textTransform: 'none' },
        tabBarIndicatorStyle: {
          backgroundColor: primary,
          height: 3,
          borderRadius: 99,
        },
        sceneStyle: { backgroundColor: background },
      }}
    >
      <MaterialTopTabs.Screen name="post" options={{ tabBarLabel: 'Post' }} />
      <MaterialTopTabs.Screen name="story" options={{ tabBarLabel: 'Story' }} />
      <MaterialTopTabs.Screen name="reel" options={{ tabBarLabel: 'Reel' }} />
    </MaterialTopTabs>
  );
}

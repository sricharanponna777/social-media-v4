import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

import '../global.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/theme/theme-provider';
import { Colors } from '@/theme/colors';

Sentry.init({
  dsn: 'https://7e10365bc0eca8538e0947083d5a74a2@o4509768871772160.ingest.us.sentry.io/4509768883699712',
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
  // spotlight: __DEV__,
});

function InnerLayout() {
  const { token, isLoading } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'dark' ? Colors.dark.background : Colors.light.background;

  if (isLoading) {
    return <GestureHandlerRootView style={{ flex: 1, backgroundColor }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top', 'left', 'right']}>
          {token ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(main)" />
            </Stack>
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="index" />
            </Stack>
          )}
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <PortalHost />
        </SafeAreaView>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InnerLayout />
      </AuthProvider>
    </SafeAreaProvider>
  );
});

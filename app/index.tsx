import React from 'react';
import { View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (token) {
    return <Redirect href="/(main)/(tabs)/feed" />;
  }

  return (
    <View className="flex-1 justify-center bg-background px-6">
      <View className="absolute -right-24 -top-16 h-72 w-72 rounded-full bg-primary/15" />
      <View className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-accent/45" />

      <View className="rounded-3xl border border-border/70 bg-card/95 p-7 shadow-sm shadow-black/10">
        <Text className="text-4xl font-black tracking-tight text-foreground">Connect. Share. Grow.</Text>
        <Text className="mt-3 text-base leading-6 text-foreground/75">
          Join your community, post moments, and keep every conversation in one place.
        </Text>

        <View className="mt-8 gap-3">
          <Button onPress={() => router.replace('/login')} className="w-full">
            <Text>Login</Text>
          </Button>
          <Button variant="outline" onPress={() => router.replace('/register')} className="w-full">
            <Text>Create Account</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

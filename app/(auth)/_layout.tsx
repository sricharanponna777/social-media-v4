import React from 'react'
import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout() {
  const { token, isLoading } = useAuth();

  if (!isLoading && token) {
    return <Redirect href="/(main)/(tabs)/feed" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    />
  )
}

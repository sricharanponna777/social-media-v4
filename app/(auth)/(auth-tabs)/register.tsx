import apiService from '@/lib/api';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { View, Pressable, LogBox, Alert, TextInput } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '@/components/ui/text';
import { clsx } from 'clsx';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RegisterFields {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: number | null;
  mobileNumber: bigint | null;
}

export default function Register() {
  const router = useRouter();
  LogBox.ignoreAllLogs();
  const [registerFields, setRegisterFields] = useState<RegisterFields>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    countryCode: null,
    mobileNumber: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const muted = useThemeColor({}, 'mutedForeground');

  const updateField = <T extends keyof RegisterFields>(
    field: T,
    value: RegisterFields[T]
  ) => {
    setRegisterFields((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = Object.values(registerFields).every(
    (val) => val !== null && val !== ''
  );

  const handleRegister = async () => {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      countryCode,
      mobileNumber,
    } = registerFields;

    if (!isFormValid) return;

    try {
      const response = await apiService.registerUser({
        username,
        email,
        password,
        firstName,
        lastName,
        countryCode: countryCode as number,
        mobileNumber: mobileNumber?.toString() ?? '',
      });
      console.log('Register response:', response);
      await AsyncStorage.setItem('otp', response.otp);
      await AsyncStorage.setItem('email', response.user.email);
      await AsyncStorage.setItem('phone', response.user.mobile_number);
      Alert.alert('Registration Successful', 'Please check your email and phone to verify your account');
      router.replace('/(auth)/verify-otp');
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Registration Error', 'Please try again later');
    } finally {
      setRegisterFields({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        countryCode: null,
        mobileNumber: null,
      });
      
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-4" edges={['bottom']}>
      <View className="mx-1 my-6 gap-6">
      <View className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/10">
        <Text className="mb-2 text-xl font-semibold">Register</Text>
        <View className="gap-4">
          {/* First Name and Last Name in one row */}
          <View className="flex-row gap-3">
            <View className="flex-row items-center flex-1 rounded-lg border border-input bg-input/70 px-3">
              <User size={20} color={muted} />
              <TextInput
                className="flex-1 px-2 py-2 text-base text-foreground"
                placeholder="First Name"
                value={registerFields.firstName}
                onChangeText={(text: string) => updateField('firstName', text)}
                keyboardType="default"
              />
            </View>
            <View className="flex-row items-center flex-1 rounded-lg border border-input bg-input/70 px-3">
              <User size={20} color={muted} />
              <TextInput
                className="flex-1 px-2 py-2 text-base text-foreground"
                placeholder="Last Name"
                value={registerFields.lastName}
                onChangeText={(text: string) => updateField('lastName', text)}
                keyboardType="default"
              />
            </View>
          </View>

          <View className="flex-row items-center rounded-lg border border-input bg-input/70 px-3">
            <User size={20} color={muted} />
            <TextInput
              className="flex-1 px-2 py-2 text-base text-foreground"
              placeholder="Username"
              value={registerFields.username}
              onChangeText={(text: string) => updateField('username', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="flex-row items-center rounded-lg border border-input bg-input/70 px-3">
            <Mail size={20} color={muted} />
            <TextInput
              className="flex-1 px-2 py-2 text-base text-foreground"
              placeholder="Email"
              value={registerFields.email}
              onChangeText={(text: string) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              spellCheck={false}
            />
          </View>

          <View className="flex-row items-center rounded-lg border border-input bg-input/70 px-3">
            <Lock size={20} color={muted} />
            <TextInput
              className="flex-1 px-2 py-2 text-base text-foreground"
              placeholder="Password"
              value={registerFields.password}
              onChangeText={(text: string) => updateField('password', text)}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={22} color={muted} />
              ) : (
                <Eye size={22} color={muted} />
              )}
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            {/* Country Code */}
            <View className="flex-[0.7] flex-row items-center rounded-lg border border-input bg-input/70 px-3">
              <Text className="mr-1 text-base text-foreground">+</Text>
              <TextInput
                className="flex-1 px-1 py-2 text-base text-foreground"
                placeholder=""
                value={registerFields.countryCode?.toString() ?? ''}
                onChangeText={(text: string) => {
                  const num = parseInt(text);
                  updateField('countryCode', isNaN(num) ? null : num);
                }}
                keyboardType="numeric"
              />
            </View>

            {/* Phone Number */}
            <View className="flex-[2] flex-row items-center rounded-lg border border-input bg-input/70 px-3">
              <Phone size={20} color={muted} />
              <TextInput
                className="flex-1 px-2 py-2 text-base text-foreground"
                placeholder="Phone"
                value={registerFields.mobileNumber?.toString() ?? ''}
                onChangeText={(text: string) => {
                  if (text === '') {
                    updateField('mobileNumber', null);
                  } else {
                    try {
                      const number = BigInt(text);
                      updateField('mobileNumber', number);
                    } catch {
                      updateField('mobileNumber', null);
                    }
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </View>

      <Button
        onPress={handleRegister}
        disabled={!isFormValid}
        className={clsx('mt-2', {
          'bg-primary': isFormValid,
          'bg-muted': !isFormValid,
        })}
      >
        <Text className={isFormValid ? 'text-primary-foreground' : 'text-foreground/60'}>Register</Text>
      </Button>
      </View>
    </SafeAreaView>
  );
}

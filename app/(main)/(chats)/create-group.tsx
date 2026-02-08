import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableOpacity as Button, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckSquare, Search, Square } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Input as TextInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useThemeColor } from '@/hooks/useThemeColor';
import apiService from '@/lib/api';

type User = { id: string; friend_id?: string; username: string; avatar_url?: string | null };

export default function CreateGroup() {
  const router = useRouter();
  const [friends, setFriends] = useState<User[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'textMuted');

  const loadFriends = useCallback(async () => {
    try {
      const data: User[] = await apiService.getFriends();
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load friends', e);
      setFriends([]);
    }
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((friend) => friend.username.toLowerCase().includes(q));
  }, [friends, search]);

  const getInitial = useCallback((username: string) => {
    return username.trim().charAt(0).toUpperCase() || '?';
  }, []);

  const create = useCallback(async () => {
    if (!title.trim() || selectedIds.length === 0 || isCreating) return;
    try {
      setIsCreating(true);
      const conv = await apiService.createConversation({
        title: title.trim(),
        participants: selectedIds,
        type: 'group',
      });
      router.replace({ pathname: '/(main)/(chats)/[id]', params: { id: conv.id } });
    } catch (e) {
      console.error('Failed to create group', e);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, router, selectedIds, title]);

  const renderItem = useCallback(
    ({ item }: { item: User }) => {
      const friendId = item.friend_id ?? item.id;
      const isSel = !!selected[friendId];
      return (
        <Button
          onPress={() => toggle(friendId)}
          className="mx-3 my-1.5 flex-row items-center justify-between rounded-2xl border border-border/70 bg-card/95 px-3 py-3"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
              <Text className="text-sm font-semibold text-primary">{getInitial(item.username)}</Text>
            </View>
            <Text className="text-[15px] text-foreground">{item.username}</Text>
          </View>
          <Icon as={isSel ? CheckSquare : Square} size={22} color={isSel ? primaryColor : mutedColor} />
        </Button>
      );
    },
    [getInitial, mutedColor, primaryColor, selected, toggle]
  );

  const canCreate = title.trim() && selectedIds.length > 0 && !isCreating;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <Button
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
          >
            <Icon as={ArrowLeft} size={20} />
          </Button>
          <Text className="text-xl font-semibold text-foreground">Create Group</Text>
          <View className="h-10 w-10" />
        </View>
      </View>
      <View className="px-4 pb-3">
        <TextInput placeholder="Group name" value={title} onChangeText={setTitle} />
        <View className="mt-3 flex-row items-center gap-2 rounded-2xl border border-border bg-input/70 px-3">
          <Icon as={Search} size={16} color={mutedColor} />
          <TextInput
            placeholder="Search friends"
            value={search}
            onChangeText={setSearch}
            className="flex-1 border-0 bg-transparent px-0 shadow-none"
          />
        </View>
        <Text className="mt-2 text-sm text-foreground/65">{selectedIds.length} selected</Text>
      </View>
      <FlatList
        data={filteredFriends}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="px-4 py-12 text-center text-foreground/70">
            {search.trim() ? 'No friends match your search' : 'No friends available'}
          </Text>
        }
      />
      <Button
        onPress={create}
        disabled={!canCreate}
        className={`m-4 h-12 items-center justify-center rounded-full ${canCreate ? 'bg-primary' : 'bg-muted'}`}
      >
        <Text className={canCreate ? 'text-primary-foreground' : 'text-foreground/60'}>
          {isCreating ? 'Creating...' : 'Create Group'}
        </Text>
      </Button>
    </SafeAreaView>
  );
}

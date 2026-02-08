import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, TouchableOpacity as Button, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MessageCircle, Plus, Search, Users } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Input as TextInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import apiService from '@/lib/api';

type Conversation = {
  id: string;
  title?: string | null;
  type: 'private' | 'group';
  other_username?: string | null;
  last_message?: string | null;
  last_message_sender_id?: string | null;
  last_message_type?: 'text' | 'image' | 'video' | 'file' | 'audio' | null;
  last_message_media_url?: string | null;
  last_message_created_at?: string | null;
  unread_count?: number;
  last_message_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

const getConversationName = (conversation: Conversation) => {
  if (conversation.type === 'group') {
    return conversation.title?.trim() || 'Group Chat';
  }
  return conversation.other_username ? `@${conversation.other_username}` : 'Direct Message';
};

const getPreview = (conversation: Conversation, currentUserId?: string) => {
  const senderPrefix =
    conversation.last_message_sender_id && currentUserId && conversation.last_message_sender_id === currentUserId
      ? 'You: '
      : '';

  if (conversation.last_message?.trim()) {
    return `${senderPrefix}${conversation.last_message.trim()}`;
  }

  if (conversation.last_message_media_url) {
    const mediaLabel = conversation.last_message_type === 'image' ? 'Photo' : 'Attachment';
    return `${senderPrefix}[${mediaLabel}]`;
  }

  return 'No messages yet';
};

const getTimeLabel = (raw?: string | null) => {
  if (!raw) return '';
  const ts = new Date(raw).getTime();
  if (Number.isNaN(ts)) return '';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(raw).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getInitial = (name: string) => {
  const normalized = name.replace(/^@/, '').trim();
  if (!normalized) return '?';
  return normalized.charAt(0).toUpperCase();
};

export default function Chats() {
  const router = useRouter();
  const { onNewMessage } = useSocket();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'textMuted');

  const normalizeConversation = useCallback((item: any): Conversation => {
    const unreadRaw = item?.unread_count;
    const unreadCount =
      typeof unreadRaw === 'string' ? parseInt(unreadRaw, 10) : Number.isFinite(unreadRaw) ? unreadRaw : 0;
    return {
      ...item,
      unread_count: Number.isFinite(unreadCount) ? unreadCount : 0,
    };
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data: any[] = await apiService.getConversations(1, 50);
      const normalized = Array.isArray(data) ? data.map(normalizeConversation) : [];
      setConversations(normalized);
    } catch (e) {
      console.error('Failed to load conversations', e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeConversation]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  useEffect(() => {
    const offNewMessage = onNewMessage((message: any) => {
      const conversationId = message?.conversation_id;
      if (!conversationId) return;

      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === conversationId);
        if (index === -1) {
          loadConversations();
          return prev;
        }

        const current = prev[index];
        const isMine = Boolean(user?.id && message?.sender_id === user.id);
        const updatedConversation: Conversation = {
          ...current,
          last_message: message?.message || current.last_message || null,
          last_message_type: message?.message_type || current.last_message_type || 'text',
          last_message_media_url: message?.media_url || current.last_message_media_url || null,
          last_message_sender_id: message?.sender_id || current.last_message_sender_id || null,
          last_message_created_at: message?.created_at || current.last_message_created_at || null,
          last_message_at: message?.created_at || current.last_message_at || null,
          updated_at: message?.created_at || current.updated_at || current.created_at,
          unread_count: isMine ? (current.unread_count || 0) : (current.unread_count || 0) + 1,
        };

        const next = [...prev];
        next.splice(index, 1);
        return [updatedConversation, ...next];
      });
    });

    return () => offNewMessage();
  }, [loadConversations, onNewMessage, user?.id]);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => {
      const name = getConversationName(conversation).toLowerCase();
      const preview = getPreview(conversation, user?.id).toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, search, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => {
      const count = item.unread_count || 0;
      const name = getConversationName(item);
      const preview = getPreview(item, user?.id);
      const activityTime = getTimeLabel(
        item.last_message_created_at || item.last_message_at || item.updated_at || item.created_at
      );
      const hasUnread = count > 0;
      return (
        <Button
          onPress={() => {
            setConversations((prev) =>
              prev.map((conversation) =>
                conversation.id === item.id ? { ...conversation, unread_count: 0 } : conversation
              )
            );
            router.push({ pathname: '/(main)/(chats)/[id]', params: { id: item.id } });
          }}
          className="mx-3 my-1.5 flex-row items-center justify-between rounded-2xl border border-border/70 bg-card/95 px-3 py-3"
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/15">
              {item.type === 'group' ? (
                <Icon as={Users} size={18} color={primaryColor} />
              ) : (
                <Text className="text-base font-semibold text-primary">{getInitial(name)}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className={`text-[15px] ${hasUnread ? 'font-semibold text-foreground' : 'text-foreground'}`}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text className={`mt-0.5 text-[12px] ${hasUnread ? 'text-foreground/85' : 'text-foreground/60'}`} numberOfLines={1}>
                {preview}
              </Text>
            </View>
          </View>
          <View className="ml-3 items-end">
            <Text className="text-[11px] text-foreground/55">{activityTime}</Text>
            {hasUnread && (
              <View className="mt-1 h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5">
                <Text className="text-[11px] font-semibold text-primary-foreground">{count > 99 ? '99+' : count}</Text>
              </View>
            )}
          </View>
        </Button>
      );
    },
    [primaryColor, router, user?.id]
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pb-3 pt-2">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Chats</Text>
            <Text className="text-sm text-foreground/65">Messages and groups</Text>
          </View>
          <Button
            onPress={() => {
              router.push('/(main)/(chats)/create-group');
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary shadow-sm shadow-black/10"
          >
            <Icon as={Plus} size={20} color="white" />
          </Button>
        </View>
      </View>
      <View className="px-4 pb-3">
        <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-input/70 px-3">
          <Icon as={Search} size={16} color={mutedColor} />
          <TextInput
            placeholder="Search chats"
            value={search}
            onChangeText={setSearch}
            className="flex-1 border-0 bg-transparent px-0 shadow-none"
          />
        </View>
      </View>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center px-8 py-16">
            <Icon as={MessageCircle} size={28} color={mutedColor} />
            <Text className="mt-3 text-base text-foreground/80">
              {search.trim() ? 'No chats match your search' : 'No conversations yet'}
            </Text>
            {!search.trim() && (
              <Text className="mt-1 text-center text-sm text-foreground/60">
                Start a private chat or create a group.
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

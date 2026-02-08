import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity as Button,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Input as TextInput } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import apiService from '@/lib/api';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type?: 'text' | 'image' | 'video' | 'file' | 'audio';
  media_url?: string | null;
  created_at: string;
  sender_username?: string;
  sender_full_name?: string;
};

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const router = useRouter();
  const { joinConversation, onNewMessage, sendMessage, typingStart, typingStop, onTypingStatus, isConnected } =
    useSocket();
  const { user } = useAuth();
  const mutedColor = useThemeColor({}, 'textMuted');
  const primaryColor = useThemeColor({}, 'primary');
  const [messages, setMessages] = useState<Message[]>([]);
  const [headerTitle, setHeaderTitle] = useState<string>('Chat');
  const [conversationType, setConversationType] = useState<'private' | 'group' | undefined>(undefined);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyboardOffset = Platform.select({ ios: 66, android: 0 });
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const animatingRef = useRef(false);
  const listRef = useRef<FlatList<Message> | null>(null);

  const appendUniqueMessage = useCallback((prev: Message[], nextMessage: Message) => {
    if (prev.some((message) => message.id === nextMessage.id)) {
      return prev;
    }
    return [...prev, nextMessage];
  }, []);

  const getTimeLabel = useCallback((raw: string) => {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data: any = await apiService.getMessages(conversationId, 1, 50);
      if (Array.isArray(data)) {
        setMessages(data as Message[]);
      } else {
        setMessages((data.messages || []) as Message[]);
        const convo = data.conversation;
        if (convo) {
          if (convo.type === 'private' && convo.other_user) {
            setHeaderTitle(convo.other_user.username ? `@${convo.other_user.username}` : 'Direct Message');
          } else if (convo.title) {
            setHeaderTitle(convo.title);
          } else if (convo.type === 'group') {
            setHeaderTitle('Group Chat');
          } else {
            setHeaderTitle('Chat');
          }
          setConversationType(convo.type as 'private' | 'group');
        }
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    fetchMessages();

    const offNewMessage = onNewMessage((msg: Message) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => appendUniqueMessage(prev, msg));
        setIsTyping(false);
      }
    });

    const offTyping = onTypingStatus(({ conversationId: cId, isTyping }) => {
      if (cId === conversationId) setIsTyping(isTyping);
    });

    return () => {
      offNewMessage();
      offTyping();
    };
  }, [appendUniqueMessage, conversationId, fetchMessages, joinConversation, onNewMessage, onTypingStatus]);

  useEffect(() => {
    if (!messages.length) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    const animate = () => {
      if (!animatingRef.current) return;
      Animated.parallel([
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0.2, duration: 220, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(140),
          Animated.timing(dot2, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.2, duration: 220, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(280),
          Animated.timing(dot3, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.2, duration: 220, useNativeDriver: true }),
        ]),
      ]).start(({ finished }) => {
        if (finished && animatingRef.current) animate();
      });
    };

    if (isTyping) {
      animatingRef.current = true;
      dot1.setValue(0.2);
      dot2.setValue(0.2);
      dot3.setValue(0.2);
      animate();
    } else {
      animatingRef.current = false;
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      dot1.setValue(0);
      dot2.setValue(0);
      dot3.setValue(0);
    }
    return () => {
      animatingRef.current = false;
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [isTyping, dot1, dot2, dot3]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || !conversationId) return;
    setInput('');
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingStop(conversationId);

    try {
      if (isConnected) {
        sendMessage({ conversationId, content });
      } else {
        const created = await apiService.sendMessage(conversationId, content);
        if (created?.id) {
          setMessages((prev) => appendUniqueMessage(prev, created as Message));
        }
      }
    } catch (e) {
      console.error('Failed to send message', e);
    }
  }, [appendUniqueMessage, conversationId, input, isConnected, sendMessage, typingStop]);

  const handleTyping = useCallback(
    (text: string) => {
      setInput(text);
      if (!conversationId) return;
      if (text.trim()) {
        typingStart(conversationId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => typingStop(conversationId), 1000);
      } else {
        typingStop(conversationId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    },
    [conversationId, typingStart, typingStop]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isMine = user?.id && item.sender_id === user.id;
      const isGroup = conversationType === 'group';
      const topMarginClass = item.sender_username ? 'mt-2' : 'mt-0.5';
      return (
        <View className={`${topMarginClass} mb-1.5`}>
          {isGroup && !isMine && item.sender_username ? (
            <Text className="mb-0.5 ml-1 text-xs text-foreground/65">@{item.sender_username}</Text>
          ) : null}
          <View
            className={`max-w-[82%] rounded-2xl px-4 py-2 ${
              isMine
                ? 'self-end rounded-br-md bg-primary'
                : 'self-start rounded-bl-md border border-border/60 bg-secondary'
            }`}
          >
            <Text className={isMine ? 'text-primary-foreground' : 'text-foreground'}>
              {item.message || (item.media_url ? '[Attachment]' : '')}
            </Text>
          </View>
          <View className={isMine ? 'items-end pr-1' : 'items-start pl-1'}>
            <Text className="mt-0.5 text-[10px] text-foreground/50">{getTimeLabel(item.created_at)}</Text>
          </View>
        </View>
      );
    },
    [conversationType, getTimeLabel, user?.id]
  );

  const canSend = Boolean(input.trim());

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center border-b border-border px-3 py-3">
        <Button
          onPress={() => router.back()}
          className="mr-2 h-10 w-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <Icon as={ArrowLeft} size={20} />
        </Button>
        <View>
          <Text className="text-lg font-semibold text-foreground">{headerTitle}</Text>
          <Text className="text-[11px] text-foreground/60">
            {conversationType === 'group' ? 'Group chat' : 'Direct message'}
          </Text>
        </View>
      </View>
      <View className="flex-1 p-3">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Icon as={MessageCircle} size={24} color={mutedColor} />
              <Text className="mt-3 text-sm text-foreground/70">No messages yet</Text>
            </View>
          }
        />
        {isTyping && (
          <View className="flex-row items-center px-2 py-1">
            <Animated.View style={{ opacity: dot1, backgroundColor: primaryColor }} className="mx-0.5 h-2 w-2 rounded-full" />
            <Animated.View style={{ opacity: dot2, backgroundColor: primaryColor }} className="mx-0.5 h-2 w-2 rounded-full" />
            <Animated.View style={{ opacity: dot3, backgroundColor: primaryColor }} className="mx-0.5 h-2 w-2 rounded-full" />
          </View>
        )}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        <View className="flex-row items-center gap-2 border-t border-border bg-background p-3">
          <TextInput
            placeholder="Message"
            value={input}
            onChangeText={handleTyping}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="flex-1"
            autoComplete="off"
          />
          <Button
            onPress={handleSend}
            disabled={!canSend}
            className={`h-12 w-12 items-center justify-center rounded-full ${canSend ? 'bg-primary' : 'bg-muted'}`}
          >
            <Icon as={Send} size={20} color={canSend ? 'white' : mutedColor} />
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

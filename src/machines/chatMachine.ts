// @ts-ignore
import { setup, assign } from 'xstate';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface ChatContext {
  conversations: Record<string, Message[]>;
  currentConversationId: string | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  lastMessageTime: number;
}

type ChatEvent =
  | { type: 'OPEN_CONVERSATION'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: { content: string; receiverId: string } }
  | { type: 'SEND_SUCCESS'; payload: Message }
  | { type: 'SEND_ERROR'; payload: string }
  | { type: 'LOAD_MESSAGES'; payload: string }
  | { type: 'LOAD_SUCCESS'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'CLOSE_CONVERSATION' };

/**
 * Chat State Machine
 * Manages real-time chat functionality
 */
export const chatMachine = setup({
  types: {
    context: {} as ChatContext,
    events: {} as ChatEvent,
  },
  actions: {
    openConversation: assign({
      currentConversationId: ({ event }: { event: any }) =>
        event.type === 'OPEN_CONVERSATION' ? event.payload : null,
    }),
    addMessage: assign({
      conversations: ({ context, event }: { context: ChatContext; event: any }) => {
        if (event.type !== 'SEND_SUCCESS') return context.conversations;
        const convId = context.currentConversationId;
        if (!convId) return context.conversations;
        return {
          ...context.conversations,
          [convId]: [...(context.conversations[convId] || []), event.payload],
        };
      },
      lastMessageTime: ({ event }: { event: any }) =>
        event.type === 'SEND_SUCCESS' ? Date.now() : 0,
    }),
    setMessages: assign({
      conversations: ({ context, event }: { context: ChatContext; event: any }) => {
        if (event.type !== 'LOAD_SUCCESS') return context.conversations;
        return {
          ...context.conversations,
          [event.payload.conversationId]: event.payload.messages,
        };
      },
    }),
    setError: assign({
      error: ({ event }: { event: any }) =>
        event.type === 'SEND_ERROR' ? event.payload : null,
    }),
    updateUnreadCount: assign({
      unreadCount: ({ context }: { context: ChatContext }) => {
        let count = 0;
        Object.values(context.conversations).forEach((messages: Message[]) => {
          count += messages.filter((m: Message) => !m.read).length;
        });
        return count;
      },
    }),
    setLoading: assign({
      loading: true,
    }),
    clearLoading: assign({
      loading: false,
    }),
  },
  guards: {
    hasConversation: ({ context }: { context: ChatContext }) =>
      context.currentConversationId !== null,
  },
}).createMachine({
  id: 'chat',
  initial: 'idle',
  context: {
    conversations: {},
    currentConversationId: null,
    unreadCount: 0,
    loading: false,
    error: null,
    lastMessageTime: 0,
  },
  states: {
    idle: {
      on: {
        OPEN_CONVERSATION: {
          target: 'loadingMessages',
          actions: 'openConversation',
        },
      },
    },
    loadingMessages: {
      entry: 'setLoading',
      invoke: {
        src: 'loadMessages',
        onDone: {
          target: 'conversationOpen',
          actions: ['setMessages', 'clearLoading', 'updateUnreadCount'],
        },
        onError: {
          target: 'idle',
          actions: ['setError', 'clearLoading'],
        },
      },
    },
    conversationOpen: {
      on: {
        SEND_MESSAGE: 'sendingMessage',
        LOAD_MESSAGES: {
          target: 'loadingMessages',
        },
        CLOSE_CONVERSATION: {
          target: 'idle',
          actions: assign({
            currentConversationId: null,
          }),
        },
        MARK_AS_READ: {
          actions: 'updateUnreadCount',
        },
      },
    },
    sendingMessage: {
      invoke: {
        src: 'sendMessage',
        onDone: {
          target: 'conversationOpen',
          actions: ['addMessage', 'updateUnreadCount'],
        },
        onError: {
          target: 'conversationOpen',
          actions: 'setError',
        },
      },
    },
  },
});

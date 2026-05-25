// @ts-ignore
import { setup, assign } from 'xstate';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  bio: string;
  verified: boolean;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

interface UserContext {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

type UserEvent =
  | { type: 'LOAD_USERS' }
  | { type: 'LOAD_SUCCESS'; payload: User[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_LOCATION'; payload: { latitude: number; longitude: number } }
  | { type: 'VERIFY_USER' }
  | { type: 'VERIFY_SUCCESS' }
  | { type: 'VERIFY_ERROR'; payload: string };

/**
 * User State Machine
 * Manages user data and profile state
 */
export const userMachine = setup({
  types: {
    context: {} as UserContext,
    events: {} as UserEvent,
  },
  actions: {
    setUsers: assign({
      users: ({ event }: { event: any }) =>
        event.type === 'LOAD_SUCCESS' ? event.payload : [],
    }),
    setCurrentUser: assign({
      currentUser: ({ event }: { event: any }) =>
        event.type === 'UPDATE_USER' ? event.payload : null,
    }),
    updateLocation: assign({
      currentUser: ({ context, event }: { context: UserContext; event: any }) =>
        context.currentUser
          ? {
              ...context.currentUser,
              location: event.payload,
            }
          : null,
    }),
    setError: assign({
      error: ({ event }: { event: any }) =>
        event.type === 'LOAD_ERROR' ? event.payload : null,
    }),
    setLoading: assign({
      loading: true,
    }),
    clearLoading: assign({
      loading: false,
    }),
  },
}).createMachine({
  id: 'user',
  initial: 'idle',
  context: {
    currentUser: null,
    users: [],
    loading: false,
    error: null,
  },
  states: {
    idle: {
      on: {
        LOAD_USERS: 'loading',
      },
    },
    loading: {
      entry: 'setLoading',
      invoke: {
        src: 'fetchUsers',
        onDone: {
          target: 'loaded',
          actions: ['setUsers', 'clearLoading'],
        },
        onError: {
          target: 'error',
          actions: 'setError',
        },
      },
    },
    loaded: {
      on: {
        UPDATE_USER: {
          actions: 'setCurrentUser',
        },
        UPDATE_LOCATION: {
          actions: 'updateLocation',
        },
        VERIFY_USER: 'verifying',
        LOAD_USERS: 'loading',
      },
    },
    verifying: {
      invoke: {
        src: 'verifyUser',
        onDone: {
          target: 'verified',
        },
        onError: {
          target: 'loaded',
          actions: 'setError',
        },
      },
    },
    verified: {
      on: {
        LOAD_USERS: 'loading',
        UPDATE_USER: {
          actions: 'setCurrentUser',
        },
      },
    },
    error: {
      on: {
        LOAD_USERS: 'loading',
      },
    },
  },
});

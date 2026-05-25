// @ts-ignore - XState imports
import { setup, assign } from 'xstate';

interface AuthContext {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  error: string | null;
  attempt: number;
}

type AuthEvent =
  | { type: 'TOGGLE_MODE' }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_CONFIRM_PASSWORD'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SUBMIT' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'RESET' };

/**
 * Authentication State Machine
 * Manages authentication flow with validation
 */
export const authMachine = setup({
  types: {
    context: {} as AuthContext,
    events: {} as AuthEvent,
  },
  actions: {
    setEmail: assign({
      email: ({ event }: { event: any }) =>
        event.type === 'SET_EMAIL' ? event.payload : '',
    }),
    setPassword: assign({
      password: ({ event }: { event: any }) =>
        event.type === 'SET_PASSWORD' ? event.payload : '',
    }),
    setConfirmPassword: assign({
      confirmPassword: ({ event }: { event: any }) =>
        event.type === 'SET_CONFIRM_PASSWORD' ? event.payload : '',
    }),
    setName: assign({
      name: ({ event }: { event: any }) =>
        event.type === 'SET_NAME' ? event.payload : '',
    }),
    setError: assign({
      error: ({ event }: { event: any }) =>
        event.type === 'AUTH_ERROR' ? event.payload : null,
    }),
    incrementAttempt: assign({
      attempt: ({ context }: { context: AuthContext }) => context.attempt + 1,
    }),
    resetForm: assign({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      error: null,
      attempt: 0,
    }),
  },
  guards: {
    isValidEmail: ({ context }: { context: AuthContext }) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.email),
    isPasswordLengthValid: ({ context }: { context: AuthContext }) =>
      context.password.length >= 6,
    isPasswordMatching: ({ context }: { context: AuthContext }) =>
      context.password === context.confirmPassword,
    isNamePresent: ({ context }: { context: AuthContext }) =>
      context.name.trim().length > 0,
    canAttemptLogin: ({ context }: { context: AuthContext }) =>
      context.attempt < 5,
  },
}).createMachine({
  id: 'auth',
  initial: 'login',
  context: {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    error: null,
    attempt: 0,
  },
  states: {
    login: {
      on: {
        TOGGLE_MODE: 'signup',
        SET_EMAIL: {
          actions: 'setEmail',
        },
        SET_PASSWORD: {
          actions: 'setPassword',
        },
        SUBMIT: [
          {
            guard: {
              type: 'canAttemptLogin',
            },
            target: 'authenticating',
          },
          {
            target: 'loginLocked',
          },
        ],
      },
    },
    signup: {
      on: {
        TOGGLE_MODE: 'login',
        SET_EMAIL: {
          actions: 'setEmail',
        },
        SET_PASSWORD: {
          actions: 'setPassword',
        },
        SET_CONFIRM_PASSWORD: {
          actions: 'setConfirmPassword',
        },
        SET_NAME: {
          actions: 'setName',
        },
        SUBMIT: [
          {
            guard: {
              type: 'isValidEmail',
            },
            target: 'validatingPassword',
          },
          {
            actions: 'setError',
            target: 'signup',
          },
        ],
      },
    },
    validatingPassword: {
      always: [
        {
          guard: {
            type: 'isPasswordLengthValid',
          },
          target: 'checkingPasswordMatch',
        },
        {
          actions: 'setError',
          target: 'signup',
        },
      ],
    },
    checkingPasswordMatch: {
      always: [
        {
          guard: {
            type: 'isPasswordMatching',
          },
          target: 'checkingName',
        },
        {
          actions: 'setError',
          target: 'signup',
        },
      ],
    },
    checkingName: {
      always: [
        {
          guard: {
            type: 'isNamePresent',
          },
          target: 'authenticating',
        },
        {
          actions: 'setError',
          target: 'signup',
        },
      ],
    },
    authenticating: {
      invoke: {
        src: 'authenticate',
        onDone: {
          target: 'authenticated',
        },
        onError: {
          actions: 'setError',
          target: 'login',
        },
      },
    },
    authenticated: {
      type: 'final',
    },
    loginLocked: {
      after: {
        300000: 'login', // 5 minutes
      },
    },
  },
});

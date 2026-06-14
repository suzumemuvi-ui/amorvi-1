# XState v5 Implementation Guide for AMORVI

## Overview

This document provides a comprehensive guide to the XState v5 state management implementation in the AMORVI React Native dating application.

## What is XState?

XState is a JavaScript state machine and statechart library that enables you to create robust, reusable, and testable state logic. V5 brings improvements in:
- Better TypeScript support
- Simplified API
- Improved performance
- Enhanced developer experience

## Project Structure

```
src/
├── machines/
│   ├── authMachine.ts       # Authentication state machine
│   ├── userMachine.ts       # User profile management
│   ├── mapMachine.ts        # Geolocation & radar
│   └── chatMachine.ts       # Real-time messaging
├── context/
│   └── AmorviContext.tsx    # Provider & hooks
└── screens/
    ├── AuthScreenXState.tsx      # Refactored auth
    ├── HomeScreenXState.tsx      # Refactored home
    └── MapScreenXState.tsx       # Refactored map
```

## Implemented Machines

### 1. Authentication Machine (`authMachine.ts`)

Manages the authentication flow with validation.

**States:**
- `login` - Login form state
- `signup` - Registration form state
- `validatingPassword` - Password validation
- `checkingPasswordMatch` - Confirm password match
- `checkingName` - Name validation
- `authenticating` - In-progress authentication
- `authenticated` - Successfully authenticated
- `loginLocked` - Account locked after 5 failed attempts

**Events:**
```typescript
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
```

**Example Usage:**
```typescript
const { state, send, context, matches } = useAuth();

// Check current state
if (matches('login')) {
  // Show login form
}

// Send events
send({ type: 'SET_EMAIL', payload: 'user@example.com' });
send({ type: 'SUBMIT' });

// Access form data
console.log(context.email, context.password);
```

### 2. User Machine (`userMachine.ts`)

Manages user profiles and verification.

**States:**
- `idle` - Waiting for action
- `loading` - Fetching user data
- `loaded` - Data loaded successfully
- `verifying` - Video verification in progress
- `verified` - User verified
- `error` - Error state

**Events:**
```typescript
type UserEvent =
  | { type: 'LOAD_USERS' }
  | { type: 'LOAD_SUCCESS'; payload: User[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'VERIFY_USER' }
  | { type: 'VERIFY_SUCCESS' }
  | { type: 'VERIFY_ERROR'; payload: string };
```

**Example Usage:**
```typescript
const { state, send, context, matches } = useUser();

// Load users
send({ type: 'LOAD_USERS' });

// Check if loaded
if (matches('loaded')) {
  console.log('Users:', context.users);
}

// Verify user
send({ type: 'VERIFY_USER' });

// Update location
send({
  type: 'UPDATE_LOCATION',
  payload: { latitude: 42.9978, longitude: 21.428 }
});
```

### 3. Map Machine (`mapMachine.ts`)

Manages geolocation tracking and radar functionality.

**States:**
- `idle` - Radar disabled
- `active` - Radar enabled and tracking
- `loading` - Fetching nearby users
- `error` - Error state with auto-retry

**Events:**
```typescript
type MapEvent =
  | { type: 'ENABLE_RADAR' }
  | { type: 'DISABLE_RADAR' }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'LOAD_NEARBY_USERS' }
  | { type: 'LOAD_SUCCESS'; payload: RadarData[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'REFRESH' };
```

**Example Usage:**
```typescript
const { state, send, context, matches } = useMap();

// Enable radar
send({ type: 'ENABLE_RADAR' });

// Set search radius
send({ type: 'SET_RADIUS', payload: 2000 }); // 2km

// Update user location
send({
  type: 'UPDATE_LOCATION',
  payload: { latitude: 42.9978, longitude: 21.428 }
});

// Check nearby users
if (matches('active')) {
  console.log('Nearby users:', context.nearbyUsers);
}
```

### 4. Chat Machine (`chatMachine.ts`)

Manages real-time messaging and conversations.

**States:**
- `idle` - No active conversation
- `loadingMessages` - Fetching chat history
- `conversationOpen` - Chat active
- `sendingMessage` - Message being sent

**Events:**
```typescript
type ChatEvent =
  | { type: 'OPEN_CONVERSATION'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: MessageData }
  | { type: 'SEND_SUCCESS'; payload: Message }
  | { type: 'SEND_ERROR'; payload: string }
  | { type: 'LOAD_MESSAGES'; payload: string }
  | { type: 'LOAD_SUCCESS'; payload: LoadData }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'CLOSE_CONVERSATION' };
```

**Example Usage:**
```typescript
const { state, send, context, matches } = useChat();

// Open conversation
send({ type: 'OPEN_CONVERSATION', payload: 'user123' });

// Send message
send({
  type: 'SEND_MESSAGE',
  payload: { content: 'Hello!', receiverId: 'user123' }
});

// Check if conversation is open
if (matches('conversationOpen')) {
  console.log('Messages:', context.conversations[context.currentConversationId]);
}

// Close conversation
send({ type: 'CLOSE_CONVERSATION' });
```

## Custom Hooks

### `useAmorvi()`
Main context hook that provides access to all machines.

```typescript
const { authActor, userActor, mapActor, chatActor } = useAmorvi();
```

### `useAuth()`
Dedicated hook for authentication logic.

```typescript
const { state, send, context, matches } = useAuth();
```

### `useUser()`
Dedicated hook for user management.

```typescript
const { state, send, context, matches } = useUser();
```

### `useMap()`
Dedicated hook for geolocation and radar.

```typescript
const { state, send, context, matches } = useMap();
```

### `useChat()`
Dedicated hook for messaging.

```typescript
const { state, send, context, matches } = useChat();
```

## Refactored Components

### AuthScreenXState

Shows authentication flow using the auth machine.

**Features:**
- Automatic form validation
- Error handling
- Login/Signup mode toggling
- Loading states with visual feedback
- Attempt limiting for security

**Usage:**
```typescript
import AuthScreenXState from '../screens/AuthScreenXState';

<AuthScreenXState onAuthSuccess={() => {
  // Handle successful authentication
}} />
```

### HomeScreenXState

Demonstrates user list management with the user machine.

**Features:**
- Loading states
- Error handling with retry
- User list refresh
- Profile verification
- Empty state handling

**Usage:**
```typescript
import HomeScreenXState from '../screens/HomeScreenXState';

<HomeScreenXState />
```

### MapScreenXState

Shows map and radar functionality using the map machine.

**Features:**
- Real-time location tracking
- Radar circle visualization
- Nearby user markers
- Adjustable search radius
- Animated radar pulse
- Error recovery

**Usage:**
```typescript
import MapScreenXState from '../screens/MapScreenXState';

<MapScreenXState />
```

## Integration Steps

### 1. Install Dependencies

```bash
npm install xstate @xstate/react
# or
yarn add xstate @xstate/react
```

### 2. Wrap App with Provider

```typescript
import { AmorviProvider } from './src/context/AmorviContext';

function App() {
  return (
    <AmorviProvider>
      {/* Your app content */}
    </AmorviProvider>
  );
}
```

### 3. Use Hooks in Components

```typescript
import { useAuth } from '../context/AmorviContext';

function MyComponent() {
  const { state, send, context } = useAuth();
  
  return (
    // Use state, send, and context
  );
}
```

## State Machine Visualization

### Auth Machine Flow

```
┌─────────────────────────────────────────────────┐
│                   LOGIN                         │
│  ┌──────────────────────────────────────────┐   │
│  │ Input: email, password                   │   │
│  │ Actions: setEmail, setPassword           │   │
│  │ Guards: canAttemptLogin                  │   │
│  └──────────────────────────────────────────┘   │
│        ↓ SUBMIT        ↓ TOGGLE_MODE            │
│    AUTHENTICATING       SIGNUP                   │
│        ↓                  ↓                      │
│    AUTHENTICATED     validatingPassword         │
│                          ↓                      │
│                    checkingPasswordMatch        │
│                          ↓                      │
│                      checkingName               │
│                          ↓                      │
│                    AUTHENTICATING               │
│                          ↓                      │
│                    AUTHENTICATED                │
└─────────────────────────────────────────────────┘
```

## Guards (Validation)

Guards are conditions that must be met for a transition to occur:

```typescript
guards: {
  isValidEmail: ({ context }) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(context.email),
  
  isPasswordLengthValid: ({ context }) =>
    context.password.length >= 6,
  
  isPasswordMatching: ({ context }) =>
    context.password === context.confirmPassword,
  
  isNamePresent: ({ context }) =>
    context.name.trim().length > 0,
  
  canAttemptLogin: ({ context }) =>
    context.attempt < 5,
}
```

## Actions (Side Effects)

Actions modify context or perform side effects:

```typescript
actions: {
  setEmail: assign({
    email: ({ event }) =>
      event.type === 'SET_EMAIL' ? event.payload : '',
  }),
  
  incrementAttempt: assign({
    attempt: ({ context }) => context.attempt + 1,
  }),
  
  resetForm: assign({
    email: '',
    password: '',
    error: null,
  }),
}
```

## Handling Async Operations

Machines support async operations through `invoke`:

```typescript
states: {
  loading: {
    invoke: {
      src: 'fetchUsers', // Function name to call
      onDone: {
        target: 'loaded',
        actions: 'setUsers',
      },
      onError: {
        target: 'error',
        actions: 'setError',
      },
    },
  },
}
```

In the provider:

```typescript
const [state, send] = useMachine(userMachine, {
  actions: {
    fetchUsers: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
  },
} as any);
```

## Testing State Machines

XState machines are easily testable:

```typescript
import { createActor } from 'xstate';

test('auth flow', () => {
  const actor = createActor(authMachine);

  actor.start();
  actor.send({ type: 'LOGIN_SUBMIT' });

  expect(actor.getSnapshot().matches('authenticating')).toBe(true);

  actor.stop();
});
```

## Debugging

### Development Mode Indicators

Debug state information appears when `__DEV__` is true:

```typescript
{__DEV__ && (
  <Text style={styles.debugText}>
    State: {JSON.stringify(state.value)}
  </Text>
)}
```

### XState Inspect Tool

Use XState Inspector for visual debugging:

```typescript
import { inspect } from 'xstate';

// In development
if (__DEV__) {
  inspect.console();
}
```

### Context Logging

Access context at any time:

```typescript
const { context } = useAuth();
console.log('Current auth context:', context);
```

## Migration Guide

### From useState to XState

**Before:**
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**After:**
```typescript
const { context, send } = useAuth();
// context.email
// context.password
// matches('authenticating')
// context.error
```

### Benefits of This Approach

✅ **Type-safe** - Full TypeScript support
✅ **Predictable** - All states and transitions defined
✅ **Testable** - State logic separated from UI
✅ **Reusable** - Machines can be shared across screens
✅ **Debuggable** - Clear state transitions
✅ **Scalable** - Easy to add new states and logic

## Best Practices

1. **Keep machines focused** - One machine per domain
2. **Use guards for validation** - Not in event handlers
3. **Use actions for side effects** - Keep components clean
4. **Leverage context** - Store data in machine context
5. **Test machines separately** - Decouple from components
6. **Document states** - Clear state names
7. **Handle errors gracefully** - Provide recovery paths

## Resources

- **XState Documentation**: https://statelyai.com/docs
- **Examples**: Check `/src/screens/*XState.tsx`
- **Visualization**: Use XState Visualizer at visualizer.statelyai.com

## Troubleshooting

### "useAmorvi must be used within AmorviProvider"

Make sure your app is wrapped:

```typescript
<AmorviProvider>
  <YourApp />
</AmorviProvider>
```

### Context not updating

Use the `send` function, not direct state modifications:

```typescript
// ❌ Wrong
state.context.email = 'new@email.com';

// ✅ Correct
send({ type: 'SET_EMAIL', payload: 'new@email.com' });
```

### State not changing

Check if guards are preventing transitions:

```typescript
// Debug guards
const nextState = machine.transition(state, event);
console.log('Next state:', nextState.value);
```

## Next Steps

1. Refactor remaining screens to use XState
2. Add offline support with stored state
3. Implement global app state machine
4. Add state persistence
5. Create E2E tests with state machines

---

**Last Updated**: May 2026
**XState Version**: 5.0.0
**React Native Version**: 0.83.1

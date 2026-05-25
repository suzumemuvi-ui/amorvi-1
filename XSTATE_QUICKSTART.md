# XState v5 Quick Start Guide

## Installation

```bash
# Install dependencies
npm install xstate @xstate/react
# or
yarn add xstate @xstate/react

# Verify installation
npm list xstate @xstate/react
```

## 1-Minute Setup

### Step 1: Wrap App with Provider

```typescript
// App.tsx
import { AmorviProvider } from './src/context/AmorviContext';

function App() {
  return (
    <AmorviProvider>
      {/* Your app */}
    </AmorviProvider>
  );
}
```

### Step 2: Use Hook in Component

```typescript
// MyComponent.tsx
import { useAuth } from './src/context/AmorviContext';

export default function MyComponent() {
  const { state, send, context, matches } = useAuth();

  return (
    <View>
      <TextInput
        value={context.email}
        onChangeText={(email) =>
          send({ type: 'SET_EMAIL', payload: email })
        }
      />
      <Button
        title="Login"
        onPress={() => send({ type: 'SUBMIT' })}
      />
      {matches('authenticating') && <ActivityIndicator />}
    </View>
  );
}
```

## Available Hooks

```typescript
// Authentication
const { state, send, context, matches } = useAuth();

// User Management
const { state, send, context, matches } = useUser();

// Maps & Radar
const { state, send, context, matches } = useMap();

// Chat & Messaging
const { state, send, context, matches } = useChat();
```

## Common Patterns

### Send Event with Payload

```typescript
send({ 
  type: 'SET_EMAIL', 
  payload: 'user@example.com' 
});
```

### Check Current State

```typescript
if (matches('login')) {
  // Show login form
}

if (matches('authenticated')) {
  // User is logged in
}
```

### Access Context Data

```typescript
console.log(context.email);
console.log(context.users);
console.log(context.radarRadius);
```

### Handle Loading & Errors

```typescript
{matches('loading') && <ActivityIndicator />}
{matches('error') && <ErrorMessage message={context.error} />}
{matches('loaded') && <UserList users={context.users} />}
```

## Refactored Screens

Replace old screens with new XState versions:

```typescript
// Before
import AuthScreen from './src/screens/AuthScreen';

// After
import AuthScreenXState from './src/screens/AuthScreenXState';
```

## Available Refactored Screens

1. **AuthScreenXState** - Authentication with validation
2. **HomeScreenXState** - User profiles with state management
3. **MapScreenXState** - Geolocation & radar functionality

## Example: Building a Login Form

```typescript
import { useAuth } from './src/context/AmorviContext';
import { View, TextInput, Button, Text } from 'react-native';

export function LoginForm() {
  const { state, send, context, matches } = useAuth();

  return (
    <View>
      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={context.email}
        onChangeText={(email) =>
          send({ type: 'SET_EMAIL', payload: email })
        }
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={context.password}
        onChangeText={(password) =>
          send({ type: 'SET_PASSWORD', payload: password })
        }
      />

      {/* Submit Button */}
      <Button
        title={matches('authenticating') ? 'Logging in...' : 'Login'}
        onPress={() => send({ type: 'SUBMIT' })}
        disabled={matches('authenticating')}
      />

      {/* Error Display */}
      {context.error && <Text style={{ color: 'red' }}>{context.error}</Text>}

      {/* Toggle to Signup */}
      <Button
        title="Don't have an account? Sign up"
        onPress={() => send({ type: 'TOGGLE_MODE' })}
      />
    </View>
  );
}
```

## State Machine Lifecycle

```
① Initial State
    ↓
② Event Triggered (user action)
    ↓
③ Guards Evaluated (validation)
    ↓
④ Actions Executed (state update)
    ↓
⑤ New State Active
    ↓
⑥ Component Re-renders
```

## Debugging Tips

### View Current State
```typescript
console.log('Current state:', state.value);
console.log('Context:', context);
```

### Enable Debug UI
```typescript
{__DEV__ && (
  <Text style={{ fontSize: 10 }}>
    State: {JSON.stringify(state.value)}
  </Text>
)}
```

### Check Available Events
The TypeScript definitions show what events are available for current state.

## Common Mistakes to Avoid

❌ **Don't modify context directly:**
```typescript
// WRONG
context.email = 'new@email.com';

// RIGHT
send({ type: 'SET_EMAIL', payload: 'new@email.com' });
```

❌ **Don't use setState in event handlers:**
```typescript
// WRONG
const [email, setEmail] = useState('');
const handleEmailChange = (email) => setEmail(email);

// RIGHT
const handleEmailChange = (email) =>
  send({ type: 'SET_EMAIL', payload: email });
```

❌ **Don't call send outside of event handlers:**
```typescript
// WRONG (will be called on every render)
send({ type: 'LOAD_USERS' });

// RIGHT (only on mount)
useEffect(() => {
  send({ type: 'LOAD_USERS' });
}, []);
```

## Performance Tips

1. **Memoize components** - Prevent unnecessary re-renders
```typescript
import { memo } from 'react';

export const UserCard = memo(({ user }) => {
  return <View>{/* Card content */}</View>;
});
```

2. **Use derived state** - Compute from context, not separately
```typescript
const isLoading = matches('loading');
const hasError = matches('error');
```

3. **Minimize context subscriptions** - Use specific hooks
```typescript
// ✅ Only subscribe to auth state
const { state, send } = useAuth();

// ❌ Don't use all machines if not needed
const { authState, userState, mapState } = useAmorvi();
```

## Real-World Example

Building a complete authentication flow:

```typescript
// screens/Login.tsx
import { useAuth } from '../context/AmorviContext';
import { View, TextInput, Button, Text, ActivityIndicator } from 'react-native';

export function LoginScreen({ onAuthSuccess }) {
  const { state, send, context, matches } = useAuth();

  const handleLogin = () => {
    send({ type: 'SUBMIT' });
    
    // Listen for authenticated state
    if (state.value === 'authenticated') {
      onAuthSuccess();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        value={context.email}
        onChangeText={(email) =>
          send({ type: 'SET_EMAIL', payload: email })
        }
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={context.password}
        onChangeText={(password) =>
          send({ type: 'SET_PASSWORD', payload: password })
        }
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      {/* Error */}
      {context.error && (
        <Text style={{ color: 'red', marginBottom: 10 }}>
          {context.error}
        </Text>
      )}

      {/* Loading */}
      {matches('authenticating') && <ActivityIndicator size="large" />}

      {/* Login Button */}
      <Button
        title="Login"
        onPress={handleLogin}
        disabled={matches('authenticating')}
      />

      {/* Signup Link */}
      <Button
        title="Create Account"
        onPress={() => send({ type: 'TOGGLE_MODE' })}
      />
    </View>
  );
}
```

## Next Steps

1. ✅ Install XState
2. ✅ Wrap app with AmorviProvider
3. ✅ Replace old screens with XState versions
4. ✅ Test authentication flow
5. ✅ Add data fetching (invoke)
6. ✅ Implement error handling
7. ✅ Add logging/debugging
8. ✅ Refactor remaining screens

## Need Help?

- 📖 **Full Guide**: See `XSTATE_IMPLEMENTATION.md`
- 💬 **XState Docs**: https://statelyai.com/docs
- 🎮 **Visualizer**: https://visualizer.statelyai.com

---

**Version**: 1.0  
**Last Updated**: May 2026  
**XState Version**: 5.0.0

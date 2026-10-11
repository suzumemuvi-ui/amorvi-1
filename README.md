# Love Alarm Dating App 💕

A modern dating and social video-sharing app combining elements of TikTok, Snapchat, Tinder, and Love Alarm. Built with React Native and XState for robust state management.

## Features

- **📱 Social Feed** - Like, comment, and bookmark posts from nearby users
- **💘 Amorvi Matching** - Swipe through profiles in Discover/Interested/Friends tabs
- **❤️ Mutual Matching** - Get notified with "It's a Match!" when both users like each other
- **💬 Real-time Chat** - Message matches and friend connections instantly
- **🗺️ Radar View** - Find matches nearby on an interactive map
- **👤 Profile Management** - Customizable profiles with photos and interests
- **🎨 Animations & Polish** - Smooth heart bounce effects, spring animations, dark theme UI

## Architecture

### Three-Layer Design

**1. Social Feed (Home)**
- TikTok-style posts from nearby users
- Like ❤️ (social engagement, no romantic meaning)
- Comment 💬 (add feedback to posts)
- Interested 💗 (private bookmark in Amorvi tab)

**2. Amorvi Matching (Dating)**
- **Discover Tab**: Browse all available profiles
- **Interested Tab**: View your private bookmarks from posts
- **Friends Tab**: Manage friend requests and accepted connections
- Like/Pass buttons trigger mutual like detection
- Connect button initiates friend requests

**3. Chats (Messaging)**
- Active matches and accepted friend connections
- Real-time message threads
- User avatars and status indicators

### State Management

**Shared Relationship State** (`src/data/amorviRelationshipState.ts`):
```typescript
// Profile collections
- interestedProfilesMap: Private bookmarks from Home posts
- matchedUsersMap: Mutual matches with message history
- friendConnectionsMap: Friend requests (pending/accepted status)

// Like tracking
- likedByMeSet: Profiles I've liked in Amorvi
- mutualLikeSet: Profiles that both of us have liked
```

**Flow Logic**:
```
Home ❤️ Like → Just a social engagement
Home 💗 Interested → Adds to Amorvi/Interested tab
Amorvi ❤️ Like (on Interested) + hasMutualLike → "It's a Match!" → Chat
Amorvi 💜 Connect → Adds to Friends as pending request
Friends Accept → Status changes to 'accepted' → Can chat as friends
```

## Tech Stack

- **React Native** 0.83.1 with TypeScript
- **React Navigation** for routing and tab management
- **XState v5** for state machine management
- **React Native Animated API** for smooth animations
- **React Native Linear Gradient** for UI effects
- **React Native Vector Icons** for beautiful icons
- **React Native Maps** for location features

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Start the API first

Login and registration use the local Amorvi API. Keep this running in its own terminal before opening the app:

```sh
npm run backend
```

The API health endpoint should then return JSON at `http://localhost:4000/health`.

The default connection addresses work for the iOS Simulator (`localhost`) and Android Emulator (`10.0.2.2`). For a physical phone, update `src/config/api.ts` to use your computer's LAN IP address (for example, `http://192.168.1.20:4000`) and ensure the phone and computer use the same Wi-Fi network.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

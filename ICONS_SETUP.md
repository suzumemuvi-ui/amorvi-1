# Icon Setup Guide

This app uses `react-native-vector-icons` for icons.

## Android Setup

The icons are automatically linked on Android. No additional setup needed.

## iOS Setup

1. Open `ios/love_alarm_app.xcodeproj` in Xcode
2. Right-click on the project in the left panel
3. Select "Add Files to love_alarm_app"
4. Navigate to `node_modules/react-native-vector-icons/Fonts`
5. Select all `.ttf` files and add them
6. Make sure "Copy items if needed" is checked

OR use CocoaPods (Recommended):

The Podfile already includes the necessary configuration. Just run:

```bash
cd ios
pod install
cd ..
```

## Verify Installation

Run the app. If you see icons properly displayed, the setup is complete!

## Available Icon Sets

- Ionicons (used in this app)
- FontAwesome
- MaterialIcons
- And many more!

For a full list, visit: https://oblador.github.io/react-native-vector-icons/

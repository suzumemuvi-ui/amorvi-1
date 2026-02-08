# Quick Start Guide 🚀

## Running Your Love Alarm Dating App

### Prerequisites Check
Make sure you have:
- ✅ Node.js (version 20+)
- ✅ React Native development environment set up
- ✅ Android Studio (for Android) or Xcode (for iOS on Mac)

### Installation Steps

1. **Install all dependencies**:
```bash
npm install
```

2. **For iOS** (Mac only):
```bash
cd ios
pod install
cd ..
```

### Running the App

#### Option 1: Using npm scripts

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

#### Option 2: Start Metro bundler first

```bash
# Terminal 1 - Start Metro
npm start

# Terminal 2 - Run Android
npm run android

# OR Terminal 2 - Run iOS
npm run ios
```

### Expected Results

Once the app launches, you should see:

1. **Home Tab**: A beautiful TikTok-style video feed with user profiles
2. **Camera Tab**: Camera placeholder (ready for implementation)
3. **Add Tab**: Create content placeholder
4. **Dating Tab**: Match screen, chat interface, and matches list
5. **Profile Tab**: User profile with albums and statistics

### Features to Try

- **Home Screen**: Swipe through user profiles, tap heart to like
- **Dating Screen**: View the match animation, browse chat interface
- **Map Screen**: See user locations on the map (requires location permissions)
- **Profile Screen**: View albums, stats, and quick actions

### Troubleshooting

#### Metro Bundler Issues
```bash
npm start -- --reset-cache
```

#### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### iOS Build Errors (Mac)
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

#### Port Already in Use
```bash
npx react-native start --port 8082
```

### Common Issues

**Issue**: Icons not showing
**Solution**: Make sure you've run `npm install` and rebuilt the app

**Issue**: Map not displaying
**Solution**: Check if you've added Google Maps API key (optional for now)

**Issue**: Build fails
**Solution**: Clear cache and rebuild:
```bash
npm start -- --reset-cache
cd android && ./gradlew clean && cd ..
npm run android
```

### Next Steps

1. **Customize the UI**: Update colors in style files
2. **Add Real Data**: Replace mock data with API calls
3. **Enable Camera**: Implement video recording
4. **Add Authentication**: Set up user login
5. **Push Notifications**: Configure for new matches

### Development Tips

- Use React Native Debugger for debugging
- Enable Hot Reload for faster development
- Test on real devices for best performance
- Use `console.log()` sparingly, check Metro logs

### Need Help?

Check the main README.md for detailed documentation and feature descriptions.

Happy coding! 💕

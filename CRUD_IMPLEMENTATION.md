# Backend Persistence Implementation - CRUD Operations

## Overview
This implementation adds full backend persistence and CRUD (Create, Read, Update, Delete) operations to the AMORVI app for user profiles, posts, and stories.

## What's Been Implemented

### 1. Backend API Endpoints (backend/src/server.ts)

#### User Profile Management
- **PATCH `/me/profile`** - Update user profile (name, age, bio, interests, goals, images)
- **PATCH `/me/location`** - Update user location (existing endpoint enhanced)
- **GET `/me`** - Get current user profile (existing endpoint)

#### Posts Management
- **POST `/posts`** - Create new post with images and caption
- **PATCH `/posts/:postId`** - Edit post caption
- **DELETE `/posts/:postId`** - Delete post (also removes likes and comments)

### 2. API Service Layer (src/services/userService.ts)

A new TypeScript service providing typed API methods:
```typescript
- updateProfile(token, data) - Update profile data
- updateLocation(token, latitude, longitude) - Update location
- getCurrentUser(token) - Fetch current user
- createPost(token, images, caption) - Create new post
- updatePost(token, postId, caption) - Edit post
- deletePost(token, postId) - Delete post
```

### 3. Authentication Context Enhancement (src/context/AuthContextV2.tsx)

Added new method to auth context:
```typescript
updateProfile(data: {
  name?: string;
  age?: number;
  bio?: string;
  interests?: string[];
  goals?: string[];
  images?: string[];
}) => Promise<void>
```

### 4. Post Management Context (src/context/PostContextV2.tsx)

New context for managing posts:
```typescript
- createPost(images, caption) - Create post
- updatePost(postId, caption) - Edit post
- deletePost(postId) - Delete post
- addLocalPost(post) - Optimistic update
- removeLocalPost(postId) - Optimistic delete
```

### 5. EditProfileScreen Updates

- Connected to backend via `updateProfile()` from AuthContextV2
- Validates inputs before submission
- Shows loading indicator while saving
- Saves name, age, bio, and interests to backend
- Proper error handling with user alerts

### 6. ProfileScreen Enhancements

**Story Management:**
- Delete story button in StoryViewer component
- Confirmation dialog before deletion
- Works with own stories

**Album Management:**
- Delete button on each album item
- Swipe or tap to delete photos/videos
- Confirmation before deletion
- Real-time UI updates

**Updated Components:**
- StoryViewer: Added `onDelete` callback and `isOwnStory` prop
- ProfileScreen: Added delete handlers for stories and album items

## Usage Examples

### Updating User Profile
```typescript
import { useAuth } from '../context/AuthContextV2';

const MyComponent = () => {
  const { updateProfile } = useAuth();

  const handleSave = async () => {
    try {
      await updateProfile({
        name: 'John Doe',
        age: 25,
        bio: 'Adventure seeker',
        interests: ['travel', 'music'],
      });
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return <Button onPress={handleSave} title="Save" />;
};
```

### Managing Posts
```typescript
import { usePost } from '../context/PostContextV2';

const PostScreen = () => {
  const { createPost, updatePost, deletePost } = usePost();

  const handleCreatePost = async () => {
    try {
      await createPost(['image-uri-1', 'image-uri-2'], 'Great day!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error(error);
    }
  };

  return {/* component */};
};
```

## Data Persistence Flow

```
User Input
    ↓
React Component State
    ↓
API Service Method
    ↓
Backend Validation
    ↓
Database Update (dev.json)
    ↓
Response to Frontend
    ↓
Update Context/Auth State
    ↓
UI Update
```

## Error Handling

All endpoints include:
- Zod schema validation on backend
- Error messages returned to frontend
- Try-catch blocks in services
- User-friendly alerts in components
- Console logging for debugging

## Database Storage

All data is persisted to `backend/data/dev.json`:
- User profiles
- Posts with captions
- Post likes and comments
- User location
- Authentication tokens (AsyncStorage on client)

## Key Features

✅ Automatic error handling with user alerts
✅ Loading states during API calls
✅ Optimistic UI updates
✅ Validation on both frontend and backend
✅ Proper authorization checks (users can only edit/delete their own content)
✅ Cascading deletes (deleting post removes likes/comments)
✅ Type-safe API methods with TypeScript

## Next Steps

To fully integrate all features:

1. Wrap your app with PostProvider:
```typescript
import { PostProvider } from '../context/PostContextV2';

<PostProvider>
  <YourAppContent />
</PostProvider>
```

2. Start using the hooks in your components:
```typescript
import { useAuth } from '../context/AuthContextV2';
import { usePost } from '../context/PostContextV2';
```

3. Test with:
```bash
npm run android
```

## Testing Checklist

- [ ] Edit profile and verify changes save to backend
- [ ] Delete album items and verify UI updates
- [ ] Delete story with confirmation dialog
- [ ] Create new posts with backend
- [ ] Edit post captions
- [ ] Delete posts (verify cascading delete works)
- [ ] Check dev.json for persisted data
- [ ] Verify error messages display correctly
- [ ] Test with slow network (see loading states)

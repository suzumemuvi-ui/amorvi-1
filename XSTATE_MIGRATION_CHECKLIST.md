# XState Migration Checklist

Complete checklist for migrating AMORVI to XState v5 state management.

## Phase 1: Setup & Infrastructure ✅

- [x] Install `xstate` (v5.0.0+)
- [x] Install `@xstate/react` (v4.1.0+)
- [x] Create `/src/machines` directory
- [x] Create `/src/context` directory
- [x] Implement `AmorviContext.tsx` with provider
- [x] Create custom hooks (useAuth, useUser, useMap, useChat)
- [x] Set up TypeScript types for machines

## Phase 2: Core Machines ✅

### Authentication Machine
- [x] Create `authMachine.ts`
- [x] Define auth states (login, signup, authenticating, authenticated)
- [x] Implement form validation
- [x] Add attempt limiting (login lock after 5 attempts)
- [x] Handle auth success/error
- [x] Add password matching validation
- [x] Type all events and context

### User Machine
- [x] Create `userMachine.ts`
- [x] Define user states (idle, loading, loaded, verifying, verified, error)
- [x] Implement user loading logic
- [x] Add location update handling
- [x] Implement verification flow
- [x] Add error recovery

### Map Machine
- [x] Create `mapMachine.ts`
- [x] Define map states (idle, active, loading, error)
- [x] Implement radar enable/disable
- [x] Add radius adjustment
- [x] Implement location tracking
- [x] Add auto-retry on error

### Chat Machine
- [x] Create `chatMachine.ts`
- [x] Define chat states (idle, loadingMessages, conversationOpen, sendingMessage)
- [x] Implement conversation management
- [x] Add message sending
- [x] Track unread messages
- [x] Handle message loading

## Phase 3: Refactored Components ✅

### Auth Screen
- [x] Create `AuthScreenXState.tsx`
- [x] Implement login form with useAuth hook
- [x] Implement signup form with validation
- [x] Add error message display
- [x] Add loading indicator
- [x] Mode toggling (login ↔ signup)
- [x] Password visibility toggle
- [x] Debug state display (__DEV__)

### Home Screen
- [x] Create `HomeScreenXState.tsx`
- [x] Implement user list with useUser hook
- [x] Add loading state
- [x] Add error handling with retry
- [x] Implement refresh logic
- [x] Add verification button
- [x] Empty state handling
- [x] Debug state display (__DEV__)

### Map Screen
- [x] Create `MapScreenXState.tsx`
- [x] Implement map with useMap hook
- [x] Add radar enable/disable
- [x] Implement radius adjustment
- [x] Add nearby users markers
- [x] Radar pulse animation
- [x] User count badge
- [x] Error handling
- [x] Debug state display (__DEV__)

## Phase 4: Documentation ✅

- [x] Create `XSTATE_IMPLEMENTATION.md` (comprehensive guide)
- [x] Create `XSTATE_QUICKSTART.md` (quick reference)
- [x] Document all machines
- [x] Add code examples
- [x] Document hooks usage
- [x] Add migration guide
- [x] Create troubleshooting section

## Phase 5: Integration (TODO)

### App.tsx Integration
- [ ] Import AmorviProvider
- [ ] Wrap app with AmorviProvider
- [ ] Replace old AuthScreen with AuthScreenXState
- [ ] Test authentication flow
- [ ] Verify all screens render correctly

### Navigation Integration
- [ ] Update TabNavigator to use XState screens
- [ ] Replace HomeScreen with HomeScreenXState
- [ ] Replace MapScreen with MapScreenXState
- [ ] Test navigation flow
- [ ] Verify screen transitions

### API Integration
- [ ] Implement API calls in machine actions
- [ ] Handle API errors gracefully
- [ ] Add retry logic
- [ ] Implement request debouncing
- [ ] Add timeout handling

## Phase 6: Remaining Screens (TODO)

- [ ] Refactor ProfileScreen with XState
- [ ] Refactor AlarmScreen with XState
- [ ] Refactor RadarScreen with XState
- [ ] Refactor SettingsScreen with XState
- [ ] Refactor DatingScreen with XState
- [ ] Refactor EditProfileScreen with XState
- [ ] Refactor AccountScreen with XState

## Phase 7: Testing (TODO)

### Unit Tests
- [ ] Test auth machine state transitions
- [ ] Test user machine logic
- [ ] Test map machine geolocation
- [ ] Test chat machine messaging
- [ ] Test guards and validation
- [ ] Test actions and state updates

### Component Tests
- [ ] Test AuthScreenXState rendering
- [ ] Test HomeScreenXState interactions
- [ ] Test MapScreenXState functionality
- [ ] Test error states
- [ ] Test loading states
- [ ] Test edge cases

### E2E Tests
- [ ] Test complete auth flow
- [ ] Test user profile management
- [ ] Test map/radar functionality
- [ ] Test chat messaging
- [ ] Test screen navigation

## Phase 8: Optimization (TODO)

- [ ] Memoize components to prevent re-renders
- [ ] Optimize machine invocations
- [ ] Implement lazy loading
- [ ] Add performance monitoring
- [ ] Profile with React DevTools
- [ ] Optimize bundle size

## Phase 9: Features (TODO)

### State Persistence
- [ ] Persist auth state to AsyncStorage
- [ ] Restore state on app startup
- [ ] Handle offline scenarios
- [ ] Implement state synchronization

### Advanced Features
- [ ] Add offline queue for messages
- [ ] Implement optimistic updates
- [ ] Add undo/redo functionality
- [ ] Implement state snapshots

## Phase 10: Deployment (TODO)

- [ ] Remove debug code (__DEV__)
- [ ] Update error messages for production
- [ ] Configure error tracking
- [ ] Set up analytics
- [ ] Create release branch
- [ ] Version bump
- [ ] Release notes

## Testing Checklist

### Functionality
- [ ] Authentication works end-to-end
- [ ] User data loads and displays
- [ ] Map and radar function correctly
- [ ] Chat messaging works
- [ ] Profile updates persist
- [ ] Location tracking works

### Error Handling
- [ ] Network errors handled gracefully
- [ ] Validation errors show correctly
- [ ] Failed operations show retry option
- [ ] Server errors display user-friendly messages
- [ ] Timeout errors handled

### State Management
- [ ] No unintended state mutations
- [ ] State transitions follow machine definition
- [ ] Context updates trigger re-renders
- [ ] Multiple machines don't interfere
- [ ] Memory leaks cleaned up

### UI/UX
- [ ] Loading indicators visible
- [ ] Error messages clear
- [ ] Form validation feedback
- [ ] Buttons disabled appropriately
- [ ] Navigation smooth
- [ ] No infinite loops

## Common Migration Issues & Solutions

### Issue: "State not updating"
**Solution**: Use `send()` for all state changes, not direct context modification

### Issue: "Component re-renders too much"
**Solution**: Memoize components, avoid creating new objects in context

### Issue: "useAmorvi hook not working"
**Solution**: Ensure component is wrapped with AmorviProvider

### Issue: "Async operations not working"
**Solution**: Use `invoke` in state definitions, implement actions correctly

### Issue: "TypeScript errors"
**Solution**: Check type definitions, use proper event types in send()

## Performance Targets

- [ ] Auth login < 2 seconds
- [ ] User list load < 1 second
- [ ] Map render < 500ms
- [ ] Message send < 500ms
- [ ] No janky animations
- [ ] < 2MB bundle increase from XState

## Security Considerations

- [ ] Password stored only in memory (not persisted)
- [ ] Auth tokens handled securely
- [ ] API calls use HTTPS
- [ ] Validate all user inputs
- [ ] Sanitize error messages
- [ ] Rate limit API calls

## Accessibility

- [ ] Forms accessible via keyboard
- [ ] Error messages announced
- [ ] Loading states clear
- [ ] Touch targets >= 44x44 points
- [ ] Color contrast adequate
- [ ] Screen reader friendly

## Documentation Requirements

- [ ] README updated with XState info
- [ ] All machines documented
- [ ] Hooks documented
- [ ] Examples provided
- [ ] Migration guide complete
- [ ] Troubleshooting guide included
- [ ] API reference provided

## Code Quality

- [ ] No console errors
- [ ] No console warnings
- [ ] Linter passes (ESLint)
- [ ] TypeScript strict mode
- [ ] Code formatted with Prettier
- [ ] Comments on complex logic
- [ ] Removed all TODO/FIXME comments

## Sign-Off

- [ ] Development complete
- [ ] QA testing passed
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Code review approved
- [ ] Ready for production

---

## Progress Summary

**Phase 1**: ✅ Complete (Setup & Infrastructure)
**Phase 2**: ✅ Complete (Core Machines)
**Phase 3**: ✅ Complete (Refactored Components)
**Phase 4**: ✅ Complete (Documentation)
**Phase 5-10**: ⏳ In Progress (Implementation & Testing)

## Next Immediate Steps

1. Run `npm install` to install XState packages
2. Wrap app with AmorviProvider in App.tsx
3. Replace AuthScreen with AuthScreenXState
4. Test authentication flow works
5. Gradually migrate remaining screens

## Questions/Issues

Document any issues encountered:

```
Issue: [Description]
Date: [Date encountered]
Status: [Open/Resolved]
Solution: [How it was solved]
```

---

**Created**: May 2026
**Last Updated**: May 2026
**Status**: Comprehensive Implementation Framework Ready

**Next Review**: After Phase 5 completion

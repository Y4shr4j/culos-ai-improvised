# Chat User-Specific Migration

This document explains the migration from shared chat sessions to individual user-specific chat sessions.

## Overview

The chat system has been updated to provide individual chat sessions and personal storage for each user. Previously, all users shared the same chat sessions, but now each user has their own private conversations with AI characters.

## Changes Made

### 1. Database Schema Updates

#### ChatSession Model (`server/src/models/chatSession.ts`)
- Added `userId` field to associate sessions with specific users
- Updated indexes to include `userId` for efficient user-specific queries

#### ChatMessage Model (`server/src/models/chatMessage.ts`)
- Added `userId` field to associate messages with specific users
- Updated indexes to include `userId` for efficient user-specific queries

### 2. Backend Service Updates

#### Chat Storage Service (`server/src/services/chatStorage.ts`)
- Updated all interfaces to include `userId`
- Modified all methods to handle user-specific data:
  - `getChatSession(id, userId)`
  - `findOrCreateChatSession(characterId, userId)`
  - `getMessagesBySession(sessionId, userId)`
  - `clearSessionMessages(sessionId, userId)`
  - Added `getUserSessions(userId)` method

#### Chat Routes (`server/src/routes/chat.routes.ts`)
- Added authentication middleware to all chat routes
- Updated all endpoints to include user context:
  - All session operations now require user authentication
  - Messages are filtered by user ID
  - Sessions are created per user per character

### 3. Frontend Updates

#### Chat Page (`client/pages/chat/chat.tsx`)
- Added authentication check and redirect to login
- Updated queries to only run when user is authenticated
- Added loading states for authentication

#### Chat Components
- All components now work with user-specific sessions
- No changes needed to individual components as they use sessionId

## Migration Process

### Running the Migration

1. **Stop the application** to prevent data conflicts during migration

2. **Run the migration script**:
   ```bash
   cd server
   npm run migrate:chat
   ```

3. **Verify the migration**:
   The script will output the number of sessions and messages updated

4. **Restart the application**

### What the Migration Does

- Finds all existing sessions and messages without `userId`
- Assigns them to a legacy user ID (`legacy-user-{timestamp}`)
- Ensures no data is lost during the transition
- Verifies all data now has `userId` field

## Security Benefits

1. **Data Isolation**: Each user's chat history is completely separate
2. **Privacy**: Users cannot see other users' conversations
3. **Authentication Required**: All chat operations require valid user authentication
4. **User-Specific Sessions**: Each user gets their own session per character

## User Experience

### For New Users
- Must log in to access chat functionality
- Each character conversation is private to the user
- Chat history persists across sessions

### For Existing Users
- Existing chat data is preserved under a legacy user account
- New conversations will be user-specific
- Can continue using the chat system normally

## API Changes

### New Endpoints
- `GET /api/chat/sessions` - Get user's sessions for all characters

### Updated Endpoints
All existing endpoints now require authentication and are user-specific:
- `POST /api/chat/sessions` - Creates user-specific session
- `GET /api/chat/sessions/:id/messages` - Gets user's messages for session
- `POST /api/chat/sessions/:id/messages` - Sends message in user's session
- `DELETE /api/chat/sessions/:id/messages` - Clears user's session messages

### Authentication
All chat routes now require the `protect` middleware and include user context.

## Testing

After migration, test the following:

1. **User Authentication**: Verify users must log in to access chat
2. **Session Isolation**: Confirm users only see their own conversations
3. **Data Persistence**: Check that chat history is maintained per user
4. **Character Switching**: Ensure each character has separate user sessions

## Rollback Plan

If issues arise, the system can be rolled back by:

1. Reverting the database schema changes
2. Removing the `userId` fields from existing data
3. Reverting the backend service changes
4. Removing authentication requirements from chat routes

## Monitoring

Monitor the following after deployment:

1. **Database Performance**: Check if new indexes impact query performance
2. **User Experience**: Ensure chat functionality works smoothly
3. **Error Rates**: Monitor for any authentication or session-related errors
4. **Data Integrity**: Verify user data isolation is working correctly 
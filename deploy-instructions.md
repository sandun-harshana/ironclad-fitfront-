# Deployment Instructions for Ironclad Fitness GMS

## 🔥 Firebase Setup

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Create Required Firestore Indexes (Optional)
If you encounter index errors, you can create them manually or use the provided URLs in the error messages.

**Common indexes needed:**
- Collection: `payments`, Fields: `userId` (Ascending), `createdAt` (Descending)
- Collection: `bookings`, Fields: `userId` (Ascending), `createdAt` (Descending)
- Collection: `chatMessages`, Fields: `userId` (Ascending), `timestamp` (Descending)

### 3. Deploy to Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

## 🔧 Troubleshooting

### Index Errors
The application is designed to work without composite indexes by sorting data on the client side. However, if you encounter index errors:

1. Click the provided URL in the error message
2. Create the index in Firebase Console
3. Wait for the index to build (usually 1-2 minutes)

### Authentication Issues
1. Ensure Google Auth is enabled in Firebase Console
2. Add your domain to authorized domains
3. Check that API keys are correctly set in `.env`

### Database Connection Issues
1. Verify Firestore is enabled in your Firebase project
2. Check that security rules are deployed
3. Ensure the user has proper permissions

## 📱 Features Working

### ✅ Fully Functional
- User authentication with Google
- Role-based access control
- Equipment management
- Payment management with status updates
- Class scheduling and booking
- AI chatbot with database replies
- Calendar with events
- Real-time data updates

### 🔄 Data Flow
1. **Payments**: Users create → Admins update status
2. **Classes**: Admins/Trainers create → Users book
3. **Bookings**: Users book/cancel → Real-time updates
4. **Chatbot**: Database replies + AI fallback
5. **Calendar**: Add/edit/delete events

## 🗄️ Database Collections

- `users` - User profiles and roles
- `equipment` - Gym equipment management
- `classes` - Class schedules
- `bookings` - Class bookings
- `payments` - Payment records
- `chatMessages` - Chat history
- `chatbotReplies` - Admin-managed responses
- `calendarEvents` - Calendar events

## 🔐 Security

- Firestore security rules implemented
- Role-based access control
- User data isolation
- Admin-only operations protected

## 📊 Performance

- Client-side sorting to avoid index requirements
- Error boundaries for graceful error handling
- Loading states for better UX
- Optimized queries

---

**Your gym management system is ready to use!** 🏋️‍♂️
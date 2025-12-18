# 🏋️‍♂️ Ironclad Fitness GMS - Complete Gym Management System

A comprehensive, modern gym management system built with React, TypeScript, Firebase, and Tailwind CSS. This system provides complete functionality for gym administrators, trainers, and members with real-time data synchronization and AI-powered features.

## 🌟 Features

### 👨‍💼 Admin Panel
- **Dashboard**: Real-time statistics and analytics
- **Member Management**: Complete member profiles and management
- **Trainer Management**: Trainer oversight and role management
- **Equipment Management**: Track and maintain gym equipment
- **Payment Management**: Handle payments with status updates
- **Class Scheduling**: Create and manage fitness classes
- **AI Chatbot Control**: Manage automated responses
- **Calendar System**: Interactive gym calendar with events

### 👨‍🏫 Trainer Panel
- **Dashboard**: Personal performance metrics
- **Member Management**: View and communicate with members
- **Class Management**: Create and manage personal classes
- **Attendance Tracking**: Take and manage class attendance
- **Analytics**: Performance charts and insights
- **Messages**: Communication system with members
- **Profile Management**: Professional profile with certifications
- **Equipment Access**: View and manage equipment

### 👤 Member Panel
- **Dashboard**: Personal fitness overview
- **Profile Management**: Update personal information and goals
- **Class Booking**: Book and cancel fitness classes
- **Payment System**: Make payments and view history
- **AI Assistant**: Get fitness advice and support
- **Progress Tracking**: Monitor fitness goals and achievements

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **Backend**: Firebase (Auth + Firestore + Hosting)
- **AI Integration**: Google Gemini 2.0 Flash
- **Charts**: Recharts
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Google Cloud account (for Gemini AI)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ironclad-fitfront-GMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase and Gemini API keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Firebase Setup**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login to Firebase
   firebase login
   
   # Initialize Firebase (if not already done)
   firebase init
   
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Structure

### Firestore Collections

#### `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  role: 'admin' | 'member' | 'trainer',
  createdAt: Timestamp,
  lastLogin: Timestamp,
  isActive: boolean,
  // Role-specific fields...
}
```

#### `classes`
```typescript
{
  name: string,
  description: string,
  instructor: string,
  instructorId: string,
  date: Timestamp,
  startTime: string,
  endTime: string,
  capacity: number,
  enrolled: number,
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
  location: string,
  type: string
}
```

#### `bookings`
```typescript
{
  classId: string,
  className: string,
  userId: string,
  userName: string,
  userEmail: string,
  bookingDate: Timestamp,
  status: 'booked' | 'cancelled' | 'attended'
}
```

#### `payments`
```typescript
{
  userId: string,
  userName: string,
  amount: number,
  type: 'membership' | 'personal-training' | 'class' | 'equipment',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  paymentMethod: string,
  description: string,
  paidDate?: Timestamp
}
```

#### `equipment`
```typescript
{
  name: string,
  type: string,
  status: 'available' | 'maintenance' | 'out-of-order',
  location: string,
  purchaseDate: Timestamp,
  notes?: string
}
```

#### `chatMessages`
```typescript
{
  userId: string,
  message: string,
  response: string,
  timestamp: Timestamp,
  type: 'question' | 'complaint' | 'request',
  status: 'pending' | 'resolved'
}
```

#### `chatbotReplies`
```typescript
{
  keywords: string[],
  answer: string,
  category: string,
  isActive: boolean
}
```

#### `calendarEvents`
```typescript
{
  title: string,
  description: string,
  date: Timestamp,
  type: 'class' | 'maintenance' | 'event' | 'note',
  createdBy: string
}
```

## ���� Authentication & Security

### Authentication Flow
1. **Google OAuth**: Users sign in with Google accounts
2. **Role Assignment**: Users are assigned roles (admin/member/trainer)
3. **Profile Creation**: Automatic profile creation with role-specific fields
4. **Session Management**: Firebase handles session persistence

### Security Rules
- **User Isolation**: Users can only access their own data
- **Role-based Access**: Different permissions for each role
- **Admin Override**: Admins have elevated permissions
- **Data Validation**: Firestore rules validate data integrity

## 🤖 AI Features

### Gemini AI Integration
- **Fitness Assistant**: Personalized workout and nutrition advice
- **Contextual Responses**: Understands gym-specific queries
- **Fallback System**: Database replies + AI responses
- **Safety Filters**: Content filtering for appropriate responses

### Chatbot Management
- **Admin Control**: Admins can add/edit automated responses
- **Keyword Matching**: Smart keyword-based response system
- **Category Organization**: Organized by fitness topics
- **Analytics**: Track chatbot usage and effectiveness

## 📊 Analytics & Reporting

### Trainer Analytics
- **Performance Metrics**: Class completion rates, member satisfaction
- **Revenue Tracking**: Monthly earnings and trends
- **Member Growth**: Track member acquisition and retention
- **Class Analytics**: Popular class types and attendance patterns

### Admin Analytics
- **System Overview**: Total users, revenue, equipment status
- **Growth Metrics**: Member acquisition and retention rates
- **Financial Reports**: Payment tracking and revenue analysis
- **Operational Metrics**: Equipment utilization and maintenance

## 🎨 UI/UX Features

### Design System
- **Dark Theme**: Modern, gym-focused dark interface
- **Responsive Design**: Works on all device sizes
- **Consistent Navigation**: Persistent sidebars and headers
- **Role-based UI**: Different interfaces for each user role

### User Experience
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error recovery
- **Toast Notifications**: Real-time feedback
- **Form Validation**: Client-side and server-side validation

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Firebase Deployment
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything (hosting + firestore rules)
firebase deploy
```

## 🔧 Configuration

### Environment Variables
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AI Configuration
VITE_GEMINI_API_KEY=
```

### Firebase Configuration
- **Authentication**: Google provider enabled
- **Firestore**: Database with security rules
- **Hosting**: Static site hosting
- **Storage**: File uploads (if needed)

## 📱 Features Checklist

### ✅ Completed Features
- [x] User authentication with Google
- [x] Role-based access control (Admin/Member/Trainer)
- [x] Complete admin panel with all management features
- [x] Full trainer panel with analytics and member management
- [x] Member dashboard with booking and payment features
- [x] Equipment management system
- [x] Class scheduling and booking system
- [x] Payment management with status updates
- [x] AI-powered chatbot with admin control
- [x] Interactive calendar system
- [x] Real-time data synchronization
- [x] Responsive design for all devices
- [x] Error handling and loading states
- [x] Database security rules
- [x] Analytics and reporting

### 🚧 Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced workout tracking
- [ ] Nutrition planning
- [ ] Social features and member community
- [ ] Integration with fitness wearables
- [ ] Advanced reporting and analytics
- [ ] Multi-gym support
- [ ] Inventory management
- [ ] Staff scheduling

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify API keys in `.env` file
   - Check Firebase project settings
   - Ensure Firestore is enabled

2. **Authentication Problems**
   - Check Google Auth configuration
   - Verify authorized domains in Firebase Console
   - Clear browser cache and cookies

3. **Database Permission Errors**
   - Deploy Firestore security rules
   - Check user roles and permissions
   - Verify data structure matches schema

4. **Build Issues**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

### Performance Optimization
- **Client-side Sorting**: Avoids Firestore composite indexes
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Optimized assets
- **Caching**: TanStack Query for data caching

## 📄 License

MIT License - see LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase and React documentation

---

**Ironclad Fitness GMS** - Your complete gym management solution! 💪

Built with ❤️ using React, TypeScript, Firebase, and modern web technologies.
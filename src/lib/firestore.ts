import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: 'admin' | 'member' | 'trainer') => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching ${role}s:`, error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Equipment Management
export interface Equipment {
  id?: string;
  name: string;
  type: string;
  status: 'available' | 'maintenance' | 'out-of-order';
  location: string;
  purchaseDate: Timestamp;
  lastMaintenance?: Timestamp;
  nextMaintenance?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const equipmentRef = collection(db, 'equipment');
    const docRef = await addDoc(equipmentRef, {
      ...equipment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding equipment:', error);
    throw error;
  }
};

export const getAllEquipment = async () => {
  try {
    const equipmentRef = collection(db, 'equipment');
    const snapshot = await getDocs(equipmentRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Equipment[];
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
  try {
    const equipmentRef = doc(db, 'equipment', id);
    await updateDoc(equipmentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (id: string) => {
  try {
    const equipmentRef = doc(db, 'equipment', id);
    await deleteDoc(equipmentRef);
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};

// Class Management
export interface GymClass {
  id?: string;
  name: string;
  description: string;
  instructor: string;
  instructorId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  location: string;
  type: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addClass = async (classData: Omit<GymClass, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const classesRef = collection(db, 'classes');
    const docRef = await addDoc(classesRef, {
      ...classData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding class:', error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const classesRef = collection(db, 'classes');
    const snapshot = await getDocs(classesRef);
    // Sort on client side to avoid index requirements
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GymClass[];
    return classes.sort((a, b) => b.date.seconds - a.date.seconds);
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};

export const getClassesByInstructor = async (instructorId: string) => {
  try {
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('instructorId', '==', instructorId));
    const snapshot = await getDocs(q);
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GymClass[];
    return classes.sort((a, b) => b.date.seconds - a.date.seconds);
  } catch (error) {
    console.error('Error fetching instructor classes:', error);
    throw error;
  }
};

export const updateClass = async (id: string, updates: Partial<GymClass>) => {
  try {
    const classRef = doc(db, 'classes', id);
    await updateDoc(classRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

// Class Booking Management
export interface ClassBooking {
  id?: string;
  classId: string;
  className: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookingDate: Timestamp;
  status: 'booked' | 'cancelled' | 'attended';
  createdAt: Timestamp;
}

export const bookClass = async (booking: Omit<ClassBooking, 'id' | 'createdAt'>) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const docRef = await addDoc(bookingsRef, {
      ...booking,
      createdAt: serverTimestamp()
    });

    // Increment enrolled count in class
    const classRef = doc(db, 'classes', booking.classId);
    await updateDoc(classRef, {
      enrolled: increment(1)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error booking class:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string, classId: string) => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      status: 'cancelled'
    });

    // Decrement enrolled count in class
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      enrolled: increment(-1)
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ClassBooking[];
    // Sort on client side to avoid composite index
    return bookings.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Payment Management
export interface Payment {
  id?: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'membership' | 'personal-training' | 'class' | 'equipment';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  description: string;
  dueDate?: Timestamp;
  paidDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const docRef = await addDoc(paymentsRef, {
      ...payment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

export const updatePayment = async (id: string, updates: Partial<Payment>) => {
  try {
    const paymentRef = doc(db, 'payments', id);
    await updateDoc(paymentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

export const getAllPayments = async () => {
  try {
    const paymentsRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsRef);
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
    // Sort on client side to avoid index requirements
    return payments.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const getPaymentsByUser = async (userId: string) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
    // Sort on client side to avoid composite index
    return payments.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

// Membership Management
export interface Membership {
  id?: string;
  userId: string;
  userName: string;
  type: 'basic' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
  price: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addMembership = async (membership: Omit<Membership, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const membershipsRef = collection(db, 'memberships');
    const docRef = await addDoc(membershipsRef, {
      ...membership,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding membership:', error);
    throw error;
  }
};

export const getMembershipByUser = async (userId: string) => {
  try {
    const membershipsRef = collection(db, 'memberships');
    const q = query(membershipsRef, where('userId', '==', userId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Membership;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user membership:', error);
    throw error;
  }
};

// Chatbot Messages
export interface ChatMessage {
  id?: string;
  userId: string;
  message: string;
  response: string;
  timestamp: Timestamp;
  type: 'question' | 'complaint' | 'request';
  status: 'pending' | 'resolved';
}

export const addChatMessage = async (message: Omit<ChatMessage, 'id'>) => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const docRef = await addDoc(messagesRef, message);
    return docRef.id;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
};

export const getChatMessagesByUser = async (userId: string) => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const q = query(messagesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
    // Sort on client side to avoid composite index
    return messages.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const getAllChatMessages = async () => {
  try {
    const messagesRef = collection(db, 'chatMessages');
    const snapshot = await getDocs(messagesRef);
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
    return messages.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
  } catch (error) {
    console.error('Error fetching all chat messages:', error);
    throw error;
  }
};

// Chatbot Replies Management
export interface ChatbotReply {
  id?: string;
  keywords: string[];
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addChatbotReply = async (reply: Omit<ChatbotReply, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const repliesRef = collection(db, 'chatbotReplies');
    const docRef = await addDoc(repliesRef, {
      ...reply,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding chatbot reply:', error);
    throw error;
  }
};

export const getAllChatbotReplies = async () => {
  try {
    const repliesRef = collection(db, 'chatbotReplies');
    const snapshot = await getDocs(repliesRef);
    const replies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatbotReply[];
    return replies.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
  } catch (error) {
    console.error('Error fetching chatbot replies:', error);
    throw error;
  }
};

export const updateChatbotReply = async (id: string, updates: Partial<ChatbotReply>) => {
  try {
    const replyRef = doc(db, 'chatbotReplies', id);
    await updateDoc(replyRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating chatbot reply:', error);
    throw error;
  }
};

export const deleteChatbotReply = async (id: string) => {
  try {
    const replyRef = doc(db, 'chatbotReplies', id);
    await deleteDoc(replyRef);
  } catch (error) {
    console.error('Error deleting chatbot reply:', error);
    throw error;
  }
};

// Calendar Events
export interface CalendarEvent {
  id?: string;
  title: string;
  description: string;
  date: Timestamp;
  type: 'class' | 'maintenance' | 'event' | 'note';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const eventsRef = collection(db, 'calendarEvents');
    const docRef = await addDoc(eventsRef, {
      ...event,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    throw error;
  }
};

export const getCalendarEvents = async () => {
  try {
    const eventsRef = collection(db, 'calendarEvents');
    const snapshot = await getDocs(eventsRef);
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
    return events.sort((a, b) => a.date.seconds - b.date.seconds);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
  try {
    const eventRef = doc(db, 'calendarEvents', id);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

export const deleteCalendarEvent = async (id: string) => {
  try {
    const eventRef = doc(db, 'calendarEvents', id);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

// Initialize sample data to avoid index issues
export const initializeSampleData = async (userId: string, userName: string) => {
  try {
    // Add sample payment
    const paymentsRef = collection(db, 'payments');
    await addDoc(paymentsRef, {
      userId,
      userName,
      amount: 16500,
      type: 'membership',
      status: 'completed',
      paymentMethod: 'credit-card',
      description: 'Monthly membership fee',
      paidDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add sample class
    const classesRef = collection(db, 'classes');
    const classDoc = await addDoc(classesRef, {
      name: 'Morning Yoga',
      description: 'Start your day with relaxing yoga',
      instructor: 'Sarah Johnson',
      instructorId: userId,
      date: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
      startTime: '08:00',
      endTime: '09:00',
      capacity: 20,
      enrolled: 0,
      status: 'scheduled',
      location: 'Studio A',
      type: 'yoga',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add sample equipment
    const equipmentRef = collection(db, 'equipment');
    await addDoc(equipmentRef, {
      name: 'Treadmill #1',
      type: 'Cardio',
      status: 'available',
      location: 'Cardio Section',
      purchaseDate: Timestamp.fromDate(new Date('2023-01-01')),
      notes: 'Regular maintenance required',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Add sample chatbot reply
    const chatbotRepliesRef = collection(db, 'chatbotReplies');
    await addDoc(chatbotRepliesRef, {
      keywords: ['hours', 'time', 'open', 'close'],
      answer: 'Our gym is open Monday to Friday from 6:00 AM to 10:00 PM, and weekends from 8:00 AM to 8:00 PM.',
      category: 'general',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(chatbotRepliesRef, {
      keywords: ['book', 'class', 'schedule', 'reserve'],
      answer: 'To book a class, go to the Class Schedule page and click the "Book Class" button on your desired class.',
      category: 'classes',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(chatbotRepliesRef, {
      keywords: ['membership', 'price', 'cost', 'fee'],
      answer: 'We offer Basic (Rs. 9,570/month), Standard (Rs. 16,170/month), and Premium (Rs. 26,070/month) memberships. Each includes different benefits and access levels.',
      category: 'membership',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Sample data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return false;
  }
};
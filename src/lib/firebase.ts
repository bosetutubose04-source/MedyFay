import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Medicine, Order, UserProfile, CartItem } from '../types';
import { MEDICINES_DATA } from '../data/medicines';

// Initialize Firebase App with robust error handling for static hosting (GitHub Pages)
let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    dbInstance = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    authInstance = getAuth(app);
  }
} catch (e) {
  console.warn('Firebase initialization skipped / running in local fallback mode:', e);
}

export const db = dbInstance;
export const auth = authInstance || { currentUser: null };

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  MEDICINES: 'medicines',
  CARTS: 'carts'
} as const;

// Ensure anonymous authentication on startup for seamless access
export const initAnonymousAuth = async (): Promise<FirebaseUser | null> => {
  if (!authInstance) return null;
  try {
    if (!authInstance.currentUser) {
      const userCredential = await signInAnonymously(authInstance);
      return userCredential.user;
    }
    return authInstance.currentUser;
  } catch (error: any) {
    if (error?.code !== 'auth/admin-restricted-operation') {
      console.warn('Anonymous auth note:', error?.message || error);
    }
    return null;
  }
};

// Seed medicines if collection is empty
export const seedMedicinesIfEmpty = async (): Promise<Medicine[]> => {
  if (!db) return MEDICINES_DATA;
  try {
    const medRef = collection(db, COLLECTIONS.MEDICINES);
    const snapshot = await getDocs(medRef);
    
    if (snapshot.empty) {
      // Seed initial medicine catalog
      const batchPromises = MEDICINES_DATA.map((med) => {
        const docRef = doc(db, COLLECTIONS.MEDICINES, med.id);
        return setDoc(docRef, med);
      });
      await Promise.all(batchPromises);
      return MEDICINES_DATA;
    } else {
      const existingIds = new Set(snapshot.docs.map((d) => d.id));
      const missingMeds = MEDICINES_DATA.filter((m) => !existingIds.has(m.id));
      if (missingMeds.length > 0) {
        await Promise.all(
          missingMeds.map((med) => setDoc(doc(db, COLLECTIONS.MEDICINES, med.id), med))
        );
      }
      const allDocsSnapshot = await getDocs(medRef);
      const docs = allDocsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Medicine));
      return docs.length > 0 ? docs : MEDICINES_DATA;
    }
  } catch (error) {
    console.warn('Firestore medicines fetch/seed error, falling back to local dataset:', error);
    return MEDICINES_DATA;
  }
};

// User Profile Operations
export const saveUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  if (!db) return;
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userDocRef, {
      ...profile,
      id: userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!db) return null;
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Orders Operations
export const createOrderInFirestore = async (orderData: Order, userId?: string): Promise<string> => {
  if (!db) return orderData.id;
  try {
    const orderDocRef = doc(db, COLLECTIONS.ORDERS, orderData.id);
    await setDoc(orderDocRef, {
      ...orderData,
      userId: userId || 'guest-user',
      createdAt: new Date().toISOString()
    });
    return orderData.id;
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    return orderData.id;
  }
};

export const subscribeToOrders = (
  userId: string | undefined, 
  callback: (orders: Order[]) => void
): Unsubscribe => {
  if (!db) return () => {};
  try {
    const ordersRef = collection(db, COLLECTIONS.ORDERS);
    // Listen to all orders or user-specific orders
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders: Order[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Order;
        if (!userId || data.deliveryAddress?.mobile === userId || data.id) {
          loadedOrders.push({
            ...data,
            id: doc.id
          });
        }
      });
      
      // Sort newest first
      loadedOrders.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      if (loadedOrders.length > 0) {
        callback(loadedOrders);
      }
    }, (error) => {
      console.warn('Firestore orders subscription error:', error);
    });
    return unsubscribe;
  } catch (error) {
    console.warn('Could not setup orders subscription:', error);
    return () => {};
  }
};

export const updateOrderStatusInFirestore = async (orderId: string, newStatus: Order['status']): Promise<void> => {
  if (!db) return;
  try {
    const orderDocRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderDocRef, {
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

export const saveMedicineToFirestore = async (medicine: Medicine): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, COLLECTIONS.MEDICINES, medicine.id);
    await setDoc(docRef, {
      ...medicine,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving medicine to Firestore:', error);
  }
};

export const deleteMedicineFromFirestore = async (medicineId: string): Promise<void> => {
  if (!db) return;
  try {
    const docRef = doc(db, COLLECTIONS.MEDICINES, medicineId);
    await updateDoc(docRef, {
      inStock: false,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting medicine in Firestore:', error);
  }
};

export const fetchAllUsersFromFirestore = async (): Promise<UserProfile[]> => {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => ({ ...d.data() } as UserProfile));
  } catch (error) {
    console.warn('Error fetching all users:', error);
    return [];
  }
};

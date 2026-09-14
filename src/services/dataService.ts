import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Property, RentRecord, ExpenseRecord, PaymentStatus } from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_RENTS, 
  INITIAL_EXPENSES 
} from '../data/seedData';

// Firestore collection names
const COLL_PROPERTIES = 'properties';
const COLL_RENTS = 'rents';
const COLL_EXPENSES = 'expenses';

export function getCachedActivePropertyId(userId?: string | null): string | null {
  try {
    const key = `dryos_active_property_${userId || 'guest'}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setCachedActivePropertyId(id: string, userId?: string | null): void {
  try {
    const key = `dryos_active_property_${userId || 'guest'}`;
    localStorage.setItem(key, id);
  } catch {}
}

/**
 * Loads isolated data for a specific user.
 * If user is authenticated, loads from /users/{userId}/...
 * For a new user, properties will be EMPTY ([]) by default as requested.
 * If user is null (guest/demo), returns sample demo data.
 */
export async function initializeData(userId?: string | null): Promise<{
  properties: Property[];
  rents: RentRecord[];
  expenses: ExpenseRecord[];
}> {
  if (!userId) {
    return {
      properties: [],
      rents: [],
      expenses: []
    };
  }

  try {
    const userPath = `users/${userId}`;

    // 1. Fetch properties for this specific user
    const propSnap = await getDocs(collection(db, userPath, COLL_PROPERTIES));
    const properties: Property[] = propSnap.docs.map(d => ({ id: d.id, ...d.data() } as Property));

    // 2. Fetch rents for this specific user
    const rentSnap = await getDocs(collection(db, userPath, COLL_RENTS));
    const rents: RentRecord[] = rentSnap.docs.map(d => ({ id: d.id, ...d.data() } as RentRecord));

    // 3. Fetch expenses for this specific user
    const expSnap = await getDocs(collection(db, userPath, COLL_EXPENSES));
    const expenses: ExpenseRecord[] = expSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseRecord));

    return { properties, rents, expenses };
  } catch (error) {
    console.warn(`Error loading Firestore data for user ${userId}:`, error);
    try {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    } catch {
      // ignore re-throw for initial load fallback
    }
    return {
      properties: [],
      rents: [],
      expenses: []
    };
  }
}

/**
 * Opt-in utility to populate sample demo data into a user's personal account
 */
export async function seedDemoDataForUser(userId: string): Promise<{
  properties: Property[];
  rents: RentRecord[];
  expenses: ExpenseRecord[];
}> {
  const userPath = `users/${userId}`;

  for (const p of INITIAL_PROPERTIES) {
    await setDoc(doc(db, userPath, COLL_PROPERTIES, p.id), p);
  }
  for (const r of INITIAL_RENTS) {
    await setDoc(doc(db, userPath, COLL_RENTS, r.id), r);
  }
  for (const e of INITIAL_EXPENSES) {
    await setDoc(doc(db, userPath, COLL_EXPENSES, e.id), e);
  }

  return {
    properties: INITIAL_PROPERTIES,
    rents: INITIAL_RENTS,
    expenses: INITIAL_EXPENSES
  };
}

/**
 * Clears all personal data (properties, rents, expenses) for a user
 */
export async function clearUserDataFromDb(userId: string): Promise<void> {
  const userPath = `users/${userId}`;
  try {
    const propSnap = await getDocs(collection(db, userPath, COLL_PROPERTIES));
    for (const d of propSnap.docs) {
      await deleteDoc(d.ref);
    }
    const rentSnap = await getDocs(collection(db, userPath, COLL_RENTS));
    for (const d of rentSnap.docs) {
      await deleteDoc(d.ref);
    }
    const expSnap = await getDocs(collection(db, userPath, COLL_EXPENSES));
    for (const d of expSnap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    console.warn(`Error clearing data for user ${userId}:`, err);
  }
}

// Property mutations
export async function saveProperty(property: Property, userId?: string | null): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_PROPERTIES}`;
  try {
    await setDoc(doc(db, path, property.id), property);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${property.id}`);
  }
}

export async function deletePropertyFromDb(propertyId: string, userId?: string | null): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_PROPERTIES}`;
  try {
    await deleteDoc(doc(db, path, propertyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${propertyId}`);
  }
}

// Rent mutations
export async function updateRentStatus(
  rentId: string, 
  status: PaymentStatus, 
  paidDate?: string, 
  userId?: string | null
): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_RENTS}`;
  try {
    const rentRef = doc(db, path, rentId);
    await updateDoc(rentRef, {
      status,
      paidDate: paidDate || (status === 'PAID' ? new Date().toLocaleDateString('fr-FR') : null)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${rentId}`);
  }
}

export async function addRentRecord(rent: RentRecord, userId?: string | null): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_RENTS}`;
  try {
    await setDoc(doc(db, path, rent.id), rent);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${rent.id}`);
  }
}

// Expense mutations
export async function saveExpense(expense: ExpenseRecord, userId?: string | null): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_EXPENSES}`;
  try {
    await setDoc(doc(db, path, expense.id), expense);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${expense.id}`);
  }
}

export async function deleteExpenseFromDb(expenseId: string, userId?: string | null): Promise<void> {
  const targetUid = userId || auth.currentUser?.uid;
  if (!targetUid) return;

  const path = `users/${targetUid}/${COLL_EXPENSES}`;
  try {
    await deleteDoc(doc(db, path, expenseId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${expenseId}`);
  }
}

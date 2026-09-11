import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc 
} from 'firebase/firestore';
import { db, ensureAuth } from '../firebase';
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

const ACTIVE_PROP_CACHE_KEY = 'dryos_active_property_id';

export function getCachedActivePropertyId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROP_CACHE_KEY);
  } catch {
    return null;
  }
}

export function setCachedActivePropertyId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROP_CACHE_KEY, id);
  } catch {}
}

export async function initializeData(): Promise<{
  properties: Property[];
  rents: RentRecord[];
  expenses: ExpenseRecord[];
}> {
  try {
    await ensureAuth();

    // 1. Fetch properties
    const propSnap = await getDocs(collection(db, COLL_PROPERTIES));
    let properties: Property[] = [];

    if (propSnap.empty) {
      for (const p of INITIAL_PROPERTIES) {
        await setDoc(doc(db, COLL_PROPERTIES, p.id), p);
      }
      properties = INITIAL_PROPERTIES;
    } else {
      properties = propSnap.docs.map(d => ({ id: d.id, ...d.data() } as Property));
    }

    // 2. Fetch rents
    const rentSnap = await getDocs(collection(db, COLL_RENTS));
    let rents: RentRecord[] = [];
    if (rentSnap.empty) {
      for (const r of INITIAL_RENTS) {
        await setDoc(doc(db, COLL_RENTS, r.id), r);
      }
      rents = INITIAL_RENTS;
    } else {
      rents = rentSnap.docs.map(d => ({ id: d.id, ...d.data() } as RentRecord));
    }

    // 3. Fetch expenses
    const expSnap = await getDocs(collection(db, COLL_EXPENSES));
    let expenses: ExpenseRecord[] = [];
    if (expSnap.empty) {
      for (const e of INITIAL_EXPENSES) {
        await setDoc(doc(db, COLL_EXPENSES, e.id), e);
      }
      expenses = INITIAL_EXPENSES;
    } else {
      expenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() } as ExpenseRecord));
    }

    return { properties, rents, expenses };
  } catch (error) {
    console.warn('Firestore sync fallback to local cache:', error);
    return {
      properties: INITIAL_PROPERTIES,
      rents: INITIAL_RENTS,
      expenses: INITIAL_EXPENSES
    };
  }
}

// Property mutations
export async function saveProperty(property: Property): Promise<void> {
  try {
    await setDoc(doc(db, COLL_PROPERTIES, property.id), property);
  } catch (err) {
    console.error('Error saving property to Firestore:', err);
  }
}

export async function deletePropertyFromDb(propertyId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_PROPERTIES, propertyId));
  } catch (err) {
    console.error('Error deleting property from Firestore:', err);
  }
}

// Rent mutations
export async function updateRentStatus(rentId: string, status: PaymentStatus, paidDate?: string): Promise<void> {
  try {
    const rentRef = doc(db, COLL_RENTS, rentId);
    await updateDoc(rentRef, {
      status,
      paidDate: paidDate || (status === 'PAID' ? new Date().toLocaleDateString('fr-FR') : null)
    });
  } catch (err) {
    console.error('Error updating rent in Firestore:', err);
  }
}

export async function addRentRecord(rent: RentRecord): Promise<void> {
  try {
    await setDoc(doc(db, COLL_RENTS, rent.id), rent);
  } catch (err) {
    console.error('Error adding rent to Firestore:', err);
  }
}

// Expense mutations
export async function saveExpense(expense: ExpenseRecord): Promise<void> {
  try {
    await setDoc(doc(db, COLL_EXPENSES, expense.id), expense);
  } catch (err) {
    console.error('Error saving expense in Firestore:', err);
  }
}

export async function deleteExpenseFromDb(expenseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL_EXPENSES, expenseId));
  } catch (err) {
    console.error('Error deleting expense from Firestore:', err);
  }
}

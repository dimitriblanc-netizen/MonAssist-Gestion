import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, User } from '../firebase';
import { 
  LandlordAccount, 
  AccountSetupFormData, 
  Property, 
  RentRecord, 
  ExpenseRecord, 
  DryosSupportTicket 
} from '../types';

const ADMIN_EMAILS = ['dimitri.blanc@dryos.fr'];
const LOCAL_STORAGE_ACCOUNTS_KEY = 'dryos_admin_landlord_accounts_v1';
const LOCAL_STORAGE_TICKETS_KEY = 'dryos_admin_support_tickets_v1';

/**
 * Checks if the given user has super-admin privileges for DRYOS agency
 */
export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) {
    // Check if session storage has admin test mode active
    return sessionStorage.getItem('dryos_admin_preview_mode') === 'true';
  }
  const email = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.includes(email) || email.endsWith('@dryos.fr');
}

/**
 * Initial sample accounts to provide an immediate operational view
 */
const SEED_ACCOUNTS: LandlordAccount[] = [
  {
    id: 'client_delorme',
    fullName: 'Pierre Delorme',
    email: 'pierre.delorme@example.com',
    phone: '06 12 34 56 78',
    mandateType: 'MISE_EN_LOCATION',
    status: 'ACTIVE',
    createdAt: '2025-01-15',
    notes: 'Mise en location réalisée par DRYOS en janvier 2025. Bail meublé 1 an.',
    invitationSentAt: '2025-01-16',
    configuredByAdmin: true,
    properties: [
      {
        id: 'prop_delorme_1',
        name: 'T2 République - Lyon 2e',
        address: '14 rue de la République, 69002 Lyon',
        surface: 46,
        rooms: 2,
        floor: '3e avec ascenseur',
        leaseType: 'meuble',
        leaseStartDate: '2025-01-15',
        leaseDurationYears: 1,
        chargesMode: 'forfait',
        rentExcl: 790,
        charges: 90,
        deposit: 1580,
        hasRevisionClause: true,
        irlBaseQuarter: 'T3 2024',
        irlBaseValue: 144.51,
        dpeRating: 'C',
        dpeExpiryDate: '2032-05-10',
        pnoExpiryDate: '2026-02-01',
        tenantName: 'Lucas Bernard',
        tenantEmail: 'lucas.bernard@gmail.com',
        tenantPhone: '07 89 45 12 30',
        gliProvider: 'Visale',
        createdAt: '2025-01-15',
        vaultDocuments: {
          leaseFile: { name: 'Bail_habitation_meuble_signe.pdf', category: 'BIEN', size: '1.2 Mo' },
          edlFile: { name: 'EDLE_contradictoire_Delorme.pdf', category: 'BIEN', size: '3.4 Mo' },
          dpeFile: { name: 'DDT_Complet_DPE_C.pdf', category: 'BIEN', size: '2.1 Mo' },
          insuranceFile: { name: 'Attestation_MRH_Lucas_Bernard.pdf', category: 'LOCATAIRE', size: '320 Ko' }
        }
      }
    ],
    rents: [
      {
        id: 'rent_delorme_mars2025',
        propertyId: 'prop_delorme_1',
        month: 'Mars',
        year: 2025,
        period: '01/03/2025 au 31/03/2025',
        rentAmount: 790,
        chargesAmount: 90,
        total: 880,
        status: 'PAID',
        paidDate: '04/03/2025',
        paymentMethod: 'Virement bancaire'
      }
    ],
    expenses: [
      {
        id: 'exp_delorme_honoraires',
        propertyId: 'prop_delorme_1',
        date: '2025-01-15',
        label: 'Honoraires mise en location DRYOS Immobilier',
        amount: 550,
        category: 'HONORAIRES_DRYOS',
        notes: '100% déductible des revenus locatifs (art. 31 du CGI)'
      }
    ]
  },
  {
    id: 'client_marceau',
    fullName: 'Sophie Marceau-Dupont',
    email: 'sophie.mdupont@example.com',
    phone: '06 98 76 54 32',
    mandateType: 'GESTION_COMPLETE',
    status: 'ACTIVE',
    createdAt: '2024-11-01',
    notes: 'Mandat Sérénité DRYOS. Encaissement et relances gérés.',
    invitationSentAt: '2024-11-02',
    configuredByAdmin: true,
    properties: [
      {
        id: 'prop_marceau_1',
        name: 'T3 Parc de la Tête d\'Or',
        address: '28 boulevard des Belges, 69006 Lyon',
        surface: 68,
        rooms: 3,
        floor: '2e',
        leaseType: 'vide',
        leaseStartDate: '2024-11-01',
        leaseDurationYears: 3,
        chargesMode: 'provisions',
        rentExcl: 1150,
        charges: 130,
        deposit: 1150,
        hasRevisionClause: true,
        irlBaseQuarter: 'T3 2024',
        irlBaseValue: 144.51,
        dpeRating: 'D',
        dpeExpiryDate: '2031-10-12',
        tenantName: 'Thomas & Camille Garnier',
        tenantEmail: 'garnier.camille@orange.fr',
        tenantPhone: '06 45 67 89 01',
        gliProvider: 'Garantie Loyers Impayés DRYOS',
        createdAt: '2024-11-01'
      }
    ],
    rents: [
      {
        id: 'rent_marceau_mars2025',
        propertyId: 'prop_marceau_1',
        month: 'Mars',
        year: 2025,
        period: '01/03/2025 au 31/03/2025',
        rentAmount: 1150,
        chargesAmount: 130,
        total: 1280,
        status: 'PAID',
        paidDate: '05/03/2025',
        paymentMethod: 'Prélèvement automatique'
      }
    ],
    expenses: []
  }
];

/**
 * Fetches all landlord accounts
 */
export async function getLandlordAccounts(): Promise<LandlordAccount[]> {
  try {
    // Attempt Firestore
    const colRef = collection(db, 'admin', 'dryos', 'landlords');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LandlordAccount));
      localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn("Could not fetch admin accounts from Firestore, using local persistence:", err);
  }

  // Fallback to local storage or seed
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  // Initialize with seed
  localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS));
  return SEED_ACCOUNTS;
}

/**
 * Saves or updates a landlord account
 */
export async function saveLandlordAccount(account: LandlordAccount): Promise<void> {
  // Update local storage
  try {
    const current = await getLandlordAccounts();
    const index = current.findIndex(a => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase());
    if (index >= 0) {
      current[index] = account;
    } else {
      current.unshift(account);
    }
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Local storage error saving account:", e);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, 'admin', 'dryos', 'landlords', account.id);
    await setDoc(docRef, account);
  } catch (err) {
    console.warn("Could not sync account to Firestore:", err);
  }
}

/**
 * Creates and sets up a complete turnkey account from the Agency Setup form
 */
export async function createAccountFromSetup(formData: AccountSetupFormData): Promise<LandlordAccount> {
  const accountId = 'client_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const propertyId = 'prop_' + Date.now().toString(36);
  const rentId = 'rent_' + Date.now().toString(36);
  const expenseId = 'exp_' + Date.now().toString(36);

  // 1. Create Property
  const property: Property = {
    id: propertyId,
    name: formData.propertyName || `Bien ${formData.city}`,
    address: formData.address,
    postalCode: formData.postalCode,
    city: formData.city,
    surface: formData.surface,
    rooms: formData.rooms,
    floor: formData.floor,
    leaseType: formData.leaseType,
    leaseStartDate: formData.leaseStartDate,
    leaseDurationYears: formData.leaseDurationYears || (formData.leaseType === 'meuble' ? 1 : 3),
    chargesMode: formData.chargesMode,
    rentExcl: Number(formData.rentExcl) || 0,
    charges: Number(formData.charges) || 0,
    deposit: Number(formData.deposit) || 0,
    hasRevisionClause: formData.hasRevisionClause !== false,
    irlBaseQuarter: formData.irlBaseQuarter || 'T3 2024',
    irlBaseValue: Number(formData.irlBaseValue) || 144.51,
    dpeRating: formData.dpeRating || 'C',
    dpeExpiryDate: formData.dpeExpiryDate || '2032-01-01',
    tenantName: formData.tenantName,
    tenantEmail: formData.tenantEmail,
    tenantPhone: formData.tenantPhone,
    gliProvider: formData.gliProvider || 'Garantie DRYOS',
    guarantor: formData.guarantor,
    createdAt: new Date().toISOString().split('T')[0],
    vaultDocuments: {
      leaseFile: formData.hasSignedLeaseDoc ? {
        name: `Bail_${formData.leaseType}_signe_${formData.tenantName.replace(/\s+/g, '_')}.pdf`,
        category: 'BIEN',
        size: '1.4 Mo'
      } : undefined,
      edlFile: formData.hasEdleDoc ? {
        name: `EDLE_Entree_${formData.tenantName.replace(/\s+/g, '_')}.pdf`,
        category: 'BIEN',
        size: '2.8 Mo'
      } : undefined,
      dpeFile: formData.hasDdtDoc ? {
        name: `DDT_Diagnostic_Performance_Energetique_${formData.dpeRating}.pdf`,
        category: 'BIEN',
        size: '1.9 Mo'
      } : undefined,
      insuranceFile: formData.hasInsuranceDoc ? {
        name: `Attestation_Assurance_MRH_${formData.tenantName.replace(/\s+/g, '_')}.pdf`,
        category: 'LOCATAIRE',
        size: '410 Ko'
      } : undefined
    }
  };

  // 2. Create Current Month Rent
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const now = new Date();
  const currentMonthName = months[now.getMonth()];
  const currentYear = now.getFullYear();

  const currentRent: RentRecord = {
    id: rentId,
    propertyId: property.id,
    month: currentMonthName,
    year: currentYear,
    period: `01/${String(now.getMonth() + 1).padStart(2, '0')}/${currentYear} au ${new Date(currentYear, now.getMonth() + 1, 0).getDate()}/${String(now.getMonth() + 1).padStart(2, '0')}/${currentYear}`,
    rentAmount: property.rentExcl,
    chargesAmount: property.charges,
    total: property.rentExcl + property.charges,
    status: 'PAID',
    paidDate: now.toLocaleDateString('fr-FR'),
    paymentMethod: 'Virement bancaire'
  };

  // 3. Create DRYOS Fee Expense Record (100% Tax Deductible)
  const dryosExpense: ExpenseRecord = {
    id: expenseId,
    propertyId: property.id,
    date: now.toISOString().split('T')[0],
    label: 'Honoraires mise en location DRYOS Immobilier (Visites, constitution bail & EDL)',
    amount: Math.round(property.surface * 10) || 550, // Approx ~10€/m²
    category: 'HONORAIRES_DRYOS',
    notes: 'Honoraires d\'agence de mise en location intégralement déductibles des revenus fonciers (CGI art. 31) ou des BIC (LMNP).'
  };

  const newAccount: LandlordAccount = {
    id: accountId,
    fullName: formData.fullName,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone,
    mandateType: formData.mandateType,
    status: 'INVITATION_ENVOYEE',
    createdAt: new Date().toISOString().split('T')[0],
    invitationSentAt: new Date().toISOString(),
    notes: formData.agencyNotes || 'Compte préparé et mis en place par DRYOS Immobilier.',
    configuredByAdmin: true,
    properties: [property],
    rents: [currentRent],
    expenses: [dryosExpense]
  };

  await saveLandlordAccount(newAccount);
  return newAccount;
}

/**
 * Delete a landlord account
 */
export async function deleteLandlordAccount(accountId: string): Promise<void> {
  try {
    const current = await getLandlordAccounts();
    const filtered = current.filter(a => a.id !== accountId);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error deleting local account:", err);
  }

  try {
    await deleteDoc(doc(db, 'admin', 'dryos', 'landlords', accountId));
  } catch (e) {
    console.warn("Could not delete from Firestore:", e);
  }
}

/**
 * Support Tickets sent from landlords to DRYOS agency
 */
export async function getAgencyTickets(): Promise<DryosSupportTicket[]> {
  try {
    const colRef = collection(db, 'tickets');
    const snapshot = await getDocs(query(colRef, orderBy('createdAt', 'desc')));
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DryosSupportTicket));
    }
  } catch (err) {
    console.warn("Could not fetch tickets from Firestore:", err);
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_TICKETS_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  const defaultTickets: DryosSupportTicket[] = [
    {
      id: 'ticket_1',
      userEmail: 'pierre.delorme@example.com',
      userName: 'Pierre Delorme',
      propertyName: 'T2 République - Lyon 2e',
      type: 'QUESTION_FISCALE',
      status: 'EN_COURS',
      createdAt: '2025-03-10',
      subject: 'Déclaration des revenus fonciers et honoraires DRYOS',
      message: 'Bonjour Dimitri, pouvez-vous me renvoyer le récapitulatif des honoraires déductibles pour ma déclaration ?',
      contactPhone: '06 12 34 56 78'
    },
    {
      id: 'ticket_2',
      userEmail: 'sophie.mdupont@example.com',
      userName: 'Sophie Marceau-Dupont',
      propertyName: 'T3 Parc de la Tête d\'Or',
      type: 'RECHERCHE_LOCATAIRE',
      status: 'OUVERT',
      createdAt: '2025-03-12',
      subject: 'Futur préavis prévu en mai pour le T3',
      message: 'Les locataires m\'ont informé qu\'ils partiraient en mai. Pouvez-vous préparer la nouvelle mise en location ?',
      contactPhone: '06 98 76 54 32'
    }
  ];

  localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(defaultTickets));
  return defaultTickets;
}

export async function updateAgencyTicketStatus(ticketId: string, status: DryosSupportTicket['status']): Promise<void> {
  const tickets = await getAgencyTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index >= 0) {
    tickets[index].status = status;
    localStorage.setItem(LOCAL_STORAGE_TICKETS_KEY, JSON.stringify(tickets));
  }
}

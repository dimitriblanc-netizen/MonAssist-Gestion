export type LeaseType = 'vide' | 'meuble';
export type PropertyType = LeaseType;
export type ChargesMode = 'provisions' | 'forfait';
export type DpeRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'VIERGE';

export interface TenantInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  sharePercent?: number; // quote-part loyer (ex: 50%)
  insuranceExpiry?: string;
}

export interface VaultFileItem {
  id?: string;
  name: string;
  date?: string;
  url?: string;
  dataUrl?: string; // base64 or object URL for real local preview/download
  size?: string;
  category?: 'BIEN' | 'LOCATAIRE' | 'ATTESTATION' | 'COMPTA' | 'AUTRE';
  validUntil?: string;
  rating?: string;
  year?: number;
  amount?: number;
}

export interface Property {
  id: string;
  name: string; // Ex: "2P Voltaire - Paris 11"
  address: string;
  postalCode?: string;
  city?: string;
  isTenseZone?: boolean; // Zone tendue (Paris & Petite Couronne = true par défaut)
  surface?: number; // m²
  rooms?: number;
  floor?: string;

  // Bail
  leaseType: LeaseType; // 'vide' (3 ans) | 'meuble' (1 an)
  type?: LeaseType; // alias retro-compatible
  leaseStartDate?: string; // YYYY-MM-DD
  leaseDurationYears?: number; // 3 ou 1
  chargesMode?: ChargesMode; // 'provisions' (avec régul) ou 'forfait' (meublé)

  // Finances
  rentExcl: number; // Loyer hors charges (€)
  charges: number; // Provisions ou forfait (€)
  deposit?: number; // Dépôt de garantie (€)

  // IRL
  hasRevisionClause?: boolean; // Clause d'indexation dans le bail (défaut: true)
  irlReferenceQuarter?: string; // Trimestre de référence fixé au bail (ex: 'T1', 'T2', 'T3', 'T4')
  irlBaseQuarter?: string; // ex: "T3 2024"
  irlBaseValue?: number; // ex: 144.51
  irlQuarter?: string; // alias retro-compatible
  irlIndex?: number; // alias retro-compatible
  lastRevisionDate?: string; // Date de la dernière révision effective (YYYY-MM-DD)

  // Conformité & Technique
  dpeRating?: DpeRating; // Si F ou G -> Loi Climat bloque la révision IRL !
  dpeExpiryDate?: string;
  pnoExpiryDate?: string; // Assurance Propriétaire Non Occupant
  pnoTacitRenewal?: boolean; // Tacite reconduction annuelle (souvent le cas)
  pnoInsurer?: string; // Nom assureur ex: "Macif"
  hasGli?: boolean; // Présence Garantie Loyers Impayés
  gliProvider?: string; // "Visale", "Galian", etc.
  hasGasHeating?: boolean; // Chaudière gaz/fioul -> entretien annuel obligatoire
  boilerCheckDate?: string;
  hasChimney?: boolean; // Ramonage annuel obligatoire

  // Locataires (simple ou colocation)
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantInsuranceExpiry?: string; // Assurance MRH locataire
  insuranceValidUntil?: string; // alias retro-compatible
  insuranceCertificateFile?: string; // Fichier ou nom de pièce d'assurance
  boilerCertificateFile?: string; // Fichier ou attestation d'entretien chaudière
  guarantor?: string;
  notes?: string;

  // Régularisation annuelle des charges (provisions)
  lastChargesRegulDate?: string; // Dernière date de décompte transmis
  lastAnnualChargesActual?: number; // Montant réel constaté lors de la dernière régul (€)

  // Coffre-fort numérique & Dossiers
  vaultDocuments?: {
    leaseFile?: VaultFileItem;
    edlFile?: VaultFileItem;
    taxeFonciereFile?: VaultFileItem;
    dpeFile?: VaultFileItem;
    insuranceFile?: VaultFileItem;
    boilerFile?: VaultFileItem;
    tenantIdCardFile?: VaultFileItem;
    salaryProofFile?: VaultFileItem;
    cautionFile?: VaultFileItem;
    extraFiles?: VaultFileItem[];
  };

  // Colocation / Multi-locataires
  isColocation?: boolean;
  tenants?: TenantInfo[];

  createdAt: string;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'LATE' | 'LATE_J10' | 'LATE_J20' | 'LATE_J35';

export interface RentRecord {
  id: string;
  propertyId: string;
  month: string; // "Mars"
  year: number; // 2025
  period: string; // "01/03/2025 au 31/03/2025"
  rentAmount: number;
  chargesAmount: number;
  total: number;
  status: PaymentStatus;
  paidDate?: string;
  paymentMethod?: string;
}

export type ExpenseCategory = 
  | 'COPRO_DEDUCTIBLE'    // Charges de copropriété déductibles
  | 'ASSURANCE_PNO_GLI'   // Primes d'assurance PNO et GLI
  | 'TRAVAUX_ENTRETIEN'   // Travaux d'entretien et réparation
  | 'HONORAIRES_DRYOS'    // Honoraires de mise en location DRYOS (100% déductibles 1ère année)
  | 'TAXE_FONCIERE_HORS_TEOM' // Taxe foncière (hors TEOM récupérable)
  | 'INTERETS_EMPRUNT'    // Intérêts du crédit immobilier
  | 'AUTRE_DEDUCTIBLE';

export interface ExpenseRecord {
  id: string;
  propertyId: string;
  date: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  notes?: string;
  proofUrl?: string; // photo ou facture compressée
}

export interface ActionItem {
  id: string;
  propertyId: string;
  priority: 'RED' | 'ORANGE' | 'GREEN';
  type: 
    | 'RENT_COLLECTION'     // Pointer loyer du mois
    | 'UNPAID_J10'          // J+10: Relance amiable
    | 'UNPAID_J20'          // J+20: LRAR Mise en demeure
    | 'UNPAID_J35'          // J+35: Déclaration Visale / Sinistre GLI
    | 'INSURANCE_MRH'       // Demander attestation assurance locataire
    | 'PNO_RENEWAL'         // Renouvellement PNO
    | 'BOILER_CHECK'        // Entretien annuel chaudière
    | 'IRL_ANNIVERSARY'     // Date anniversaire révision IRL
    | 'IRL_BLOCKED_DPE'     // Info: révision bloquée car DPE F/G
    | 'CONGE_NOTICE_WINDOW' // Fenêtre de tir pour donner congé au locataire
    | 'CHARGES_REGUL';      // Régularisation annuelle des charges
  title: string;
  description: string;
  actionLabel: string;
  dueDays?: number;
}

// Retro-compatible Incident types
export type IncidentCategory = 'PLOMBERIE' | 'ELECTRICITE' | 'CHAUFFAGE' | 'COPROPRIETE' | 'AUTRE';
export type IncidentStatus = 'A_TRAITER' | 'EN_COURS' | 'RESOLU';

export interface Incident {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  reportedDate?: string;
  date?: string;
  resolvedDate?: string;
  costEstimate?: number;
  actualCost?: number;
  cost?: number;
  isTaxDeductible?: boolean;
  isDeductible?: boolean;
  contactNotes?: string;
}

// Retro-compatible DocumentRecord
export interface DocumentRecord {
  id: string;
  propertyId: string;
  title: string;
  type?: 'BAIL' | 'EDL' | 'DPE' | 'ASSURANCE' | 'QUITTANCE' | 'AUTRE';
  category?: string;
  fileName?: string;
  filename?: string;
  fileSize?: string;
  size?: string;
  uploadedAt?: string;
  date?: string;
  expiresAt?: string;
  url?: string;
}

// Retro-compatible DryosSupportTicket
export interface DryosSupportTicket {
  id: string;
  propertyId: string;
  type: 'PREAVIS_RECU' | 'RECHERCHE_LOCATAIRE' | 'LITIGE_JURIDIQUE' | 'QUESTION_FISCALE' | 'AUTRE';
  status: 'OUVERT' | 'EN_COURS' | 'CLOS' | 'TRANSMIS';
  createdAt: string;
  subject: string;
  message: string;
  contactPhone?: string;
}

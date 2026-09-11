import { Property, RentRecord, ExpenseRecord } from '../types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop_paris11',
    name: 'T2 Charonne / Voltaire',
    address: '42 Rue Léon Frot',
    city: 'Paris',
    postalCode: '75011',
    isTenseZone: true,
    floor: '3ème étage sur cour',
    surface: 46,
    rooms: 2,
    leaseType: 'meuble',
    leaseStartDate: '2024-09-01',
    leaseDurationYears: 1,
    chargesMode: 'provisions',
    rentExcl: 1350,
    charges: 110,
    deposit: 2700,
    irlBaseQuarter: 'T2 2024',
    irlBaseValue: 145.17,
    dpeRating: 'D',
    pnoExpiryDate: '2025-10-30',
    hasGli: true,
    gliProvider: 'Visale',
    hasGasHeating: true,
    boilerCheckDate: '2024-10-15',
    hasChimney: false,
    tenantName: 'Camille Rochefort',
    tenantEmail: 'camille.rochefort@example.com',
    tenantPhone: '06 45 89 12 34',
    tenantInsuranceExpiry: '2025-08-31',
    guarantor: 'Visale (Action Logement)',
    createdAt: '2024-09-01'
  },
  {
    id: 'prop_paris17',
    name: 'Studio Batignolles',
    address: '14 Rue des Moines',
    city: 'Paris',
    postalCode: '75017',
    isTenseZone: true,
    floor: '2ème étage',
    surface: 23,
    rooms: 1,
    leaseType: 'meuble',
    leaseStartDate: '2024-11-15',
    leaseDurationYears: 1,
    chargesMode: 'forfait',
    rentExcl: 840,
    charges: 70,
    deposit: 1680,
    irlBaseQuarter: 'T3 2024',
    irlBaseValue: 144.51,
    dpeRating: 'C',
    pnoExpiryDate: '2025-11-30',
    hasGli: true,
    gliProvider: 'Galian',
    hasGasHeating: false,
    hasChimney: false,
    tenantName: 'Thomas Leroy',
    tenantEmail: 'thomas.leroy92@example.com',
    tenantPhone: '07 81 22 54 90',
    tenantInsuranceExpiry: '2025-11-14',
    guarantor: 'Parents (Caution solidaire)',
    createdAt: '2024-11-15'
  },
  {
    id: 'prop_boulogne',
    name: '3 Pièces Rives de Seine',
    address: '18 Mail du Maréchal Leclerc',
    city: 'Boulogne-Billancourt',
    postalCode: '92100',
    isTenseZone: true,
    floor: '4ème avec balcon',
    surface: 68,
    rooms: 3,
    leaseType: 'vide',
    leaseStartDate: '2023-04-01',
    leaseDurationYears: 3,
    chargesMode: 'provisions',
    rentExcl: 1850,
    charges: 180,
    deposit: 1850,
    irlBaseQuarter: 'T1 2023',
    irlBaseValue: 138.08,
    dpeRating: 'F', // Passoire thermique -> Bloque IRL pour tester la règle légale !
    pnoExpiryDate: '2025-06-15',
    hasGli: false,
    hasGasHeating: false,
    hasChimney: false,
    tenantName: 'Alexandre & Sophie Morvan',
    tenantEmail: 'famille.morvan@example.com',
    tenantPhone: '06 12 78 45 99',
    tenantInsuranceExpiry: '2025-04-15',
    guarantor: 'Aucun (Couple CDI confirmés)',
    createdAt: '2023-04-01'
  }
];

export const INITIAL_RENTS: RentRecord[] = [
  // Paris 11 (Mars 2025: en attente pour tester le pointing 1-clic)
  {
    id: 'rent_p11_03_2025',
    propertyId: 'prop_paris11',
    month: 'Mars',
    year: 2025,
    period: '01/03/2025 au 31/03/2025',
    rentAmount: 1350,
    chargesAmount: 110,
    total: 1460,
    status: 'PENDING',
    paymentMethod: 'Virement bancaire'
  },
  {
    id: 'rent_p11_02_2025',
    propertyId: 'prop_paris11',
    month: 'Février',
    year: 2025,
    period: '01/02/2025 au 28/02/2025',
    rentAmount: 1350,
    chargesAmount: 110,
    total: 1460,
    status: 'PAID',
    paidDate: '04/02/2025',
    paymentMethod: 'Virement bancaire'
  },
  {
    id: 'rent_p11_01_2025',
    propertyId: 'prop_paris11',
    month: 'Janvier',
    year: 2025,
    period: '01/01/2025 au 31/01/2025',
    rentAmount: 1350,
    chargesAmount: 110,
    total: 1460,
    status: 'PAID',
    paidDate: '03/01/2025',
    paymentMethod: 'Virement bancaire'
  },

  // Paris 17 (Mars 2025: payé)
  {
    id: 'rent_p17_03_2025',
    propertyId: 'prop_paris17',
    month: 'Mars',
    year: 2025,
    period: '01/03/2025 au 31/03/2025',
    rentAmount: 840,
    chargesAmount: 70,
    total: 910,
    status: 'PAID',
    paidDate: '05/03/2025',
    paymentMethod: 'Virement bancaire'
  },

  // Boulogne (Mars 2025: en retard J+10 pour tester la relance et LRAR)
  {
    id: 'rent_boulogne_03_2025',
    propertyId: 'prop_boulogne',
    month: 'Mars',
    year: 2025,
    period: '01/03/2025 au 31/03/2025',
    rentAmount: 1850,
    chargesAmount: 180,
    total: 2030,
    status: 'LATE_J10',
    paymentMethod: 'Virement bancaire'
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp_dryos_1',
    propertyId: 'prop_paris11',
    date: '2024-09-01',
    label: 'Honoraires de mise en location DRYOS Immobilier',
    amount: 690,
    category: 'HONORAIRES_DRYOS',
    notes: 'Facture 100% déductible des revenus fonciers'
  },
  {
    id: 'exp_pno_1',
    propertyId: 'prop_paris11',
    date: '2024-10-30',
    label: 'Prime annuelle assurance PNO (Propriétaire Non Occupant)',
    amount: 145,
    category: 'ASSURANCE_PNO_GLI'
  },
  {
    id: 'exp_copro_1',
    propertyId: 'prop_paris11',
    date: '2025-01-05',
    label: 'Appel de fonds copropriété T1 2025 (Part déductible)',
    amount: 320,
    category: 'COPRO_DEDUCTIBLE'
  }
];

import { Property, DpeRating } from '../types';

export interface IrlIndexRecord {
  quarter: string; // Ex: 'T3 2024'
  quarterCode: 'T1' | 'T2' | 'T3' | 'T4';
  year: number;
  value: number;
  publishDate?: string;
}

// Table officielle INSEE des indices de référence des loyers (IRL)
export const OFFICIAL_IRL_SERIES: IrlIndexRecord[] = [
  { quarter: 'T4 2024', quarterCode: 'T4', year: 2024, value: 144.75, publishDate: '17/01/2025' },
  { quarter: 'T3 2024', quarterCode: 'T3', year: 2024, value: 144.51, publishDate: '15/10/2024' },
  { quarter: 'T2 2024', quarterCode: 'T2', year: 2024, value: 145.17, publishDate: '12/07/2024' },
  { quarter: 'T1 2024', quarterCode: 'T1', year: 2024, value: 143.46, publishDate: '16/04/2024' },
  { quarter: 'T4 2023', quarterCode: 'T4', year: 2023, value: 142.06, publishDate: '16/01/2024' },
  { quarter: 'T3 2023', quarterCode: 'T3', year: 2023, value: 141.03, publishDate: '13/10/2023' },
  { quarter: 'T2 2023', quarterCode: 'T2', year: 2023, value: 140.59, publishDate: '13/07/2023' },
  { quarter: 'T1 2023', quarterCode: 'T1', year: 2023, value: 138.61, publishDate: '14/04/2023' },
  { quarter: 'T4 2022', quarterCode: 'T4', year: 2022, value: 137.26, publishDate: '13/01/2023' },
  { quarter: 'T3 2022', quarterCode: 'T3', year: 2022, value: 136.27, publishDate: '14/10/2022' },
  { quarter: 'T2 2022', quarterCode: 'T2', year: 2022, value: 135.84, publishDate: '13/07/2022' },
  { quarter: 'T1 2022', quarterCode: 'T1', year: 2022, value: 133.93, publishDate: '15/04/2022' },
  { quarter: 'T4 2021', quarterCode: 'T4', year: 2021, value: 132.62, publishDate: '14/01/2022' },
  { quarter: 'T3 2021', quarterCode: 'T3', year: 2021, value: 131.67, publishDate: '15/10/2021' },
  { quarter: 'T2 2021', quarterCode: 'T2', year: 2021, value: 131.12, publishDate: '13/07/2021' },
  { quarter: 'T1 2021', quarterCode: 'T1', year: 2021, value: 130.69, publishDate: '15/04/2021' },
  { quarter: 'T4 2020', quarterCode: 'T4', year: 2020, value: 130.52, publishDate: '15/01/2021' },
  { quarter: 'T3 2020', quarterCode: 'T3', year: 2020, value: 130.59, publishDate: '15/10/2020' },
  { quarter: 'T2 2020', quarterCode: 'T2', year: 2020, value: 130.57, publishDate: '10/07/2020' },
  { quarter: 'T1 2020', quarterCode: 'T1', year: 2020, value: 130.57, publishDate: '15/04/2020' }
];

export interface IrlCalculationResult {
  // Statut légal
  isBlockedByDpe: boolean;
  dpeBlockReason?: string;
  isBlockedByMissingClause: boolean;
  clauseBlockReason?: string;
  canRevise: boolean;

  // Références indices
  quarterCode: 'T1' | 'T2' | 'T3' | 'T4';
  previousQuarterLabel: string;
  previousIndexValue: number;
  newQuarterLabel: string;
  newIndexValue: number;

  // Loyer actuel
  currentRentExcl: number;
  charges: number;

  // Options pré-calculées
  options: {
    max: {
      label: 'Augmentation maximale (100% IRL)',
      sublabel: 'Plafond légal strict INSEE',
      newRentExcl: number;
      increaseAmount: number;
      percentIncrease: number;
      newTotalRent: number;
    };
    moderate: {
      label: 'Augmentation modérée (50% IRL)',
      sublabel: 'Geste d\'équilibre avec le locataire',
      newRentExcl: number;
      increaseAmount: number;
      percentIncrease: number;
      newTotalRent: number;
    };
    freeze: {
      label: 'Maintien du loyer (0%)',
      sublabel: 'Gel du loyer cette année',
      newRentExcl: number;
      increaseAmount: 0;
      percentIncrease: 0;
      newTotalRent: number;
    };
  };

  // Analyse historique & rattrapage
  yearsSinceStartOrLastRevision: number;
  isCatchup: boolean;
  lostPastEstimate: number; // Montant estimé perdu à cause de la non-rétroactivité
  catchupExplanation?: string;
}

/**
 * Détermine le trimestre IRL de référence pour un bien.
 */
export function getReferenceQuarterCode(property: Property): 'T1' | 'T2' | 'T3' | 'T4' {
  if (property.irlReferenceQuarter && ['T1', 'T2', 'T3', 'T4'].includes(property.irlReferenceQuarter)) {
    return property.irlReferenceQuarter as 'T1' | 'T2' | 'T3' | 'T4';
  }
  if (property.irlBaseQuarter) {
    const match = property.irlBaseQuarter.match(/T[1-4]/);
    if (match) return match[0] as 'T1' | 'T2' | 'T3' | 'T4';
  }
  if (property.irlQuarter) {
    const match = property.irlQuarter.match(/T[1-4]/);
    if (match) return match[0] as 'T1' | 'T2' | 'T3' | 'T4';
  }
  // Par défaut, déduire à partir de la date de début du bail
  if (property.leaseStartDate) {
    const month = new Date(property.leaseStartDate).getMonth() + 1;
    if (month >= 1 && month <= 3) return 'T4'; // IRL T4 N-1 en vigueur
    if (month >= 4 && month <= 6) return 'T1';
    if (month >= 7 && month <= 9) return 'T2';
    return 'T3';
  }
  return 'T3';
}

/**
 * Moteur de calcul complet de la révision IRL selon la loi du 6 juillet 1989 (art. 17-1)
 * et la Loi Climat et Résilience.
 */
export function computeIrlRevision(property: Property): IrlCalculationResult {
  const currentRentExcl = Number(property.rentExcl) || 0;
  const charges = Number(property.charges) || 0;

  // 1. Garde-fou Passoires thermiques (DPE F ou G)
  const isBlockedByDpe = property.dpeRating === 'F' || property.dpeRating === 'G';
  const dpeBlockReason = isBlockedByDpe
    ? `Logement classé ${property.dpeRating} (passoire thermique) : l'article 159 de la Loi Climat et Résilience du 24 août 2021 interdit formellement toute révision de loyer IRL sans travaux d'amélioration énergétique.`
    : undefined;

  // 2. Garde-fou Absence de clause d'indexation
  const hasClause = property.hasRevisionClause !== false; // true par défaut
  const isBlockedByMissingClause = !hasClause;
  const clauseBlockReason = isBlockedByMissingClause
    ? `Le contrat de bail ne comporte pas de clause expresse d'indexation. Selon l'article 17-1 de la loi du 6 juillet 1989, le loyer ne peut pas être révisé en cours de bail sans cette stipulation.`
    : undefined;

  const canRevise = !isBlockedByDpe && !isBlockedByMissingClause;

  // 3. Trimestre de référence
  const quarterCode = getReferenceQuarterCode(property);

  // Filtrer la série pour ce trimestre de référence
  const quarterSeries = OFFICIAL_IRL_SERIES.filter(s => s.quarterCode === quarterCode);
  const latestPublished = quarterSeries[0] || OFFICIAL_IRL_SERIES[0];

  // Base N-1 : soit celle stockée, soit l'année N-1 dans la série
  let previousQuarterLabel = property.irlBaseQuarter || property.irlQuarter || '';
  let previousIndexValue = property.irlBaseValue || property.irlIndex || 0;

  if (!previousIndexValue || previousIndexValue <= 0) {
    // Si pas spécifié, on prend l'année précédente du même trimestre
    const prevInSeries = quarterSeries[1] || quarterSeries[0];
    previousIndexValue = prevInSeries.value;
    previousQuarterLabel = prevInSeries.quarter;
  } else if (!previousQuarterLabel) {
    const found = OFFICIAL_IRL_SERIES.find(s => Math.abs(s.value - previousIndexValue) < 0.05);
    previousQuarterLabel = found ? found.quarter : `${quarterCode} précédent`;
  }

  const newQuarterLabel = latestPublished.quarter;
  const newIndexValue = latestPublished.value;

  // Formule légale obligatoire : Nouveau loyer = Loyer HC actuel × (IRL N / IRL N-1)
  // Arrondi obligatoire au centime le plus proche (2 décimales)
  let maxNewRent = currentRentExcl;
  let increaseMax = 0;
  let percentMax = 0;

  if (previousIndexValue > 0 && newIndexValue > 0) {
    const rawNewRent = (currentRentExcl * newIndexValue) / previousIndexValue;
    maxNewRent = Math.round(rawNewRent * 100) / 100;
    increaseMax = Math.round((maxNewRent - currentRentExcl) * 100) / 100;
    percentMax = Math.round((((newIndexValue - previousIndexValue) / previousIndexValue) * 100) * 100) / 100;
  }

  // Option 2 : Modérée (50% de l'IRL)
  const increaseMod = Math.round((increaseMax * 0.5) * 100) / 100;
  const modNewRent = Math.round((currentRentExcl + increaseMod) * 100) / 100;
  const percentMod = Math.round((percentMax * 0.5) * 100) / 100;

  // Option 3 : Gel / Maintien (0%)
  const freezeNewRent = currentRentExcl;

  // 4. Analyse historique : Ancienneté & prescription (1 an) / Rattrapage d'oubli
  const now = new Date();
  const baseDateStr = property.lastRevisionDate || property.leaseStartDate;
  let yearsSinceStartOrLastRevision = 1;
  let isCatchup = false;
  let lostPastEstimate = 0;
  let catchupExplanation: string | undefined = undefined;

  if (baseDateStr) {
    const baseDate = new Date(baseDateStr);
    const diffMonths = (now.getFullYear() - baseDate.getFullYear()) * 12 + (now.getMonth() - baseDate.getMonth());
    yearsSinceStartOrLastRevision = Math.max(1, Math.floor(diffMonths / 12));

    if (diffMonths >= 24) {
      // Oubli de plus d'une année !
      isCatchup = true;
      // Estimation de ce qui a été perdu dans le passé du fait de la non-rétroactivité
      // Chaque année écoulée sans révision fait perdre ~12 mois de différentiel
      const missedYears = Math.floor(diffMonths / 12) - 1;
      lostPastEstimate = Math.round(missedYears * 12 * (increaseMax * 0.7) * 100) / 100;
      catchupExplanation = `Votre loyer passe à ${maxNewRent.toFixed(2)} €, mais vous avez perdu environ ${lostPastEstimate.toLocaleString('fr-FR')} € sur les années passées car la révision n'est pas rétroactive.`;
    }
  }

  return {
    isBlockedByDpe,
    dpeBlockReason,
    isBlockedByMissingClause,
    clauseBlockReason,
    canRevise,

    quarterCode,
    previousQuarterLabel,
    previousIndexValue,
    newQuarterLabel,
    newIndexValue,

    currentRentExcl,
    charges,

    options: {
      max: {
        label: 'Augmentation maximale (100% IRL)',
        sublabel: 'Plafond légal strict INSEE',
        newRentExcl: maxNewRent,
        increaseAmount: increaseMax,
        percentIncrease: percentMax,
        newTotalRent: Math.round((maxNewRent + charges) * 100) / 100
      },
      moderate: {
        label: 'Augmentation modérée (50% IRL)',
        sublabel: 'Geste d\'équilibre avec le locataire',
        newRentExcl: modNewRent,
        increaseAmount: increaseMod,
        percentIncrease: percentMod,
        newTotalRent: Math.round((modNewRent + charges) * 100) / 100
      },
      freeze: {
        label: 'Maintien du loyer (0%)',
        sublabel: 'Gel du loyer cette année',
        newRentExcl: freezeNewRent,
        increaseAmount: 0,
        percentIncrease: 0,
        newTotalRent: Math.round((freezeNewRent + charges) * 100) / 100
      }
    },

    yearsSinceStartOrLastRevision,
    isCatchup,
    lostPastEstimate,
    catchupExplanation
  };
}

/**
 * Génère le courrier officiel ou e-mail de notification au locataire selon l'option choisie.
 */
export function generateIrlNotificationLetter(
  property: Property,
  calculation: IrlCalculationResult,
  chosenType: 'max' | 'moderate' | 'freeze' | 'custom',
  customRentExcl?: number
): string {
  let selectedRent = calculation.options.max.newRentExcl;
  let explanationParagraph = '';

  if (chosenType === 'max') {
    selectedRent = calculation.options.max.newRentExcl;
    explanationParagraph = `Cette révision applique l'augmentation légale maximale de +${calculation.options.max.percentIncrease}% basée sur l'évolution de l'indice officiel INSEE entre ${calculation.previousQuarterLabel} et ${calculation.newQuarterLabel}.`;
  } else if (chosenType === 'moderate') {
    selectedRent = calculation.options.moderate.newRentExcl;
    explanationParagraph = `Soucieux de maintenir une relation sereine et de valoriser la qualité de notre relation locative, j'ai pris la décision de modérer cette hausse en n'appliquant que 50% de l'indice légal maximal (soit +${calculation.options.moderate.increaseAmount.toFixed(2)} € au lieu du plafond de +${calculation.options.max.increaseAmount.toFixed(2)} €).`;
  } else if (chosenType === 'freeze') {
    selectedRent = calculation.options.freeze.newRentExcl;
    explanationParagraph = `Bien que les indices INSEE permettent une revalorisation annuelle, j'ai le plaisir de vous informer que je maintiens votre loyer inchangé à ${selectedRent.toFixed(2)} € pour cette année, afin de saluer votre sérieux et la bonne tenue du logement.`;
  } else if (chosenType === 'custom' && customRentExcl !== undefined) {
    selectedRent = customRentExcl;
    explanationParagraph = `Cette revalorisation a été ajustée de manière raisonnée à ${selectedRent.toFixed(2)} € hors charges, en restant strictement en deçà du plafond légal de ${calculation.options.max.newRentExcl.toFixed(2)} €.`;
  }

  const charges = property.charges || 0;
  const newTotal = Math.round((selectedRent + charges) * 100) / 100;
  const isMulti = property.isColocation;

  const letter = `Objet : ${chosenType === 'freeze' ? 'Maintien de votre loyer' : 'Révision annuelle de loyer'} - ${property.name}

Bonjour ${property.tenantName},

${chosenType === 'freeze'
  ? `Je vous contacte à l'occasion de la date anniversaire de votre contrat de location pour le logement situé au ${property.address || property.name}${property.city ? `, ${property.postalCode || ''} ${property.city}` : ''}.

${explanationParagraph}

Votre loyer mensuel reste donc strictement fixé à ${selectedRent.toFixed(2)} € hors charges, soit un total charges comprises de ${newTotal.toFixed(2)} € par mois.

Je vous remercie pour le soin que vous apportez au logement et pour votre ponctualité.`
  : `Conformément à la clause d'indexation insérée dans votre contrat de location pour le logement situé au ${property.address || property.name}${property.city ? `, ${property.postalCode || ''} ${property.city}` : ''}, le loyer fait l'objet d'une révision annuelle basée sur l'Indice de Référence des Loyers (IRL) publié par l'INSEE.

${explanationParagraph}

Éléments du calcul légal (Loi n°89-462 du 6 juillet 1989, art. 17-1) :
• Loyer mensuel hors charges actuel : ${calculation.currentRentExcl.toFixed(2)} €
• Ancien indice de référence (${calculation.previousQuarterLabel}) : ${calculation.previousIndexValue}
• Nouvel indice publié (${calculation.newQuarterLabel}) : ${calculation.newIndexValue}
• Formule légale : ${calculation.currentRentExcl.toFixed(2)} € × (${calculation.newIndexValue} / ${calculation.previousIndexValue})

À compter de la présente notification, votre nouveau loyer mensuel hors charges est fixé à : ${selectedRent.toFixed(2)} €.
Avec vos provisions pour charges actuelles (${charges.toFixed(2)} €), le montant total appelé est de : ${newTotal.toFixed(2)} € / mois.

Je vous remercie de bien vouloir ajuster votre ordre de virement bancaire dès le prochain loyer.`}

Restant à votre disposition pour tout échange,

Bien cordialement,
Votre Propriétaire Bailleur
${isMulti ? '(Notifié aux colocataires solidaires)' : ''}
Accompagné par Dryos Immobilier`;

  return letter;
}

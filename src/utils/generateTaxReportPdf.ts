import { jsPDF } from 'jspdf';
import { Property, RentRecord, ExpenseRecord } from '../types';

export function generateTaxReportPdf(
  property: Property,
  rents: RentRecord[],
  expenses: ExpenseRecord[],
  year: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryTeal = [0, 67, 74]; // #00434A
  const creamBg = [251, 247, 238]; // #FBF7EE

  // Header banner
  doc.setFillColor(creamBg[0], creamBg[1], creamBg[2]);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text(`BILAN FISCAL & AIDE À LA DÉCLARATION ${year}`, 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Bien : ${property.name} (${property.address}, ${property.postalCode} ${property.city})`, 20, 27);
  doc.text(`Régime indicatif : ${property.leaseType === 'vide' ? 'Revenus Fonciers (Micro ou Réel 2044)' : 'LMNP (Micro-BIC ou Réel)'}`, 20, 33);

  // Recettes (Loyers encaissés dans l'année)
  const paidRents = rents.filter(r => r.year === year && r.status === 'PAID');
  const totalRentsExcl = paidRents.reduce((acc, r) => acc + r.rentAmount, 0);
  const totalChargesReceived = paidRents.reduce((acc, r) => acc + r.chargesAmount, 0);
  const totalGrossIncome = totalRentsExcl + totalChargesReceived;

  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('1. RECETTES ENCAISSÉES DANS L\'ANNÉE', 20, y);

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Loyers nus encaissés (${paidRents.length} mois)`, 25, y);
  doc.text(`${totalRentsExcl.toFixed(2)} €`, 160, y, { align: 'right' });

  y += 6;
  doc.text(`Provisions pour charges reçues`, 25, y);
  doc.text(`${totalChargesReceived.toFixed(2)} €`, 160, y, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL DES RECETTES BRUTES (${year}) :`, 25, y);
  doc.text(`${totalGrossIncome.toFixed(2)} €`, 160, y, { align: 'right' });

  // Dépenses déductibles catégorisées
  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('2. CHARGES & DÉPENSES DÉDUCTIBLES', 20, y);

  y += 6;
  doc.line(20, y, 190, y);

  const categories = [
    { key: 'HONORAIRES_DRYOS', label: 'Honoraires de mise en location DRYOS' },
    { key: 'ASSURANCE_PNO_GLI', label: 'Primes d\'assurance PNO & GLI' },
    { key: 'COPRO_DEDUCTIBLE', label: 'Charges de copropriété déductibles' },
    { key: 'TRAVAUX_ENTRETIEN', label: 'Travaux d\'entretien, de réparation et d\'amélioration' },
    { key: 'TAXE_FONCIERE_HORS_TEOM', label: 'Taxe foncière (hors TEOM récupérable)' },
    { key: 'INTERETS_EMPRUNT', label: 'Intérêts d\'emprunt et frais de dossier' },
    { key: 'AUTRE_DEDUCTIBLE', label: 'Autres frais de gestion' }
  ];

  let totalDeductible = 0;
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  categories.forEach(cat => {
    const sum = expenses
      .filter(e => e.category === cat.key && new Date(e.date).getFullYear() === year)
      .reduce((acc, e) => acc + e.amount, 0);

    totalDeductible += sum;

    doc.text(cat.label, 25, y);
    doc.text(`${sum.toFixed(2)} €`, 160, y, { align: 'right' });
    y += 6;
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`TOTAL DES DÉPENSES DÉDUCTIBLES :`, 25, y);
  doc.text(`${totalDeductible.toFixed(2)} €`, 160, y, { align: 'right' });

  // Synthèse Régimes Fiscaux
  y += 16;
  doc.setFillColor(creamBg[0], creamBg[1], creamBg[2]);
  doc.roundedRect(20, y, 170, 48, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('3. SYNTHÈSE INDICATIVE PAR RÉGIME D\'IMPOSITION', 26, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);

  if (property.leaseType === 'vide') {
    const microFoncierAssiette = totalRentsExcl * 0.7; // 30% d'abattement
    const resultatReel = totalRentsExcl - totalDeductible;

    doc.text(`• Option Micro-Foncier (Si recettes brutes < 15 000 €/an) :`, 26, y + 16);
    doc.text(`  Abattement forfaitaire de 30%. Assiette imposable : ${microFoncierAssiette.toFixed(2)} € (Case 4BE).`, 26, y + 21);

    doc.text(`• Option Régime Réel (Formulaire 2044) :`, 26, y + 29);
    doc.text(`  Résultat net imposable : ${resultatReel.toFixed(2)} € (${resultatReel < 0 ? 'DÉFICIT FONCIER reportable' : 'Bénéfice imposable'}).`, 26, y + 34);
    doc.text(`  (Le réel est souvent plus avantageux l'année où vous déduisez les honoraires DRYOS et les travaux !)`, 26, y + 41);
  } else {
    const microBicAssiette = totalGrossIncome * 0.5; // 50% d'abattement
    doc.text(`• Option LMNP Micro-BIC (Si recettes < 77 700 €/an) :`, 26, y + 16);
    doc.text(`  Abattement forfaitaire de 50%. Assiette imposable : ${microBicAssiette.toFixed(2)} € (Case 5ND).`, 26, y + 22);
    doc.text(`• Option LMNP Régime Réel :`, 26, y + 30);
    doc.text(`  Déduction intégrale des charges (${totalDeductible.toFixed(2)} €) + Amortissement comptable de l'immeuble.`, 26, y + 36);
  }

  // Note indicative
  y = 250;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('NOTE D\'INFORMATION (MON ASSIST\'GESTION • DRYOS) :', 20, y + 6);
  const disclaimer = `Ce document est une synthèse récapitulative indicative établie sur la base des encaissements et dépenses enregistrés par le propriétaire bailleur. Il constitue une aide à la préparation de vos déclarations fiscales.`;
  const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
  doc.text(splitDisclaimer, 20, y + 11);

  doc.save(`Bilan_Fiscal_${year}_${property.name.replace(/\s+/g, '_')}.pdf`);
}

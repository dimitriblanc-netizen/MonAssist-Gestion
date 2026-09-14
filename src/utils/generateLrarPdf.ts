import { jsPDF } from 'jspdf';
import { Property, RentRecord } from '../types';

export function generateLrarMiseEnDemeure(property: Property, rent: RentRecord, landlordName = 'Le Bailleur') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const todayStr = new Date().toLocaleDateString('fr-FR');

  // En-tête Expéditeur
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 67, 74); // Teal #00434A
  doc.text(landlordName, 20, 25);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text('Bailleur du logement ci-dessous', 20, 31);
  doc.text('Accompagné par Mon Assist\'Gestion (DRYOS)', 20, 37);

  // Destinataire
  doc.setFillColor(251, 247, 238); // Cream #FBF7EE
  doc.roundedRect(110, 20, 80, 32, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('LETTRE RECOMMANDÉE AVEC AR', 115, 27);
  doc.setFont('helvetica', 'normal');
  doc.text(`À l'attention de : ${property.tenantName}`, 115, 34);
  doc.text(property.address, 115, 40);
  doc.text(`${property.postalCode} ${property.city}`, 115, 46);

  // Date et Lieu
  doc.text(`Fait à ${property.city}, le ${todayStr}`, 20, 58);

  // Objet
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(185, 28, 28); // Rouge avertissement
  doc.text('OBJET : MISE EN DEMEURE DE PAYER SOUS HUITAINE (Clause résolutoire)', 20, 70);

  // Corps juridique
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);

  const lines = [
    `Madame, Monsieur ${property.tenantName},`,
    '',
    `En vertu du contrat de bail consenti le ${new Date(property.leaseStartDate).toLocaleDateString('fr-FR')} pour les locaux d'habitation situés :`,
    `${property.address}, ${property.postalCode} ${property.city},`,
    `vous vous êtes engagé(e) à régler ponctuellement votre loyer et charges au plus tard le 5 de chaque mois.`,
    '',
    `Or, sauf erreur ou omission, le loyer afférent au terme de ${rent.month} ${rent.year}, d'un montant total de :`,
    `>>> ${rent.total.toFixed(2)} € (${rent.rentAmount.toFixed(2)} € hors charges + ${rent.chargesAmount.toFixed(2)} € provisions)`,
    `demeure impayé à ce jour, malgré les relances amiables préalables qui vous ont été adressées.`,
    '',
    `PAR LA PRÉSENTE, JE VOUS METS FORMELLEMENT EN DEMEURE DE RÉGLER LA SOMME DE :`,
    `*** ${rent.total.toFixed(2)} EUROS ***`,
    `dans un délai impératif de huit (8) jours à compter de la réception de cette lettre recommandée.`,
    '',
    `À DÉFAUT DE RÈGLEMENT INTÉGRAL DANS CE DÉLAI :`,
    `1. Il sera fait application de plein droit de la clause résolutoire insérée au bail, entraînant la résiliation judiciaire du bail et votre expulsion.`,
    `2. Le dossier sera immédiatement transmis à notre assureur / organisme de garantie (${property.gliProvider || 'Garantie Loyers Impayés / Visale'}) pour prise en charge du contentieux et poursuites exécutoires (saisie des comptes et rémunérations).`,
    `3. Une déclaration de commandement de payer par Commissaire de Justice (ex-Huissier) sera délivrée à vos frais exclusifs.`,
    '',
    `Dans l'attente de votre complet règlement par virement bancaire sans délai, veuillez agréer, Madame, Monsieur, mes salutations distinguées.`
  ];

  let currentY = 82;
  lines.forEach(l => {
    if (l.startsWith('OBJET') || l.startsWith('PAR LA PRÉSENTE') || l.startsWith('À DÉFAUT')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(l, 20, currentY);
    currentY += 6;
  });

  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text('Le Propriétaire Bailleur', 120, currentY + 10);
  doc.setDrawColor(200, 200, 200);
  doc.rect(120, currentY + 14, 60, 22);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('[Signature & Date]', 123, currentY + 32);

  // Note de bas de page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Document généré via Mon Assist\'Gestion • DRYOS Immobilier.', 20, 287);

  doc.save(`Mise_En_Demeure_LRAR_${property.tenantName.replace(/\s+/g, '_')}_${rent.month}_${rent.year}.pdf`);
}

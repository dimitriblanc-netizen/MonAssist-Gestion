import { jsPDF } from 'jspdf';
import { Property, RentRecord } from '../types';

export function generateQuittancePDF(property: Property, rent: RentRecord, landlordName = 'Propriétaire Bailleur') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const dryosColor = [13, 148, 136]; // Teal 600 / Dryos accent
  const grayText = [100, 116, 139]; // Slate 500

  // Header
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 42, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('QUITTANCE DE LOYER', 20, 22);

  // Subtitle law reference
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('Délivrée conformément à l\'article 21 de la loi n° 89-462 du 6 juillet 1989', 20, 28);
  doc.text('Mise en location réalisée avec DRYOS Immobilier (paris.dryos.fr)', 20, 33);

  // Reference & Date
  const todayStr = new Date().toLocaleDateString('fr-FR');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Réf : QL-${rent.year}-${rent.month.substring(0, 3).toUpperCase()}-${property.id.substring(0, 4)}`, 140, 22);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date d'émission : ${todayStr}`, 140, 28);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 42, 190, 42);

  // 2 Columns: Bailleur & Locataire
  // Bailleur Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(20, 50, 80, 42, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(dryosColor[0], dryosColor[1], dryosColor[2]);
  doc.text('BAILLEUR (PROPRIÉTAIRE)', 25, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(landlordName, 25, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('Gestionnaire direct du bien', 25, 72);
  doc.text('Accompagné par Dryos Immobilier', 25, 78);

  // Locataire Box
  doc.roundedRect(110, 50, 80, 42, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(dryosColor[0], dryosColor[1], dryosColor[2]);
  doc.text(property.isColocation ? 'COLOCATAIRES' : 'LOCATAIRE', 115, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(property.tenantName || 'Locataire en place', 115, 66);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(property.address || property.name, 115, 72);
  doc.text(`${property.postalCode || ''} ${property.city || ''}`.trim() || 'Paris', 115, 78);
  if (property.tenantPhone) {
    doc.text(`Tél : ${property.tenantPhone}`, 115, 84);
  }

  // Logement loué details
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 98, 170, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('LOGEMENT LOUÉ', 26, 106);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  const surfaceStr = property.surface ? ` | Surface : ${property.surface} m²` : '';
  const roomsStr = property.rooms ? ` (${property.rooms} p.)` : '';
  doc.text(`Adresse : ${property.address || property.name}${property.city ? `, ${property.postalCode || ''} ${property.city}` : ''} ${property.floor ? `(${property.floor})` : ''}`, 26, 113);
  doc.text(`Type : Location ${(property.leaseType || property.type) === 'meuble' ? 'Meublée' : 'Vide'}${surfaceStr}${roomsStr}${property.isColocation ? ' | Colocation' : ''}`, 26, 119);

  // Period banner
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, 130, 170, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`PÉRIODE CONCERNÉE : ${rent.month.toUpperCase()} ${rent.year}`, 26, 139);

  // Breakdown table
  let y = 152;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('DÉSIGNATION', 25, y + 6);
  doc.text('MONTANT (€)', 160, y + 6, { align: 'right' });

  y += 10;
  doc.line(20, y, 190, y);

  // Row 1: Loyer nu
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Loyer principal hors charges (${rent.month} ${rent.year})`, 25, y);
  doc.text(`${rent.rentAmount.toFixed(2)} €`, 160, y, { align: 'right' });

  // Row 2: Provisions pour charges
  y += 8;
  doc.text('Provisions pour charges locatives récupérables', 25, y);
  doc.text(`${rent.chargesAmount.toFixed(2)} €`, 160, y, { align: 'right' });

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);

  // Total Row
  y += 9;
  doc.setFillColor(240, 253, 250); // Light teal
  doc.rect(20, y - 6, 170, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(dryosColor[0], dryosColor[1], dryosColor[2]);
  doc.text('TOTAL REÇU ET ACQUITTÉ', 25, y + 2);
  doc.text(`${rent.total.toFixed(2)} €`, 160, y + 2, { align: 'right' });

  // Legal statement & discharge
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  const declarationText = `Je soussigné(e) ${landlordName}, propriétaire du logement désigné ci-dessus, atteste et certifie avoir reçu de ${property.tenantName} la somme de ${rent.total.toFixed(2)} € (soit ${rent.rentAmount.toFixed(2)} € de loyer et ${rent.chargesAmount.toFixed(2)} € de charges), au titre du paiement du loyer et des charges pour la période susmentionnée, et lui en donne quittance sans réserve pour la période considérée.`;
  
  const splitDeclaration = doc.splitTextToSize(declarationText, 170);
  doc.text(splitDeclaration, 20, y);

  // Payment note
  y += (splitDeclaration.length * 5) + 6;
  const payDate = rent.paidDate || new Date().toLocaleDateString('fr-FR');
  const payMethod = rent.paymentMethod || 'Virement bancaire';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text(`Règlement reçu le : ${payDate} par ${payMethod}.`, 20, y);
  doc.text('Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte versé sur la présente période.', 20, y + 5);

  // Signature box
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Fait à ${property.city}, le ${todayStr}`, 130, y);
  doc.text('Signature du bailleur :', 130, y + 6);
  
  // Stamp / dryos signature placeholder
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(130, y + 10, 55, 20, 2, 2, 'D');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('[Mention : Pour valoir quittance]', 133, y + 21);

  // Footer note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.text('Document généré via l\'espace propriétaire DRYOS Immobilier (paris.dryos.fr) - Mise en location sécurisée à Paris & IDF.', 20, 285);

  // Save/Download
  const filename = `Quittance_${rent.month}_${rent.year}_${property.tenantName.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}

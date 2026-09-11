/**
 * Mon Assist'Gestion - Moteur Proactif "Zero-Cognitive Load"
 * Vanilla JavaScript ES6+ (zéro framework, zéro build step)
 */

// Données en mémoire avec persistance locale & Firestore
export class AssistGestionEngine {
  constructor() {
    this.properties = this.loadInitialProperties();
    this.currentPropertyIndex = 0;
    this.rents = this.loadInitialRents();
  }

  loadInitialProperties() {
    const cached = localStorage.getItem('assist_gestion_properties');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      {
        id: "prop_1",
        name: "2 Pièces Voltaire",
        address: "42 Rue Léon Frot",
        postalCode: "75011",
        city: "Paris",
        leaseType: "meuble",
        leaseDurationYears: 1,
        chargesMode: "provisions",
        rentExcl: 1250,
        charges: 90,
        deposit: 2500,
        leaseStartDate: "2024-03-01",
        irlBaseQuarter: "T3 2024",
        irlBaseValue: 144.51,
        dpeRating: "D",
        pnoExpiryDate: "2025-04-15",
        hasGli: true,
        gliProvider: "Visale",
        hasGasHeating: true,
        hasChimney: false,
        tenantName: "Lucas Martin",
        tenantEmail: "lucas.martin@example.fr",
        tenantPhone: "06 12 34 56 78",
        tenantInsuranceExpiry: "2025-03-25"
      }
    ];
  }

  loadInitialRents() {
    const cached = localStorage.getItem('assist_gestion_rents');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      {
        id: "rent_mars_2025",
        propertyId: "prop_1",
        month: "Mars",
        year: 2025,
        total: 1340,
        status: "PENDING", // PENDING | PAID | LATE_J10 | LATE_J20 | LATE_J35
        paymentMethod: "Virement bancaire"
      }
    ];
  }

  save() {
    localStorage.setItem('assist_gestion_properties', JSON.stringify(this.properties));
    localStorage.setItem('assist_gestion_rents', JSON.stringify(this.rents));
  }

  getActiveProperty() {
    return this.properties[this.currentPropertyIndex] || this.properties[0];
  }

  getCurrentRent(propertyId) {
    return this.rents.find(r => r.propertyId === propertyId && r.month === "Mars" && r.year === 2025)
      || this.rents.find(r => r.propertyId === propertyId);
  }

  // Moteur de notifications et filtrage contextuel du jour
  computeActionFeed(property) {
    if (!property) return [];

    const actions = [];
    const now = new Date();
    const currentRent = this.getCurrentRent(property.id);

    // 1. Pointage du loyer & impayés
    if (currentRent) {
      if (currentRent.status === "PENDING") {
        actions.push({
          id: "rent_due",
          priority: "orange",
          type: "RENT_COLLECTION",
          title: `Avez-vous reçu le loyer de ${property.tenantName} (${currentRent.total} €) ?`,
          description: `Exigible au 5 du mois. Confirmez pour générer la quittance en 1 clic.`,
          actionType: "RENT_CONFIRM"
        });
      } else if (currentRent.status === "LATE_J10") {
        actions.push({
          id: "unpaid_j10",
          priority: "red",
          type: "UNPAID_J10",
          title: `Impayé J+10 : Relance amiable nécessaire (${currentRent.total} €)`,
          description: `Envoyez la relance écrite courtoise par SMS/Email pour acter le retard.`,
          actionType: "SEND_REMINDER"
        });
      } else if (currentRent.status === "LATE_J20") {
        actions.push({
          id: "unpaid_j20",
          priority: "red",
          type: "UNPAID_J20",
          title: `Impayé J+20 : Télécharger la Mise en Demeure LRAR`,
          description: `Indispensable pour préserver vos droits et déclarer à l'assurance (${property.gliProvider || 'Visale/GLI'}).`,
          actionType: "DOWNLOAD_LRAR"
        });
      } else if (currentRent.status === "LATE_J35") {
        actions.push({
          id: "unpaid_j35",
          priority: "red",
          type: "UNPAID_J35",
          title: `Drapeau ROUGE J+35 : Déclarer le sinistre à l'assurance`,
          description: `Attention au délai de forclusion ! Dossier récapitulatif pré-rempli pour ${property.gliProvider || 'GLI'}.`,
          actionType: "CLAIM_INSURANCE"
        });
      }
    }

    // 2. Assurance MRH locataire
    if (property.tenantInsuranceExpiry) {
      const expiry = new Date(property.tenantInsuranceExpiry);
      const diffDays = Math.ceil((expiry - now) / (1000 * 3600 * 24));
      if (diffDays <= 0) {
        actions.push({
          id: "mrh_expired",
          priority: "red",
          type: "MRH",
          title: `Attestation assurance locataire échue !`,
          description: `L'attestation de ${property.tenantName} a expiré. Risque majeur en cas de sinistre.`,
          actionType: "REQUEST_MRH"
        });
      } else if (diffDays <= 30) {
        actions.push({
          id: "mrh_expiring",
          priority: "orange",
          type: "MRH",
          title: `Demander l'attestation assurance annuelle (sous ${diffDays}j)`,
          description: `Échéance le ${expiry.toLocaleDateString('fr-FR')}.`,
          actionType: "REQUEST_MRH"
        });
      }
    }

    // 3. Révision IRL et blocage DPE F/G
    if (property.dpeRating === "F" || property.dpeRating === "G") {
      actions.push({
        id: "dpe_block",
        priority: "orange",
        type: "DPE_BLOCK",
        title: `Loi Climat : Révision IRL bloquée (DPE classe ${property.dpeRating})`,
        description: `Passoire thermique : la révision annuelle de loyer est interdite par la loi.`,
        actionType: "DPE_INFO"
      });
    } else {
      const leaseDate = new Date(property.leaseStartDate);
      const monthsSinceStart = (now.getFullYear() - leaseDate.getFullYear()) * 12 + (now.getMonth() - leaseDate.getMonth());
      if (monthsSinceStart >= 12) {
        const estIncrease = Math.round(property.rentExcl * 0.035);
        actions.push({
          id: "irl_due",
          priority: "orange",
          type: "IRL",
          title: `Réappliquer l'augmentation de loyer IRL (+${estIncrease} €) ?`,
          description: `Date anniversaire du bail atteinte. Nouvelle mensualité estimée : ${property.rentExcl + estIncrease} € HC.`,
          actionType: "CALCULATE_IRL"
        });
      }
    }

    // 4. Entretien annuel chaudière gaz / fioul
    if (property.hasGasHeating) {
      actions.push({
        id: "boiler_check",
        priority: "orange",
        type: "BOILER",
        title: "Demander l'attestation d'entretien annuel chaudière",
        description: `Obligation légale annuelle à la charge du locataire ${property.tenantName}.`,
        actionType: "REQUEST_BOILER"
      });
    }

    // 5. Ramonage cheminée
    if (property.hasChimney) {
      actions.push({
        id: "chimney_check",
        priority: "orange",
        type: "CHIMNEY",
        title: "Demander le certificat de ramonage annuel",
        description: `Conformité assurance et règlement sanitaire départemental.`,
        actionType: "REQUEST_CHIMNEY"
      });
    }

    // 6. Assurance PNO Propriétaire
    if (property.pnoExpiryDate) {
      const pnoExpiry = new Date(property.pnoExpiryDate);
      const diffDays = Math.ceil((pnoExpiry - now) / (1000 * 3600 * 24));
      if (diffDays <= 30) {
        actions.push({
          id: "pno_check",
          priority: diffDays <= 0 ? "red" : "orange",
          type: "PNO",
          title: diffDays <= 0 ? "Assurance PNO Propriétaire échue !" : "Renouvellement assurance PNO propriétaire",
          description: `Échéance le ${pnoExpiry.toLocaleDateString('fr-FR')}. Obligation copropriété.`,
          actionType: "CHECK_PNO"
        });
      }
    }

    // 7. Congé bailleur (7 mois avant vide / 4 mois avant meublé)
    const leaseYears = property.leaseDurationYears || (property.leaseType === 'vide' ? 3 : 1);
    const leaseEnd = new Date(property.leaseStartDate);
    leaseEnd.setFullYear(leaseEnd.getFullYear() + leaseYears);
    const monthsToEnd = Math.ceil((leaseEnd - now) / (1000 * 3600 * 24 * 30));

    const isNoticeWindow = property.leaseType === 'vide'
      ? (monthsToEnd <= 7 && monthsToEnd >= 5)
      : (monthsToEnd <= 4 && monthsToEnd >= 2);

    if (isNoticeWindow) {
      actions.push({
        id: "conge_notice",
        priority: "orange",
        type: "CONGE",
        title: "Souhaitez-vous donner congé ou renouveler le bail ?",
        description: `Le bail prend fin le ${leaseEnd.toLocaleDateString('fr-FR')}. Le préavis légal bailleur est de ${property.leaseType === 'vide' ? '6 mois' : '3 mois'}.`,
        actionType: "CONGE_WINDOW"
      });
    }

    // Trier par urgence : red en premier, puis orange, puis green
    const priorityWeight = { red: 1, orange: 2, green: 3 };
    return actions.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
  }

  // Encaissement 1-clic
  validateRent(rentId) {
    const rent = this.rents.find(r => r.id === rentId);
    if (rent) {
      rent.status = "PAID";
      rent.paidDate = new Date().toLocaleDateString('fr-FR');
      this.save();
      this.generateQuittancePDF(this.getActiveProperty(), rent);
    }
  }

  // Marquer impayé
  markLate(rentId, status = "LATE_J10") {
    const rent = this.rents.find(r => r.id === rentId);
    if (rent) {
      rent.status = status;
      this.save();
    }
  }

  // Génération Quittance jsPDF
  generateQuittancePDF(property, rent) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("Quittance enregistrée ! Loyer pointé payé le " + rent.paidDate);
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    doc.setFillColor(0, 67, 74);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("QUITTANCE DE LOYER", 20, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Période : Mois de ${rent.month} ${rent.year}`, 20, 29);

    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("LOGEMENT LOUÉ :", 20, 48);
    doc.setFont("helvetica", "normal");
    doc.text(`${property.name} - ${property.address}, ${property.postalCode} ${property.city}`, 20, 54);

    doc.setFont("helvetica", "bold");
    doc.text("LOCATAIRE :", 20, 64);
    doc.setFont("helvetica", "normal");
    doc.text(`${property.tenantName}`, 20, 70);

    // Tableau de décompte
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 80, 170, 45, 3, 3, 'FD');

    doc.setFont("helvetica", "normal");
    doc.text("Loyer principal :", 25, 90);
    doc.text(`${property.rentExcl.toFixed(2)} €`, 165, 90, { align: "right" });

    doc.text(`Provisions / Forfait charges :`, 25, 100);
    doc.text(`${property.charges.toFixed(2)} €`, 165, 100, { align: "right" });

    doc.setDrawColor(0, 67, 74);
    doc.line(25, 107, 185, 107);

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL REÇU :", 25, 117);
    doc.text(`${rent.total.toFixed(2)} €`, 165, 117, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Reçu le ${rent.paidDate || new Date().toLocaleDateString('fr-FR')} par Virement bancaire.`, 20, 135);
    doc.text("Cette quittance annule tous les reçus qui auraient pu être donnés pour acompte.", 20, 142);

    doc.save(`Quittance_${rent.month}_${rent.year}_${property.tenantName.replace(/\s+/g, '_')}.pdf`);
  }
}

import React, { useState } from 'react';
import { Property } from '../types';
import { 
  TrendingUp, 
  Scale, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Send, 
  Calendar,
  Flame,
  FileText,
  Receipt,
  FolderLock
} from 'lucide-react';

interface LegalRemindersSectionProps {
  property: Property;
  onOpenIrlModal: (prop: Property) => void;
  onOpenChargesModal?: (prop: Property) => void;
  onOpenVaultModal?: (prop: Property) => void;
  onOpenDryosContact: () => void;
}

export const LegalRemindersSection: React.FC<LegalRemindersSectionProps> = ({
  property,
  onOpenIrlModal,
  onOpenChargesModal,
  onOpenVaultModal,
  onOpenDryosContact
}) => {
  // Charges Regularisation state
  const [actualExpenses, setActualExpenses] = useState<number>(property.charges * 12);
  const [provisionsPaid, setProvisionsPaid] = useState<number>(property.charges * 12);
  const balance = provisionsPaid - actualExpenses; // if > 0: refund tenant; if < 0: tenant owes landlord

  // Bail expiration calculation
  const leaseStartDate = new Date(property.leaseStartDate);
  const durationYears = property.leaseDurationYears || (property.leaseType === 'vide' ? 3 : 1);
  const leaseEndDate = new Date(leaseStartDate);
  leaseEndDate.setFullYear(leaseEndDate.getFullYear() + durationYears);

  const today = new Date();
  const daysUntilLeaseEnd = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const monthsUntilLeaseEnd = Math.round(daysUntilLeaseEnd / 30.5);

  const noticeLegalMonths = property.leaseType === 'vide' ? 6 : 3;
  const alertWindowMonths = property.leaseType === 'vide' ? 7 : 4;
  const isInsideNoticeWindow = monthsUntilLeaseEnd <= alertWindowMonths && monthsUntilLeaseEnd >= noticeLegalMonths;

  const isDpeBlocked = property.dpeRating === 'F' || property.dpeRating === 'G';
  const isNoClause = property.hasRevisionClause === false;

  return (
    <div className="space-y-6">
      {/* Grid of Legal Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Révision Annuelle IRL */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-navy-50 text-navy">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Indice de Référence des Loyers (IRL)
                  </h4>
                  <p className="text-xs text-slate-500">Loi du 6 juillet 1989 art. 17-1</p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isDpeBlocked 
                  ? 'bg-status-urgent-bg text-status-urgent-text border border-status-urgent-border' 
                  : isNoClause 
                    ? 'bg-status-warning-bg text-status-warning-text border border-status-warning-border' 
                    : 'bg-status-ok-bg text-status-ok-text border border-status-ok-border'
              }`}>
                {isDpeBlocked ? 'Bloqué (Loi Climat)' : isNoClause ? 'Clause absente' : 'Indexation possible'}
              </span>
            </div>

            {isDpeBlocked ? (
              <div className="p-3.5 rounded-xl bg-status-urgent-bg border border-status-urgent-border text-xs text-status-urgent-text space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-status-urgent" />
                  <span>Passoire thermique (DPE {property.dpeRating})</span>
                </div>
                <p className="leading-relaxed">
                  Conformément à la Loi Climat et Résilience, l'indexation IRL est strictement interdite pour les logements classés F et G.
                </p>
                <button
                  onClick={onOpenDryosContact}
                  className="font-bold text-navy hover:underline inline-block pt-1 cursor-pointer"
                >
                  Contacter Dryos pour un audit de rénovation énergétique →
                </button>
              </div>
            ) : isNoClause ? (
              <div className="p-3.5 rounded-xl bg-status-warning-bg border border-status-warning-border text-xs text-status-warning-text space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-status-warning" />
                  <span>Clause d'indexation absente du bail</span>
                </div>
                <p className="leading-relaxed">
                  L'article 17-1 de la loi du 6 juillet 1989 dispose que la révision du loyer n'est possible que si le contrat de bail comporte expressément une clause d'indexation. À défaut, le loyer reste fixe.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex justify-between">
                  <span>Loyer nu de référence (HC) :</span>
                  <span className="font-bold text-slate-900">{property.rentExcl} € / mois</span>
                </div>
                <div className="flex justify-between">
                  <span>Trimestre IRL de référence :</span>
                  <span className="font-semibold">{property.irlReferenceQuarter || property.irlBaseQuarter || 'T3'}</span>
                </div>
                <div className="flex justify-between text-navy">
                  <span>3 options pré-calculées :</span>
                  <span className="font-bold">100% IRL, 50% modéré ou 0% maintien</span>
                </div>
              </div>
            )}
          </div>

          {!isDpeBlocked && (
            <button
              onClick={() => onOpenIrlModal(property)}
              className="w-full py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-light" />
              <span>Simuler la révision & Choisir mon option</span>
            </button>
          )}
        </div>

        {/* 2. Fenêtre de Tir de Congé Bailleur */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-status-warning-bg text-status-warning-text border border-status-warning-border">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Fenêtre de congé bailleur
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bail {property.leaseType} ({durationYears} an{durationYears > 1 ? 's' : ''})
                  </p>
                </div>
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isInsideNoticeWindow ? 'bg-status-warning-bg text-status-warning-text border border-status-warning-border animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}>
                Échéance bail : {leaseEndDate.toLocaleDateString('fr-FR')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span>Délai légal de préavis bailleur :</span>
                <span className="font-bold text-slate-900">{noticeLegalMonths} mois avant la fin</span>
              </div>
              <div className="flex justify-between">
                <span>Temps restant avant fin de bail :</span>
                <span className="font-semibold">{monthsUntilLeaseEnd} mois (~{daysUntilLeaseEnd} jours)</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                Le congé ne peut être donné que pour 3 motifs stricts : reprise pour habiter, vente du logement, ou motif légitime et sérieux (ex: fautes répétées).
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDryosContact}
            className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-navy text-slate-800 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Assistance préavis & Relocation DRYOS</span>
          </button>
        </div>
      </div>

      {/* 3. Régularisation Annuelle des Charges Locatives */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-navy-50 text-navy">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Régularisation annuelle des charges
              </h4>
              <p className="text-xs text-slate-500">
                Mode actuel : {property.chargesMode === 'provisions' ? 'Provisions sur charges' : 'Forfait fixe'}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {property.chargesMode === 'provisions' ? 'Obligation annuelle' : 'Non applicable (Forfait)'}
          </span>
        </div>

        {property.chargesMode === 'provisions' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total provisions perçues (12 mois)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={provisionsPaid}
                  onChange={(e) => setProvisionsPaid(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
                <span className="text-xs font-bold text-slate-500">€</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dépenses réelles locatives (Relevé syndic)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={actualExpenses}
                  onChange={(e) => setActualExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                />
                <span className="text-xs font-bold text-slate-500">€</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-600">Solde de régularisation :</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-xl font-extrabold ${balance >= 0 ? 'text-status-ok-text' : 'text-status-warning-text'}`}>
                  {balance >= 0 ? `+ ${balance.toFixed(2)} €` : `${balance.toFixed(2)} €`}
                </span>
                <span className="text-[11px] text-slate-500">
                  {balance >= 0 ? 'En faveur du locataire' : 'En faveur du bailleur'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (onOpenChargesModal) {
                    onOpenChargesModal(property);
                  } else {
                    alert(`Courrier de régularisation des charges généré avec un solde de ${balance.toFixed(2)} €.`);
                  }
                }}
                className="mt-2 text-[11px] font-bold text-navy hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>Calculer & générer le décompte légal</span>
                <span>→</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Le bail est stipulé au forfait : aucune régularisation n'est exigible ni possible.
          </p>
        )}
      </div>

      {/* 4. Contrôles Annuels Obligatoires (Checklist) & Coffre-fort */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span>Contrôles réglementaires annuels & Attestations</span>
          </h4>
          {onOpenVaultModal && (
            <button
              onClick={() => onOpenVaultModal(property)}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy border border-navy-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <FolderLock className="w-3.5 h-3.5 text-navy" />
              <span>Ouvrir mon coffre-fort numérique</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Assurance MRH Locataire</span>
            <p className="text-slate-600 text-[11px]">
              Échéance : {new Date(property.tenantInsuranceExpiry).toLocaleDateString('fr-FR')}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border inline-block">
              À jour
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Assurance PNO Propriétaire</span>
            <p className="text-slate-600 text-[11px]">
              {property.pnoTacitRenewal || !property.pnoExpiryDate
                ? (property.pnoInsurer ? `Tacite reconduction (${property.pnoInsurer})` : 'Tacite reconduction annuelle')
                : `Échéance : ${new Date(property.pnoExpiryDate).toLocaleDateString('fr-FR')}`}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border inline-block">
              Valide
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Entretien Chaudière</span>
            <p className="text-slate-600 text-[11px]">
              {property.hasGasHeating ? 'Obligatoire chaque année' : 'Non requis (chauffage coll./électrique)'}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 inline-block">
              {property.hasGasHeating ? 'À vérifier' : 'Non concerné'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">Ramonage Conduit</span>
            <p className="text-slate-600 text-[11px]">
              {property.hasChimney ? 'Certificat annuel' : 'Aucune cheminée'}
            </p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 inline-block">
              {property.hasChimney ? 'À vérifier' : 'Non concerné'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

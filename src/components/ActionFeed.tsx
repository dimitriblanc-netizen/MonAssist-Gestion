import React from 'react';
import { Property, RentRecord, ActionItem } from '../types';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Send, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ActionFeedProps {
  property: Property;
  currentRent?: RentRecord;
  onValidateRent: (rentId: string) => void;
  onRejectRent?: (rentId: string) => void;
  onOpenReminderModal: (prop: Property, rent: RentRecord) => void;
  onGenerateLrar: (prop: Property, rent: RentRecord) => void;
  onOpenIrlModal: (prop: Property) => void;
  onOpenDryosContact: () => void;
}

export const ActionFeed: React.FC<ActionFeedProps> = ({
  property,
  currentRent,
  onValidateRent,
  onRejectRent,
  onOpenReminderModal,
  onGenerateLrar,
  onOpenIrlModal,
  onOpenDryosContact
}) => {
  const actions: ActionItem[] = [];

  const now = new Date();
  const currentDay = now.getDate(); // 1 to 31

  // 1. Pointing Mensuel & Procédure militaire Impayés
  if (currentRent) {
    if (currentRent.status === 'PENDING') {
      actions.push({
        id: 'act_rent_pending',
        propertyId: property.id,
        priority: 'ORANGE',
        type: 'RENT_COLLECTION',
        title: `Validation du loyer de ${currentRent.month} (${currentRent.total} €)`,
        description: `Le loyer est exigible au 5 du mois. Avez-vous constaté le virement de ${property.tenantName} ?`,
        actionLabel: 'Confirmer l\'encaissement (1-clic)'
      });
    } else if (currentRent.status === 'LATE_J10' || (currentRent.status === 'LATE' && currentDay >= 15 && currentDay < 25)) {
      actions.push({
        id: 'act_unpaid_j10',
        propertyId: property.id,
        priority: 'RED',
        type: 'UNPAID_J10',
        title: `Impayé J+10 : Relance amiable nécessaire (${currentRent.total} €)`,
        description: `À J+10 (après le 15), envoyez la relance amiable par SMS/Email pour préserver l'historique de gestion.`,
        actionLabel: 'Envoyer la relance amiable'
      });
    } else if (currentRent.status === 'LATE_J20' || (currentRent.status === 'LATE' && currentDay >= 25)) {
      actions.push({
        id: 'act_unpaid_j20',
        propertyId: property.id,
        priority: 'RED',
        type: 'UNPAID_J20',
        title: `Impayé J+20 : Mise en demeure par LRAR requise (${currentRent.total} €)`,
        description: `Indispensable pour faire courir la clause résolutoire et actionner votre garantie (${property.gliProvider || 'Visale/GLI'}).`,
        actionLabel: 'Générer le PDF de LRAR officiel'
      });
    } else if (currentRent.status === 'LATE_J35') {
      actions.push({
        id: 'act_unpaid_j35',
        propertyId: property.id,
        priority: 'RED',
        type: 'UNPAID_J35',
        title: `Alerte Critique J+35 : Déclaration de sinistre ${property.gliProvider || 'GLI / Visale'}`,
        description: `Attention délai de déchéance ! Vous devez déclarer le sinistre auprès de l'assureur avant le 70ème jour.`,
        actionLabel: 'Guide déclaration sinistre'
      });
    }
  }

  // 2. Assurance MRH locataire (annuelle)
  if (property.tenantInsuranceExpiry) {
    const expiry = new Date(property.tenantInsuranceExpiry);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) {
      actions.push({
        id: 'act_mrh_expired',
        propertyId: property.id,
        priority: 'RED',
        type: 'INSURANCE_MRH',
        title: 'Attestation assurance habitation locataire expirée !',
        description: `L'attestation annuelle de ${property.tenantName} est échue depuis le ${expiry.toLocaleDateString('fr-FR')}. Risque majeur en cas de dégât des eaux ou sinistre.`,
        actionLabel: 'Réclamer l\'attestation (Modèle SMS/Email)'
      });
    } else if (diffDays <= 30) {
      actions.push({
        id: 'act_mrh_expiring',
        propertyId: property.id,
        priority: 'ORANGE',
        type: 'INSURANCE_MRH',
        title: `Attestation assurance locataire à renouveler sous ${diffDays} jours`,
        description: `Échéance le ${expiry.toLocaleDateString('fr-FR')}. Sollicitez la nouvelle attestation dès maintenant.`,
        actionLabel: 'Demander l\'attestation par e-mail'
      });
    }
  }

  // 3. Révision IRL et blocage DPE F/G
  if (property.dpeRating === 'F' || property.dpeRating === 'G') {
    actions.push({
      id: 'act_irl_blocked_dpe',
      propertyId: property.id,
      priority: 'ORANGE',
      type: 'IRL_BLOCKED_DPE',
      title: `Loi Climat : Révision de loyer bloquée (DPE classe ${property.dpeRating})`,
      description: `Le logement est classé passoire thermique. La loi interdit toute revalorisation IRL tant que des travaux d'isolation n'ont pas amélioré la note.`,
      actionLabel: 'Conseil rénovation Dryos'
    });
  } else {
    // Calcul date anniversaire du bail
    const leaseDate = new Date(property.leaseStartDate);
    const monthsSinceStart = (now.getFullYear() - leaseDate.getFullYear()) * 12 + (now.getMonth() - leaseDate.getMonth());
    if (monthsSinceStart >= 12) {
      actions.push({
        id: 'act_irl_due',
        propertyId: property.id,
        priority: 'ORANGE',
        type: 'IRL_ANNIVERSARY',
        title: `Date anniversaire du bail : Révision IRL annuelle disponible`,
        description: `Bail signé il y a plus d'un an (base ${property.irlBaseQuarter}). Vous pouvez appliquer l'indice INSEE pour augmenter le loyer.`,
        actionLabel: 'Calculer la révision IRL'
      });
    }
  }

  // 4. Chaudière gaz annuelle (si applicable)
  if (property.hasGasHeating) {
    actions.push({
      id: 'act_boiler',
      propertyId: property.id,
      priority: 'ORANGE',
      type: 'BOILER_CHECK',
      title: 'Entretien annuel chaudière gaz obligatoire',
      description: `Vérifiez que ${property.tenantName} a bien fait réaliser la visite annuelle d'entretien et ramonage par un chauffagiste certifié.`,
      actionLabel: 'Rappeler l\'obligation au locataire'
    });
  }

  // 5. Ramonage cheminée annuel (si applicable)
  if (property.hasChimney) {
    actions.push({
      id: 'act_chimney',
      propertyId: property.id,
      priority: 'ORANGE',
      type: 'BOILER_CHECK',
      title: 'Certificat de ramonage annuel obligatoire',
      description: `Une cheminée est présente. L'occupant doit justifier d'un certificat de ramonage de moins d'un an (obligation préfectorale et assurance).`,
      actionLabel: 'Demander le certificat'
    });
  }

  // 6. Renouvellement PNO Propriétaire (annuel)
  if (property.pnoExpiryDate) {
    const pnoExpiry = new Date(property.pnoExpiryDate);
    const pnoDiffDays = Math.ceil((pnoExpiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (pnoDiffDays <= 0) {
      actions.push({
        id: 'act_pno_expired',
        propertyId: property.id,
        priority: 'RED',
        type: 'PNO_RENEWAL',
        title: 'Assurance PNO Propriétaire échue !',
        description: `Votre contrat Propriétaire Non Occupant est arrivé à échéance le ${pnoExpiry.toLocaleDateString('fr-FR')}. Obligatoire en copropriété (Loi Alur).`,
        actionLabel: 'Renouveler mon assurance PNO'
      });
    } else if (pnoDiffDays <= 30) {
      actions.push({
        id: 'act_pno_expiring',
        propertyId: property.id,
        priority: 'ORANGE',
        type: 'PNO_RENEWAL',
        title: `Assurance PNO à renouveler sous ${pnoDiffDays} jours`,
        description: `Échéance annuelle le ${pnoExpiry.toLocaleDateString('fr-FR')}. Vérifiez le renouvellement tacite ou l'appel de prime.`,
        actionLabel: 'Vérifier mon contrat PNO'
      });
    }
  }

  // 7. Congé bailleur ou renouvellement de bail
  const leaseStartDateObj = new Date(property.leaseStartDate);
  const leaseYears = property.leaseDurationYears || (property.leaseType === 'vide' ? 3 : 1);
  const leaseEndDate = new Date(leaseStartDateObj);
  leaseEndDate.setFullYear(leaseEndDate.getFullYear() + leaseYears);
  const daysUntilLeaseEnd = Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const monthsUntilLeaseEnd = daysUntilLeaseEnd / 30;

  // Fenêtre de tir : 7 mois avant pour bail vide (préavis légal 6 mois), 4 mois avant pour bail meublé (préavis légal 3 mois)
  const isNoticeWindow = property.leaseType === 'vide' 
    ? (monthsUntilLeaseEnd <= 7.5 && monthsUntilLeaseEnd >= 5.5)
    : (monthsUntilLeaseEnd <= 4.5 && monthsUntilLeaseEnd >= 2.5);

  if (isNoticeWindow) {
    actions.push({
      id: 'act_conge_window',
      propertyId: property.id,
      priority: 'ORANGE',
      type: 'CONGE_NOTICE_WINDOW',
      title: `Échéance de bail : Souhaitez-vous donner congé ou renouveler ?`,
      description: `Le bail expire le ${leaseEndDate.toLocaleDateString('fr-FR')}. Pour donner congé légal au locataire, le préavis est de ${property.leaseType === 'vide' ? '6 mois' : '3 mois'} impératif par huissier ou LRAR reçue.`,
      actionLabel: 'Gérer le congé ou renouvellement'
    });
  }

  return (
    <div id="action-feed-container" className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#00434A] flex items-center space-x-2">
            <span>À faire aujourd'hui</span>
            <span className="hidden sm:inline text-xs px-2.5 py-0.5 rounded-full bg-[#00434A]/10 text-[#00434A] font-semibold">
              Zero-Cognitive Load
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pour <strong>{property.name}</strong> • Locataire : {property.tenantName}
          </p>
        </div>

        {actions.length === 0 ? (
          <div className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-emerald-200 text-[11px] sm:text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            <span>À jour</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-amber-800 bg-amber-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-amber-200 text-[11px] sm:text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>{actions.length} action{actions.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Aucune démarche urgente en attente</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Le loyer du mois est pointé, l'assurance locataire est valide et vos obligations légales sont respectées. Nous vous notifierons au prochain terme.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((act) => {
            const isRed = act.priority === 'RED';
            const isOrange = act.priority === 'ORANGE';

            return (
              <div
                key={act.id}
                id={`action-item-${act.id}`}
                className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 ${
                  isRed
                    ? 'bg-rose-50/80 border-rose-200'
                    : isOrange
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-emerald-50/80 border-emerald-200'
                }`}
              >
                <div className="flex items-start space-x-3 sm:space-x-3.5">
                  <div className={`p-2 sm:p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${
                    isRed ? 'bg-rose-100 text-rose-700' : isOrange ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isRed ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isRed ? 'bg-rose-200 text-rose-800' : isOrange ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'
                      }`}>
                        {isRed ? 'Urgent' : 'Échéance ≤ 30j'}
                      </span>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{act.description}</p>
                  </div>
                </div>

                <div className="sm:flex-shrink-0 flex items-center justify-end w-full sm:w-auto pt-1 sm:pt-0">
                  {act.type === 'RENT_COLLECTION' && currentRent && (
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        id="btn-validate-rent-action"
                        onClick={() => onValidateRent(currentRent.id)}
                        className="flex-1 sm:flex-initial min-h-[46px] px-4 sm:px-5 py-3 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Oui, encaissé</span>
                      </button>
                      <button
                        id="btn-reject-rent-action"
                        onClick={() => {
                          if (onRejectRent) {
                            onRejectRent(currentRent.id);
                          } else {
                            onOpenReminderModal(property, currentRent);
                          }
                        }}
                        className="flex-1 sm:flex-initial min-h-[46px] px-3.5 sm:px-4 py-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs sm:text-sm font-bold transition shadow-xs flex items-center justify-center space-x-1 cursor-pointer active:scale-98"
                      >
                        <span>Non (impayé)</span>
                      </button>
                    </div>
                  )}

                  {act.type === 'UNPAID_J10' && currentRent && (
                    <button
                      onClick={() => onOpenReminderModal(property, currentRent)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{act.actionLabel}</span>
                    </button>
                  )}

                  {act.type === 'UNPAID_J20' && currentRent && (
                    <button
                      onClick={() => onGenerateLrar(property, currentRent)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{act.actionLabel}</span>
                    </button>
                  )}

                  {act.type === 'IRL_ANNIVERSARY' && (
                    <button
                      onClick={() => onOpenIrlModal(property)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-teal-300" />
                      <span>{act.actionLabel}</span>
                    </button>
                  )}

                  {act.type === 'IRL_BLOCKED_DPE' && (
                    <button
                      onClick={onOpenDryosContact}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Conseil Dryos</span>
                    </button>
                  )}

                  {(act.type === 'INSURANCE_MRH' || act.type === 'BOILER_CHECK') && (
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Rappel obligatoire : ${act.title}`);
                        const body = encodeURIComponent(`Bonjour ${property.tenantName},\n\nDans le cadre du suivi réglementaire de votre logement au ${property.address}, pourriez-vous me transmettre par retour de mail le justificatif concernant : ${act.title} ?\n\nBien cordialement,\nVotre Propriétaire Bailleur`);
                        window.location.href = `mailto:${property.tenantEmail}?subject=${subject}&body=${body}`;
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-teal-400" />
                      <span>Envoyer la demande</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

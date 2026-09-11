import React, { useState } from 'react';
import { Property, RentRecord } from '../types';
import { X, Send, Mail, MessageSquare, Copy, Check, AlertTriangle } from 'lucide-react';

interface ReminderModalProps {
  property: Property | null;
  rent: RentRecord | null;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  property,
  rent,
  onClose
}) => {
  if (!property || !rent) return null;

  const [mode, setMode] = useState<'SMS' | 'EMAIL_AMIABLE' | 'EMAIL_FORMEL'>('SMS');
  const [copied, setCopied] = useState(false);

  const smsText = `Bonjour ${property.tenantName}, sauf erreur de ma part, je n'ai pas encore reçu votre règlement pour le loyer de ${rent.month} (${rent.total} €) concernant le logement au ${property.address}. Pouvez-vous vérifier le virement ? Merci d'avance ! Votre bailleur.`;

  const emailAmiable = `Objet : Rappel amical - Loyer de ${rent.month} ${rent.year} (${property.address})

Bonjour ${property.tenantName},

J'espère que vous allez bien.

Je me permets de vous contacter car, sauf anomalie ou retard interbancaire indépendant de votre volonté, je n'ai pas encore constaté le crédit de votre loyer du mois de ${rent.month} ${rent.year} d'un montant de ${rent.total.toFixed(2)} € pour votre appartement au ${property.address}.

Pourriez-vous avoir l'amabilité de vérifier si l'ordre de virement bancaire a bien été validé ? Si le virement est déjà en cours d'acheminement, veuillez ne pas tenir compte de ce message.

Dès réception de votre versement, je vous délivrerai avec plaisir votre quittance de loyer.

En vous remerciant pour votre réactivité, je vous souhaite une excellente journée.

Bien cordialement,
Votre Propriétaire Bailleur
(Accompagné par Dryos Immobilier - paris.dryos.fr)`;

  const emailFormel = `Objet : Relance pour loyer impayé - Échéance ${rent.month} ${rent.year} (${property.address})

Madame, Monsieur ${property.tenantName},

Par la présente, je vous rappelle qu'en vertu du contrat de bail signé le ${new Date(property.leaseStartDate).toLocaleDateString('fr-FR')} pour le logement situé au ${property.address}, le paiement du loyer et des charges doit intervenir au plus tard le 5 de chaque mois.

À ce jour, le loyer du mois de ${rent.month} ${rent.year}, d'un montant de ${rent.total.toFixed(2)} € (dont ${rent.chargesAmount.toFixed(2)} € de provisions pour charges), demeure impayé.

Je vous invite à régulariser sans délai cette situation par virement bancaire. En cas de difficultés passagères, je vous remercie de prendre contact avec moi dans les meilleurs délais afin de convenir d'une solution.

Dans l'attente de votre régularisation, veuillez agréer mes salutations distinguées.

Votre Propriétaire Bailleur`;

  const currentText = mode === 'SMS' ? smsText : mode === 'EMAIL_AMIABLE' ? emailAmiable : emailFormel;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMail = () => {
    const subject = encodeURIComponent(
      mode === 'EMAIL_AMIABLE' 
        ? `Rappel amical - Loyer de ${rent.month} ${rent.year}` 
        : `Relance pour loyer impayé - Échéance ${rent.month} ${rent.year}`
    );
    const body = encodeURIComponent(currentText);
    window.location.href = `mailto:${property.tenantEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="reminder-modal"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Relance de Loyer Impayé</h3>
              <p className="text-xs text-slate-500">
                {property.name} • {property.tenantName} ({rent.month} {rent.year} : {rent.total} €)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Format Selector tabs */}
          <div className="flex items-center space-x-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMode('SMS')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'SMS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Rapide</span>
            </button>

            <button
              onClick={() => setMode('EMAIL_AMIABLE')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'EMAIL_AMIABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Courtois (J+5)</span>
            </button>

            <button
              onClick={() => setMode('EMAIL_FORMEL')}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                mode === 'EMAIL_FORMEL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Email Formel (J+15)</span>
            </button>
          </div>

          {/* Contact Details reminder */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span>Téléphone locataire : <strong>{property.tenantPhone || 'Non renseigné'}</strong></span>
            <span>Email : <strong>{property.tenantEmail || 'Non renseigné'}</strong></span>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message généré
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={mode === 'SMS' ? 4 : 8}
              value={currentText}
              className="w-full text-xs font-sans p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 leading-relaxed focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            Annuler
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier le texte</span>
            </button>

            {mode !== 'SMS' && property.tenantEmail && (
              <button
                onClick={handleOpenMail}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Ouvrir dans ma messagerie</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

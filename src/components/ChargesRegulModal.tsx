import React, { useState } from 'react';
import { Property } from '../types';
import { 
  X, 
  Calculator, 
  Receipt, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Info,
  Euro,
  Scale
} from 'lucide-react';

interface ChargesRegulModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSaveRegul: (updatedProperty: Property) => void;
}

export const ChargesRegulModal: React.FC<ChargesRegulModalProps> = ({
  property,
  isOpen,
  onClose,
  onSaveRegul
}) => {
  if (!isOpen) return null;

  // Calcul des provisions perçues sur 12 mois
  const monthlyProvisions = property.charges || 0;
  const annualProvisionsPaid = monthlyProvisions * 12;

  // Montant réel des charges récupérables arrêté au décompte annuel de copropriété
  const [actualChargesStr, setActualChargesStr] = useState<string>(
    property.lastAnnualChargesActual ? String(property.lastAnnualChargesActual) : String(Math.round(annualProvisionsPaid * 1.05))
  );
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear() - 1);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const actualCharges = Number(actualChargesStr) || 0;
  const balance = actualCharges - annualProvisionsPaid; // > 0 = Locataire doit payer (complément), < 0 = Trop-perçu à rembourser

  const isComplement = balance > 0;
  const isRefund = balance < 0;
  const isBalanced = balance === 0;

  // Lettre de décompte légale (loi du 6 juillet 1989 art. 23)
  const letterText = `Objet : Régularisation annuelle des charges locatives - Exercice ${periodYear}
Logement : ${property.address}
Locataire : ${property.tenantName}

Madame, Monsieur,

Conformément à l'article 23 de la loi n° 89-462 du 6 juillet 1989, je vous prie de bien vouloir trouver ci-dessous le décompte annuel de régularisation des charges locatives pour l'exercice ${periodYear}.

1. RAPPEL DES PROVISIONS VERSÉES :
- Provisions mensuelles : ${monthlyProvisions.toFixed(2)} € / mois
- Total des provisions appelées sur 12 mois : ${annualProvisionsPaid.toFixed(2)} €

2. DÉPENSES RÉELLES RÉCUPÉRABLES ARRÊTÉES AU DÉCOMPTE :
- Montant réel des charges locatives récupérables : ${actualCharges.toFixed(2)} €
(Chauffage collectif, eau, entretien des parties communes, ascenseur, taxe d'enlèvement des ordures ménagères TEOM)

3. SOLDE DE RÉGULARISATION :
${
  isComplement
    ? `-> Solde en faveur du bailleur : +${Math.abs(balance).toFixed(2)} €
Un complément de ${Math.abs(balance).toFixed(2)} € vous est demandé. Vous pouvez régler cette somme lors de votre prochain virement de loyer ou selon un échéancier à convenir ensemble.`
    : isRefund
    ? `-> Solde en faveur du locataire (trop-perçu) : -${Math.abs(balance).toFixed(2)} €
Je vous rembourse ce trop-perçu par déduction sur votre prochaine quittance de loyer (ou par virement bancaire sur votre RIB).`
    : `-> Solde nul : 0,00 € (les provisions correspondaient exactement aux dépenses réelles).`
}

Les pièces justificatives (relevé de charges de copropriété arrêté par le syndic et avis de taxe foncière pour la TEOM) sont tenues à votre disposition.

Restant à votre écoute pour tout échange, je vous prie d'agréer mes salutations distinguées.

Votre Propriétaire Bailleur
(Gestion assistée par Mon Assist'Gestion DRYOS)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    const today = new Date().toISOString().split('T')[0];
    const updated: Property = {
      ...property,
      lastChargesRegulDate: today,
      lastAnnualChargesActual: actualCharges
    };
    onSaveRegul(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#00434A] text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Receipt className="w-6 h-6 text-teal-300" />
              <h3 className="font-black text-lg sm:text-xl tracking-tight">
                Régularisation annuelle des charges
              </h3>
            </div>
            <p className="text-xs text-teal-100/90">
              {property.name} • Décompte annuel légal (Loi du 6 juillet 1989 art. 23)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Info Mode forfait vs provisions */}
          {property.chargesMode === 'forfait' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Bail au forfait de charges :</strong> Votre bail est enregistré avec des charges forfaitaires. En meublé au forfait, aucune régularisation n'est légalement due, sauf clause contraire expresse ou bascule en provisions.
              </div>
            </div>
          )}

          {/* Saisie simplifiée en 2 chiffres */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Calculator className="w-4 h-4 text-[#00434A]" />
              <span>Saisie express (2 chiffres reçus de votre syndic)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Exercice concerné
                </label>
                <input
                  type="number"
                  value={periodYear}
                  onChange={(e) => setPeriodYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Provisions perçues (12 mois)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={`${annualProvisionsPaid.toFixed(2)} €`}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-100 font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
                <span className="text-[10px] text-slate-400">12 × {monthlyProvisions} €/mois</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Charges réelles récupérables (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actualChargesStr}
                  onChange={(e) => setActualChargesStr(e.target.value)}
                  placeholder="Ex : 1380"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:ring-1 focus:ring-[#00434A]"
                />
                <span className="text-[10px] text-teal-700 font-medium">Relevé de décompte syndic</span>
              </div>
            </div>
          </div>

          {/* Résultat visuel immédiat */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isComplement 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : isRefund 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider block">
                {isComplement 
                  ? 'Complément à réclamer au locataire' 
                  : isRefund 
                  ? 'Trop-perçu à rembourser au locataire' 
                  : 'Solde exact à l\'euro près'}
              </span>
              <p className="text-xs opacity-80">
                {isComplement 
                  ? `Les dépenses ont dépassé les provisions de ${Math.abs(balance).toFixed(2)} € sur l'année.` 
                  : isRefund 
                  ? `Vous devez restituer ${Math.abs(balance).toFixed(2)} € perçus en trop à votre locataire.` 
                  : `Les provisions couvraient exactement les charges réelles.`}
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {isComplement ? `+${balance.toFixed(2)} €` : `${balance.toFixed(2)} €`}
            </div>
          </div>

          {/* Lettre légale pré-remplie */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#00434A]" />
                <span>Courrier / Décompte explicatif prêt à l'envoi</span>
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs text-[#00434A] hover:text-[#00343a] font-bold flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le texte'}</span>
              </button>
            </div>

            <textarea
              readOnly
              rows={8}
              value={letterText}
              className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 leading-relaxed resize-none focus:outline-none"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              const subject = encodeURIComponent(`Décompte annuel de régularisation des charges - Exercice ${periodYear}`);
              const body = encodeURIComponent(letterText);
              window.location.href = `mailto:${property.tenantEmail || ''}?subject=${subject}&body=${body}`;
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Envoyer par email au locataire</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-300" />
              <span>{isSaved ? 'Enregistré !' : 'Valider ce décompte'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

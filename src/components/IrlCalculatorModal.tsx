import React, { useState } from 'react';
import { Property } from '../types';
import { X, TrendingUp, Calculator, Copy, Check, Info } from 'lucide-react';

interface IrlCalculatorModalProps {
  property: Property | null;
  onClose: () => void;
  onApplyNewRent?: (propertyId: string, newRentExcl: number, newQuarter: string, newIndex: number) => void;
}

const IRL_INDICES: { quarter: string; value: number }[] = [
  { quarter: 'T3 2024', value: 144.51 },
  { quarter: 'T2 2024', value: 145.17 },
  { quarter: 'T1 2024', value: 143.46 },
  { quarter: 'T4 2023', value: 142.06 },
  { quarter: 'T3 2023', value: 141.03 },
  { quarter: 'T2 2023', value: 140.59 },
  { quarter: 'T1 2023', value: 138.61 }
];

export const IrlCalculatorModal: React.FC<IrlCalculatorModalProps> = ({
  property,
  onClose,
  onApplyNewRent
}) => {
  if (!property) return null;

  // Base rent & base index from property
  const [currentRent, setCurrentRent] = useState<number>(property.rentExcl);
  const [oldIndex, setOldIndex] = useState<number>(property.irlIndex || 140.59);
  const [newQuarter, setNewQuarter] = useState<string>('T2 2024');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedNewIndexObj = IRL_INDICES.find(i => i.quarter === newQuarter) || IRL_INDICES[0];
  const newIndex = selectedNewIndexObj.value;

  // Calculation formula: Loyer actuel * (Nouvel indice / Ancien indice)
  const newRentCalculated = oldIndex > 0 ? Number(((currentRent * newIndex) / oldIndex).toFixed(2)) : currentRent;
  const rentDifference = Number((newRentCalculated - currentRent).toFixed(2));
  const percentIncrease = oldIndex > 0 ? Number((((newIndex - oldIndex) / oldIndex) * 100).toFixed(2)) : 0;
  const newTotalRent = Number((newRentCalculated + property.charges).toFixed(2));

  // Notification letter template
  const notificationLetter = `Objet : Révision légale annuelle de votre loyer - ${property.address}

Bonjour ${property.tenantName},

Conformément à la clause d'indexation insérée dans votre contrat de bail signé pour le logement situé au ${property.address}, ${property.postalCode} ${property.city}, le loyer fait l'objet d'une révision annuelle basée sur l'Indice de Référence des Loyers (IRL) publié par l'INSEE.

Voici les éléments du calcul légal :
- Loyer mensuel hors charges actuel : ${currentRent.toFixed(2)} €
- Ancien indice IRL de référence (${property.irlQuarter || 'Précédent'}) : ${oldIndex}
- Nouvel indice IRL applicable (${newQuarter}) : ${newIndex}
- Formule légale INSEE : ${currentRent.toFixed(2)} € × (${newIndex} / ${oldIndex})

Le nouveau montant de votre loyer hors charges s'élève donc à : ${newRentCalculated.toFixed(2)} € par mois.
En ajoutant vos provisions pour charges de ${property.charges.toFixed(2)} €, le nouveau montant global à régler sera de ${newTotalRent.toFixed(2)} € par mois.

Cette révision prend effet à compter du prochain loyer. Je vous remercie de bien vouloir ajuster votre ordre de virement bancaire pour la prochaine échéance.

Restant à votre entière disposition,

Bien cordialement,
Votre Propriétaire Bailleur
(Accompagné par Dryos Immobilier - paris.dryos.fr)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(notificationLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    if (onApplyNewRent) {
      onApplyNewRent(property.id, newRentCalculated, newQuarter, newIndex);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="irl-calculator-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Calculateur Révision de Loyer (IRL)</h3>
              <p className="text-xs text-slate-500">
                Loi du 6 juillet 1989 (art. 17-1) • {property.name} ({property.city})
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

        {/* Modal Content */}
        <div className="p-6 space-y-6">

          {/* Form input grids */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loyer nu actuel (€/mois)
              </label>
              <input
                type="number"
                value={currentRent}
                onChange={(e) => setCurrentRent(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ancien Indice IRL (Bail)
              </label>
              <input
                type="number"
                step="0.01"
                value={oldIndex}
                onChange={(e) => setOldIndex(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-semibold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Réf : {property.irlQuarter}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nouvel Indice IRL (INSEE)
              </label>
              <select
                value={newQuarter}
                onChange={(e) => setNewQuarter(e.target.value)}
                className="w-full text-sm font-semibold p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                {IRL_INDICES.map(item => (
                  <option key={item.quarter} value={item.quarter}>
                    {item.quarter} ({item.value})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">Valeur : {newIndex}</span>
            </div>
          </div>

          {/* Result Highlight Card */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-5 border border-teal-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
                  Nouveau loyer hors charges
                </span>
                <div className="text-3xl font-extrabold text-teal-950 mt-1">
                  {newRentCalculated.toLocaleString('fr-FR')} € <span className="text-sm font-normal text-slate-600">/ mois</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-teal-800 mt-1">
                  <span className="font-semibold text-emerald-700">+{rentDifference.toFixed(2)} € / mois</span>
                  <span>({percentIncrease > 0 ? `+${percentIncrease}%` : `${percentIncrease}%`})</span>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-teal-200 sm:pl-6">
                <span className="text-xs font-medium text-slate-600 block">Total charges comprises</span>
                <div className="text-xl font-bold text-slate-900 mt-0.5">
                  {newTotalRent.toLocaleString('fr-FR')} €
                </div>
                <span className="text-[11px] text-slate-500">avec {property.charges} € de charges</span>
              </div>
            </div>
          </div>

          {/* Legal tip */}
          <div className="flex items-start space-x-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">Règle légale de révision :</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                La révision n'est pas rétroactive. Elle ne s'applique qu'à compter du jour de la demande formulée au locataire. Le bailleur dispose d'un an après la date d'anniversaire du contrat pour la notifier.
              </p>
            </div>
          </div>

          {/* Letter to tenant preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Modèle de notification prêt à l'envoi
              </label>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1.5 py-1 px-2.5 rounded-md hover:bg-teal-50 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le modèle'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={notificationLetter}
              className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            Fermer
          </button>
          
          <button
            id="btn-apply-irl-update"
            onClick={handleApply}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Mettre à jour le loyer dans l'app ({newRentCalculated.toFixed(2)} €)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Property } from '../types';
import { 
  X, 
  TrendingUp, 
  Calculator, 
  Copy, 
  Check, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  HeartHandshake, 
  Lock, 
  Sparkles,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  computeIrlRevision, 
  generateIrlNotificationLetter, 
  OFFICIAL_IRL_SERIES,
  IrlCalculationResult 
} from '../utils/irlEngine';

interface IrlCalculatorModalProps {
  property: Property | null;
  onClose: () => void;
  onApplyNewRent?: (
    propertyId: string, 
    newRentExcl: number, 
    newQuarter: string, 
    newIndex: number,
    revisionDate: string
  ) => void;
}

type RevisionChoice = 'max' | 'moderate' | 'freeze' | 'custom';

export const IrlCalculatorModal: React.FC<IrlCalculatorModalProps> = ({
  property,
  onClose,
  onApplyNewRent
}) => {
  if (!property) return null;

  // Calcul initial via le moteur IRL
  const initialCalc = computeIrlRevision(property);

  // États locaux modifiables
  const [currentRent, setCurrentRent] = useState<number>(property.rentExcl || 0);
  const [selectedQuarterCode, setSelectedQuarterCode] = useState<'T1' | 'T2' | 'T3' | 'T4'>(initialCalc.quarterCode);
  const [previousIndex, setPreviousIndex] = useState<number>(initialCalc.previousIndexValue);
  const [newQuarter, setNewQuarter] = useState<string>(initialCalc.newQuarterLabel);
  const [hasClause, setHasClause] = useState<boolean>(property.hasRevisionClause !== false);
  const [dpeRating, setDpeRating] = useState<string>(property.dpeRating || 'D');

  // Choix utilisateur parmi les 3 options pré-calculées + personnalisé
  const [choice, setChoice] = useState<RevisionChoice>('max');
  const [customRentValue, setCustomRentValue] = useState<number>(initialCalc.options.moderate.newRentExcl);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Recalcul dynamique si l'utilisateur ajuste manuellement un indice ou un loyer de base
  const selectedNewIndexObj = OFFICIAL_IRL_SERIES.find(i => i.quarter === newQuarter) || OFFICIAL_IRL_SERIES[0];
  const newIndex = selectedNewIndexObj.value;

  // Gardes-fous en temps réel
  const isBlockedDpe = dpeRating === 'F' || dpeRating === 'G';
  const isBlockedNoClause = !hasClause;
  const canRevise = !isBlockedDpe && !isBlockedNoClause;

  // Calculs mathématiques stricts
  // Loyer HC max = Loyer actuel * (Nouvel indice / Ancien indice) arrondi à 2 décimales
  const maxRentCalculated = previousIndex > 0
    ? Math.round(((currentRent * newIndex) / previousIndex) * 100) / 100
    : currentRent;
  const maxIncrease = Math.round((maxRentCalculated - currentRent) * 100) / 100;
  const maxPercent = previousIndex > 0
    ? Math.round((((newIndex - previousIndex) / previousIndex) * 100) * 100) / 100
    : 0;

  // Option 2 : 50% de l'IRL
  const modIncrease = Math.round((maxIncrease * 0.5) * 100) / 100;
  const modRentCalculated = Math.round((currentRent + modIncrease) * 100) / 100;
  const modPercent = Math.round((maxPercent * 0.5) * 100) / 100;

  // Option 3 : Gel (0%)
  const freezeRent = currentRent;

  // Loyer effectif retenu selon le choix
  let effectiveRent = maxRentCalculated;
  if (choice === 'moderate') effectiveRent = modRentCalculated;
  else if (choice === 'freeze') effectiveRent = freezeRent;
  else if (choice === 'custom') effectiveRent = Math.min(customRentValue, maxRentCalculated);

  const charges = property.charges || 0;
  const effectiveTotalRent = Math.round((effectiveRent + charges) * 100) / 100;
  const effectiveIncrease = Math.round((effectiveRent - currentRent) * 100) / 100;

  // Objet de calcul pour la lettre
  const calcForLetter: IrlCalculationResult = {
    ...initialCalc,
    currentRentExcl: currentRent,
    previousIndexValue: previousIndex,
    newIndexValue: newIndex,
    newQuarterLabel: newQuarter,
    options: {
      max: {
        label: 'Augmentation maximale (100% IRL)',
        sublabel: 'Plafond légal strict INSEE',
        newRentExcl: maxRentCalculated,
        increaseAmount: maxIncrease,
        percentIncrease: maxPercent,
        newTotalRent: Math.round((maxRentCalculated + charges) * 100) / 100
      },
      moderate: {
        label: 'Augmentation modérée (50% IRL)',
        sublabel: 'Geste d\'équilibre avec le locataire',
        newRentExcl: modRentCalculated,
        increaseAmount: modIncrease,
        percentIncrease: modPercent,
        newTotalRent: Math.round((modRentCalculated + charges) * 100) / 100
      },
      freeze: {
        label: 'Maintien du loyer (0%)',
        sublabel: 'Gel du loyer cette année',
        newRentExcl: freezeRent,
        increaseAmount: 0,
        percentIncrease: 0,
        newTotalRent: Math.round((freezeRent + charges) * 100) / 100
      }
    }
  };

  const notificationLetter = generateIrlNotificationLetter(
    property,
    calcForLetter,
    choice,
    choice === 'custom' ? effectiveRent : undefined
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(notificationLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApply = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (onApplyNewRent) {
      onApplyNewRent(property.id, effectiveRent, newQuarter, newIndex, todayStr);
    }
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="irl-calculator-modal"
        className="bg-slate-50 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-navy text-emerald-light flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Révision de Loyer IRL
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-navy-50 text-navy border border-navy-200">
                  Loi du 6 juillet 1989 (art. 17-1)
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {property.name || property.address} • Locataire : {property.tenantName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">

          {/* ========================================================================= */}
          {/* 1. GARDE-FOUS STRICTS (DPE PASSOIRE THERMIQUE OU ABSENCE DE CLAUSE)       */}
          {/* ========================================================================= */}
          {isBlockedDpe && (
            <div className="bg-status-urgent-bg border-2 border-status-urgent-border rounded-2xl p-4 text-status-urgent-text space-y-2">
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-5 h-5 text-status-urgent flex-shrink-0" />
                <h4 className="text-sm font-black uppercase tracking-wide text-status-urgent-text">
                  Révision formellement interdite (DPE classe {dpeRating})
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-status-urgent-text">
                <strong>Loi Climat et Résilience (article 159) :</strong> Depuis le 24 août 2022, il est strictement interdit d'augmenter le loyer des logements classés <strong>F ou G</strong> (« passoires thermiques »). La révision IRL est bloquée jusqu'à la réalisation de travaux de rénovation énergétique certifiés par un nouveau DPE.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] font-semibold text-status-urgent-text">
                <span>Sanction : Le locataire peut exiger le remboursement immédiat de tout trop-perçu.</span>
              </div>
            </div>
          )}

          {isBlockedNoClause && !isBlockedDpe && (
            <div className="bg-status-warning-bg border border-status-warning-border rounded-2xl p-4 text-status-warning-text space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-status-warning flex-shrink-0" />
                <h4 className="text-sm font-black text-status-warning-text">
                  Absence de clause d'indexation dans le bail
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-status-warning-text">
                L'article 17-1 de la loi du 6 juillet 1989 dispose que la révision du loyer n'est possible que si le contrat de bail comporte expressément une <strong>clause d'indexation annuelle</strong>. À défaut de clause, le loyer reste fixé pour toute la durée du bail.
              </p>
              <button
                type="button"
                onClick={() => setHasClause(true)}
                className="text-xs font-bold text-navy underline hover:text-navy-800 cursor-pointer pt-1 block"
              >
                Mon bail contient bien une clause d'indexation (activer la révision)
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PARAMÈTRES DU CALCUL (Loyer HC, Indices N-1 et N)                      */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Données de base du calcul
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Uniquement sur le loyer HC (Loi Alur)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Loyer actuel HC */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Loyer HC actuel (€/mois)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={currentRent}
                    onChange={(e) => setCurrentRent(parseFloat(e.target.value) || 0)}
                    disabled={!canRevise}
                    className="w-full text-sm font-black p-2.5 pl-3 pr-8 rounded-xl border border-slate-300 focus:ring-2 focus:ring-navy focus:outline-none disabled:bg-slate-100"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">€</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  + {charges} € de charges
                </span>
              </div>

              {/* Ancien indice N-1 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  IRL de base (Trimestre N-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={previousIndex}
                  onChange={(e) => setPreviousIndex(parseFloat(e.target.value) || 0)}
                  disabled={!canRevise}
                  className="w-full text-sm font-black p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-navy focus:outline-none disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-1 block truncate">
                  Réf : {initialCalc.previousQuarterLabel || 'Signature ou N-1'}
                </span>
              </div>

              {/* Nouvel indice N */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  IRL applicable (Trimestre N)
                </label>
                <select
                  value={newQuarter}
                  onChange={(e) => setNewQuarter(e.target.value)}
                  disabled={!canRevise}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-navy focus:outline-none bg-white disabled:bg-slate-100"
                >
                  {OFFICIAL_IRL_SERIES.map(item => (
                    <option key={item.quarter} value={item.quarter}>
                      {item.quarter} ({item.value})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-status-ok-text font-bold mt-1 block">
                  Valeur INSEE : {newIndex}
                </span>
              </div>
            </div>

            {/* Formule officielle affichée en toute transparence */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
              <span className="font-mono">
                Formule : {currentRent.toFixed(2)} € × ({newIndex} / {previousIndex}) = <strong>{maxRentCalculated.toFixed(2)} €</strong>
              </span>
              <span className="text-status-ok-text font-bold">
                Max légal : +{maxIncrease.toFixed(2)} €/mois (+{maxPercent}%)
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. PARCOURS UTILISATEUR : LES 3 CHOIX DU PROPRIÉTAIRE                      */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Votre décision pour cette révision annuelle
              </span>
              <span className="text-[11px] text-slate-500">
                Choisissez parmi les 3 options pré-calculées
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1 : Augmentation Maximale */}
              <button
                type="button"
                disabled={!canRevise}
                onClick={() => setChoice('max')}
                className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                  choice === 'max'
                    ? 'bg-white border-navy shadow-md ring-2 ring-navy/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 opacity-90'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-50 text-navy border border-navy-200">
                      100% IRL (Max)
                    </span>
                    {choice === 'max' && <CheckCircle2 className="w-4 h-4 text-navy" />}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {maxRentCalculated.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HC</span>
                  </div>
                  <div className="text-[11px] font-bold text-status-ok-text mt-0.5">
                    +{maxIncrease.toFixed(2)} €/mois (+{maxPercent}%)
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  Total CC : {(maxRentCalculated + charges).toLocaleString('fr-FR')} €
                </div>
              </button>

              {/* Option 2 : Augmentation Modérée (50%) */}
              <button
                type="button"
                disabled={!canRevise}
                onClick={() => setChoice('moderate')}
                className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                  choice === 'moderate'
                    ? 'bg-white border-navy shadow-md ring-2 ring-navy/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 opacity-90'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border">
                      Modérée (50%)
                    </span>
                    {choice === 'moderate' && <CheckCircle2 className="w-4 h-4 text-navy" />}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {modRentCalculated.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HC</span>
                  </div>
                  <div className="text-[11px] font-bold text-status-ok-text mt-0.5">
                    +{modIncrease.toFixed(2)} €/mois (+{modPercent}%)
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  Geste de conciliation
                </div>
              </button>

              {/* Option 3 : Gel / Maintien (0%) */}
              <button
                type="button"
                onClick={() => setChoice('freeze')}
                className={`p-4 rounded-2xl border text-left transition relative cursor-pointer flex flex-col justify-between ${
                  choice === 'freeze'
                    ? 'bg-white border-slate-700 shadow-md ring-2 ring-slate-400/20'
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Maintien (0%)
                    </span>
                    {choice === 'freeze' && <CheckCircle2 className="w-4 h-4 text-slate-800" />}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1">
                    {freezeRent.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-500">HC</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                    +0 € (Loyer gelé)
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  Fidélise le locataire
                </div>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. BILAN SI OUBLI DE PLUSIEURS ANNÉES (NON-RÉTROACTIVITÉ & PRESCRIPTION) */}
          {/* ========================================================================= */}
          {initialCalc.isCatchup && initialCalc.catchupExplanation && (
            <div className="bg-status-warning-bg border border-status-warning-border rounded-2xl p-4 text-status-warning-text space-y-1.5 animate-fade-in">
              <div className="flex items-center space-x-2 text-xs font-bold text-status-warning-text">
                <Clock className="w-4 h-4 text-status-warning flex-shrink-0" />
                <span>Rattrapage d'oubli & Règle de non-rétroactivité :</span>
              </div>
              <p className="text-xs text-status-warning-text leading-relaxed font-medium">
                {initialCalc.catchupExplanation}
              </p>
              <p className="text-[11px] text-status-warning-text">
                💡 <em>Règle légale (loi ALUR) :</em> Le nouveau loyer s'applique immédiatement pour l'avenir, mais la loi interdit tout rappel de loyer rétroactif sur les mois écoulés. L'argent non réclamé dans l'année est définitivement prescrit.
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. ENCADRÉ COACHING & CONSEIL RELATION LOCATAIRE (DEMANDÉ STRICTEMENT)    */}
          {/* ========================================================================= */}
          <div className="bg-navy-50 border border-navy-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center space-x-2 text-navy">
              <HeartHandshake className="w-5 h-5 text-navy flex-shrink-0" />
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide text-navy">
                Conseil relation locataire
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              « La révision n'est jamais obligatoire. Conserver un bon locataire (qui paie à l'heure et prend soin du logement) est souvent plus rentable que d'appliquer une hausse maximale. Réfléchissez au risque de vacance locative : un seul mois de logement vide coûte souvent plus cher que l'augmentation annuelle. »
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 6. MODÈLE DE NOTIFICATION PRÊT À L'ENVOI (COURRIER / MAIL)                 */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-navy" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Notification officielle prête pour {property.tenantName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-bold text-navy hover:text-navy-800 flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 transition cursor-pointer border border-slate-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-status-ok" />
                    <span className="text-status-ok-text">Texte copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copier le modèle</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={7}
              value={notificationLetter}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none leading-relaxed"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 bg-white rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            Fermer sans modifier
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <button
              type="button"
              id="btn-apply-irl-update"
              onClick={handleApply}
              disabled={appliedSuccess || (!canRevise && choice !== 'freeze')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-black text-white bg-navy hover:bg-navy-800 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {appliedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-light" />
                  <span>Loyer actualisé ({effectiveRent.toFixed(2)} €) !</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    Valider ce choix ({effectiveRent.toFixed(2)} € HC)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

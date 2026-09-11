import React, { useState } from 'react';
import { Property } from '../types';
import { 
  LogOut, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Scale, 
  Sparkles, 
  PhoneCall, 
  Calendar,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface TenantExitSectionProps {
  property: Property;
  onOpenDryosModal: () => void;
}

export const TenantExitSection: React.FC<TenantExitSectionProps> = ({
  property,
  onOpenDryosModal
}) => {
  // Notice calculator state
  const [noticeReceptionDate, setNoticeReceptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasDeviations, setHasDeviations] = useState<boolean>(false); // État des lieux dégradé ?
  const [restitutionDate, setRestitutionDate] = useState('');
  const [retainedAmount, setRetainedAmount] = useState<number>(0);

  // Notice delay:
  // In zone tendue (Paris & IDF), tenant notice is 1 month de plein droit !
  const noticeMonths = property.isTenseZone || property.leaseType === 'meuble' ? 1 : 3;

  const noticeDate = new Date(noticeReceptionDate);
  const exitDate = new Date(noticeDate);
  exitDate.setMonth(exitDate.getMonth() + noticeMonths);

  // Legal deposit return deadline:
  // 1 month if EDL conforme, 2 months if non-conforme
  const depositMaxDelayMonths = hasDeviations ? 2 : 1;
  const depositDeadline = new Date(exitDate);
  depositDeadline.setMonth(depositDeadline.getMonth() + depositMaxDelayMonths);

  // Late deposit penalty: 10% of monthly rent excl. per month started (Loi Alur)
  const monthlyPenalty = property.rentExcl * 0.10;

  return (
    <div className="space-y-6">
      {/* DRYOS CONVERSION HERO BANNER */}
      <div className="bg-[#00434A] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Passerelle DRYOS Immobilier</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Votre locataire vous a donné son préavis ?
          </h3>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Évitez la vacance locative ! DRYOS prend en charge 100% de la nouvelle mise en location : shooting photo professionnel, diffusion sur les portails majeurs, sélection rigoureuse des dossiers de solvabilité, rédaction du bail officiel et état des lieux d'entrée. Toujours au forfait fixe unique, sans engagement de gestion mensuelle.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-relouer-dryos"
              onClick={onOpenDryosModal}
              className="px-5 py-3 rounded-xl bg-[#FBF7EE] hover:bg-white text-[#00434A] font-extrabold text-xs sm:text-sm transition shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <span>Relouer mon bien avec DRYOS</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://paris.dryos.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-xl border border-teal-600/80 hover:bg-teal-800 text-xs font-semibold text-teal-100 transition"
            >
              Voir les tarifs transparents (paris.dryos.fr)
            </a>
          </div>
        </div>
      </div>

      {/* Legal Exit Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Calculateur de Préavis (Zone Tendue) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00434A]/10 text-[#00434A]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Calculateur de Préavis Locataire
              </h4>
              <p className="text-xs text-slate-500">
                {property.city} ({property.postalCode}) • Zone tendue : {property.isTenseZone ? 'OUI' : 'NON'}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date de première présentation / remise en main propre du préavis :
              </label>
              <input
                type="date"
                value={noticeReceptionDate}
                onChange={(e) => setNoticeReceptionDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span>Délai légal de préavis :</span>
                <span className="font-bold text-[#00434A]">
                  {noticeMonths} mois {property.isTenseZone ? '(Zone Tendue de droit)' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date de fin de bail & état des lieux :</span>
                <span className="font-bold text-slate-900">{exitDate.toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Le locataire reste redevable du loyer et des charges jusqu'à l'expiration du préavis, sauf si un nouveau locataire entre dans les lieux avant avec votre accord.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Restitution du Dépôt de Garantie & Pénalités */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Restitution du Dépôt de Garantie ({property.deposit} €)
              </h4>
              <p className="text-xs text-slate-500">Délais stricts & Pénalités légales Loi Alur</p>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Résultat de l'État des Lieux de Sortie (EDLS) :
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHasDeviations(false)}
                  className={`p-2.5 rounded-xl border font-semibold cursor-pointer ${
                    !hasDeviations ? 'bg-[#00434A] text-white border-[#00434A]' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Conforme à l'entrée
                </button>
                <button
                  type="button"
                  onClick={() => setHasDeviations(true)}
                  className={`p-2.5 rounded-xl border font-semibold cursor-pointer ${
                    hasDeviations ? 'bg-[#00434A] text-white border-[#00434A]' : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  Dégradations constatées
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span>Délai légal de restitution :</span>
                <span className="font-bold text-slate-900">
                  {depositMaxDelayMonths} mois max ({hasDeviations ? 'Devis nécessaires' : 'Restitution intégrale'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date limite impérative :</span>
                <span className="font-bold text-rose-700">{depositDeadline.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span>Pénalité légale en cas de retard :</span>
                <span className="font-bold text-rose-800">
                  + {monthlyPenalty.toFixed(2)} € / mois entamé (10% du loyer HC)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

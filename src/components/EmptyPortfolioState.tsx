import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Receipt, 
  Scale, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface EmptyPortfolioStateProps {
  userName?: string | null;
  onAddFirstProperty: () => void;
  isAdmin?: boolean;
  onLoadTestData?: () => void;
}

export const EmptyPortfolioState: React.FC<EmptyPortfolioStateProps> = ({
  userName,
  onAddFirstProperty,
  isAdmin,
  onLoadTestData
}) => {
  const firstName = userName ? userName.split(' ')[0] : 'Propriétaire';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-light/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-status-ok-bg border border-status-ok-border text-status-ok-text text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-status-ok animate-pulse" />
            <span>Espace personnel connecté</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy tracking-tight mb-3">
            Bienvenue sur votre espace, {firstName} !
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Votre compte est prêt. Ajoutez votre premier bien en 30 secondes : renseignez juste le nom et le loyer, vous pourrez ajouter les documents quand vous les aurez !
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              id="btn-empty-add-property"
              onClick={onAddFirstProperty}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-navy hover:bg-navy-800 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-emerald-light" />
              <span>Ajouter mon premier bien</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Test Mode Quick Loader */}
          {isAdmin && onLoadTestData && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-navy-50 border border-navy-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-emerald-light" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-navy uppercase tracking-wide">
                    Espace Bailleur Personnel (Mode Test DRYOS)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Chargez 3 biens de test complets (loyer payé, impayé avec relance, passoire DPE) pour tester immédiatement toutes les fonctionnalités.
                  </p>
                </div>
              </div>
              <button
                id="btn-empty-load-test-data"
                onClick={onLoadTestData}
                className="px-4 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Charger 3 biens de test</span>
              </button>
            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-navy-100 text-navy flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Pointage en 1 clic</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Chaque mois, validez l'encaissement de vos loyers d'un simple clic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-status-ok-bg border border-status-ok-border text-status-ok-text flex items-center justify-center mb-2.5">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Quittance instantanée</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Génération automatique du PDF conforme Loi ALUR.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-status-warning-bg border border-status-warning-border text-status-warning-text flex items-center justify-center mb-2.5">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Surveillance juridique</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Indexation IRL, fin de bail et relances prêtes à l'envoi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

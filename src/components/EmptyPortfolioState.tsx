import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Receipt, 
  Scale, 
  ArrowRight
} from 'lucide-react';

interface EmptyPortfolioStateProps {
  userName?: string | null;
  onAddFirstProperty: () => void;
}

export const EmptyPortfolioState: React.FC<EmptyPortfolioStateProps> = ({
  userName,
  onAddFirstProperty
}) => {
  const firstName = userName ? userName.split(' ')[0] : 'Propriétaire';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-50/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-slate-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Espace personnel connecté</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#00434A] tracking-tight mb-3">
            Bienvenue sur votre espace, {firstName} !
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Votre compte est prêt. Ajoutez votre premier bien en 30 secondes : renseignez juste le nom et le loyer, vous pourrez ajouter les documents quand vous les aurez !
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              id="btn-empty-add-property"
              onClick={onAddFirstProperty}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#00434A] hover:bg-[#00343a] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-5 h-5 text-teal-300" />
              <span>Ajouter mon premier bien</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#00434A] flex items-center justify-center mb-2.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Pointage en 1 clic</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Chaque mois, validez l'encaissement de vos loyers d'un simple clic.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2.5">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Quittance instantanée</h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Génération automatique du PDF conforme Loi ALUR.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2.5">
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

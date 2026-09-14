import React from 'react';
import { Property } from '../types';
import { Building, Plus, Edit3, CheckCircle2, Sparkles } from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

interface PropertySelectorProps {
  properties: Property[];
  activeProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenOnboarding: () => void;
  onEditProperty?: (property: Property) => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  activeProperty,
  onSelectProperty,
  onOpenOnboarding,
  onEditProperty
}) => {
  const { privacyMode, maskText } = usePrivacy();
  if (!activeProperty) return null;

  // Calcul score de complétion indicatif
  let score = 50; // Nom + Loyer de base
  if (activeProperty.tenantName && activeProperty.tenantName !== 'Locataire en place') score += 20;
  if (activeProperty.pnoTacitRenewal || activeProperty.pnoExpiryDate) score += 15;
  if (activeProperty.dpeRating && activeProperty.dpeRating !== 'VIERGE') score += 15;

  return (
    <div className="bg-white px-3.5 py-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Selector & Property Identity */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-[#00434A]/10 text-[#00434A] flex items-center justify-center font-bold flex-shrink-0">
          <Building className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Bien sélectionné
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
              activeProperty.leaseType === 'meuble' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
            }`}>
              {activeProperty.leaseType === 'meuble' ? 'Meublé (1 an)' : 'Vide (3 ans)'}
            </span>
            {activeProperty.isColocation && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-teal-50 text-teal-800">
                👥 Colocation
              </span>
            )}
          </div>

          <div className="relative mt-0.5">
            <select
              id="select-active-property"
              value={activeProperty.id}
              onChange={(e) => {
                const found = properties.find(p => p.id === e.target.value);
                if (found) onSelectProperty(found);
              }}
              className="text-sm font-black text-[#00434A] bg-transparent border-none cursor-pointer focus:outline-none w-full truncate pr-4"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {privacyMode ? maskText(p.tenantName) : p.tenantName} ({privacyMode ? '•••• €' : `${p.rentExcl + p.charges} €/mois`})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons : Modifier / Compléter & Ajouter un bien */}
      <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
        {onEditProperty && (
          <button
            type="button"
            onClick={() => onEditProperty(activeProperty)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
            title="Compléter les informations du bien (DPE, PNO, assurance...)"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Modifier / Compléter</span>
            {score < 100 && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                {score}%
              </span>
            )}
          </button>
        )}

        <button
          id="btn-add-property-tunnel"
          onClick={onOpenOnboarding}
          className="px-3 py-1.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-xs font-bold text-white transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nouveau bien</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Property } from '../types';
import { Building, Plus, ChevronDown, Check } from 'lucide-react';

interface PropertySelectorProps {
  properties: Property[];
  activeProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenOnboarding: () => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  activeProperty,
  onSelectProperty,
  onOpenOnboarding
}) => {
  return (
    <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#00434A]/10 text-[#00434A] flex items-center justify-center font-bold flex-shrink-0">
          <Building className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block sm:block">
            Bien sélectionné
          </span>
          <div className="relative">
            <select
              id="select-active-property"
              value={activeProperty?.id || ''}
              onChange={(e) => {
                const found = properties.find(p => p.id === e.target.value);
                if (found) onSelectProperty(found);
              }}
              className="text-xs sm:text-sm font-black text-[#00434A] bg-transparent border-none cursor-pointer focus:outline-none w-full truncate pr-4"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.tenantName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        id="btn-add-property-tunnel"
        onClick={onOpenOnboarding}
        className="hidden sm:flex px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-[#00434A] text-xs font-semibold text-[#00434A] hover:bg-[#00434A]/5 transition items-center space-x-1.5 cursor-pointer flex-shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Ajouter un bien</span>
      </button>
    </div>
  );
};

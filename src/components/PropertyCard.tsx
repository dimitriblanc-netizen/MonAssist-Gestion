import React from 'react';
import { Property, RentRecord } from '../types';
import { 
  Home, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  currentRent?: RentRecord;
  onGenerateReceipt: (prop: Property, rent: RentRecord) => void;
  onOpenIrlCalc: (prop: Property) => void;
  onOpenReminder: (prop: Property, rent: RentRecord) => void;
  onSelectProperty: (prop: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currentRent,
  onGenerateReceipt,
  onOpenIrlCalc,
  onOpenReminder,
  onSelectProperty
}) => {
  const totalRent = property.rentExcl + property.charges;
  
  // Insurance check
  const insuranceDate = new Date(property.insuranceValidUntil);
  const now = new Date();
  const isInsuranceExpired = insuranceDate < now;
  const isInsuranceExpiringSoon = !isInsuranceExpired && (insuranceDate.getTime() - now.getTime()) / (1000 * 3600 * 24) < 45;

  return (
    <div 
      id={`property-card-${property.id}`}
      className="bg-white rounded-xl border border-slate-200 hover:border-teal-500/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* Top Banner */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 mt-0.5">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-lg">{property.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  property.type === 'meuble' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {property.type === 'meuble' ? 'Meublé' : 'Nu / Vide'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {property.address}, {property.postalCode} {property.city} {property.floor ? `• ${property.floor}` : ''}
              </p>
              <div className="flex items-center space-x-3 text-xs text-slate-600 mt-2">
                <span className="font-semibold text-slate-800">{property.surface} m²</span>
                <span>•</span>
                <span>{property.rooms} pièce{property.rooms > 1 ? 's' : ''}</span>
                <span>•</span>
                <span>Bail démarré le {new Date(property.leaseStartDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Monthly rent breakdown */}
          <div className="text-right">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalRent.toLocaleString('fr-FR')} €
              <span className="text-xs font-normal text-slate-500 block">/ mois CC</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ({property.rentExcl} € nu + {property.charges} € ch.)
            </p>
          </div>
        </div>
      </div>

      {/* Body: Locataire en place & Statut du loyer */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* Tenant Information Box */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-teal-600 inline mr-1" />
              Locataire en place
            </span>
            {property.guarantor && (
              <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                Garant : {property.guarantor}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900 text-sm">{property.tenantName}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                {property.tenantPhone && (
                  <a href={`tel:${property.tenantPhone}`} className="flex items-center hover:text-teal-600">
                    <Phone className="w-3 h-3 mr-1 text-slate-400" />
                    {property.tenantPhone}
                  </a>
                )}
                {property.tenantEmail && (
                  <a href={`mailto:${property.tenantEmail}`} className="flex items-center hover:text-teal-600">
                    <Mail className="w-3 h-3 mr-1 text-slate-400" />
                    {property.tenantEmail}
                  </a>
                )}
              </div>
            </div>

            {/* Current month status */}
            <div className="sm:text-right">
              {currentRent ? (
                <div>
                  <div className="flex items-center sm:justify-end space-x-1.5">
                    {currentRent.status === 'PAID' && (
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Loyer de {currentRent.month} Réglé
                      </span>
                    )}
                    {currentRent.status === 'PENDING' && (
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        Loyer {currentRent.month} en attente
                      </span>
                    )}
                    {currentRent.status === 'LATE' && (
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                        Retard {currentRent.month}
                      </span>
                    )}
                  </div>
                  {currentRent.paidDate && (
                    <p className="text-[11px] text-slate-500 mt-0.5">Payé le {currentRent.paidDate}</p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400">Aucun appel généré</span>
              )}
            </div>
          </div>
        </div>

        {/* Legal & Obligation Reminders Alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Insurance status */}
          <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
            isInsuranceExpired
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isInsuranceExpiringSoon
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <ShieldCheck className={`w-4 h-4 flex-shrink-0 ${
              isInsuranceExpired ? 'text-rose-600' : isInsuranceExpiringSoon ? 'text-amber-600' : 'text-emerald-600'
            }`} />
            <div className="truncate">
              <span className="font-medium block truncate">Assurance habitation</span>
              <span className="text-[11px]">
                {isInsuranceExpired 
                  ? 'Expirée ! Relancer' 
                  : `Valide jusqu'au ${insuranceDate.toLocaleDateString('fr-FR')}`}
              </span>
            </div>
          </div>

          {/* Boiler / Maintenance or IRL */}
          <div className="p-2.5 rounded-lg border bg-slate-50 border-slate-200 text-slate-700 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <div className="truncate">
              <span className="font-medium block truncate">Indice IRL : {property.irlQuarter}</span>
              <span className="text-[11px] text-slate-500">Base {property.irlIndex} • Révision annuelle</span>
            </div>
          </div>
        </div>

        {property.notes && (
          <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
            💡 {property.notes}
          </p>
        )}

      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button
          id={`btn-calc-irl-${property.id}`}
          onClick={() => onOpenIrlCalc(property)}
          className="text-xs font-medium text-slate-700 hover:text-teal-700 flex items-center space-x-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          <span>Révision IRL</span>
        </button>

        <div className="flex items-center space-x-2">
          {currentRent?.status === 'LATE' && (
            <button
              id={`btn-relance-${property.id}`}
              onClick={() => onOpenReminder(property, currentRent)}
              className="text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition flex items-center space-x-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              <span>Relance loyer</span>
            </button>
          )}

          {currentRent && (
            <button
              id={`btn-quittance-${property.id}`}
              onClick={() => onGenerateReceipt(property, currentRent)}
              className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quittance PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

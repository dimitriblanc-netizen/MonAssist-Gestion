import React, { useState } from 'react';
import { Property, RentRecord } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileDown, 
  Send, 
  Calendar, 
  Filter, 
  PlusCircle,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { generateQuittancePDF } from '../utils/generateReceipt';

interface RentManagerProps {
  properties: Property[];
  rents: RentRecord[];
  onUpdateRentStatus: (rentId: string, status: 'PAID' | 'PENDING' | 'LATE') => void;
  onOpenReminder: (prop: Property, rent: RentRecord) => void;
  onAddNewMonthRent: (monthName: string, year: number) => void;
}

export const RentManager: React.FC<RentManagerProps> = ({
  properties,
  rents,
  onUpdateRentStatus,
  onOpenReminder,
  onAddNewMonthRent
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtered rents
  const filteredRents = rents.filter(r => {
    if (selectedPropertyId !== 'ALL' && r.propertyId !== selectedPropertyId) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  const getProperty = (id: string) => properties.find(p => p.id === id);

  // Quick stats
  const totalDue = filteredRents.reduce((acc, r) => acc + r.total, 0);
  const totalPaid = filteredRents.filter(r => r.status === 'PAID').reduce((acc, r) => acc + r.total, 0);
  const totalLate = filteredRents.filter(r => r.status === 'LATE').reduce((acc, r) => acc + r.total, 0);
  const recoveryRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Summary KPI header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total loyers appelés</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {totalDue.toLocaleString('fr-FR')} €
          </span>
          <span className="text-xs text-slate-400">Périmètre sélectionné</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Loyers encaissés
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {totalPaid.toLocaleString('fr-FR')} €
          </span>
          <span className="text-xs text-emerald-700 font-medium">Taux de recouvrement : {recoveryRate}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Loyers en retard
          </span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {totalLate.toLocaleString('fr-FR')} €
          </span>
          <span className="text-xs text-rose-700">Relance amiable recommandée</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl text-white flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
              Génération Mensuelle
            </span>
            <span className="text-sm text-slate-300 mt-0.5 block">
              Créer les appels du mois prochain
            </span>
          </div>
          <button
            id="btn-rollover-next-month"
            onClick={() => onAddNewMonthRent('Avril', 2025)}
            className="mt-3 w-full py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Appels d'Avril 2025</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Filtrer par bien :</span>
            <select
              id="select-filter-property"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Tous les biens ({properties.length})</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Statut :</span>
            <select
              id="select-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PAID">Payé (Encaissé)</option>
              <option value="PENDING">En attente</option>
              <option value="LATE">En retard</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {filteredRents.length} appel{filteredRents.length > 1 ? 's' : ''} de loyer affiché{filteredRents.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Rents List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Bien & Locataire</th>
                <th className="py-3.5 px-4">Période</th>
                <th className="py-3.5 px-4">Loyer Nu</th>
                <th className="py-3.5 px-4">Charges</th>
                <th className="py-3.5 px-4">Total Dû</th>
                <th className="py-3.5 px-4">Statut Paiement</th>
                <th className="py-3.5 px-4 text-right">Actions Quittance & Relance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRents.map((rent) => {
                const prop = getProperty(rent.propertyId);
                if (!prop) return null;

                return (
                  <tr key={rent.id} className="hover:bg-slate-50/60 transition">
                    {/* Bien & Locataire */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{prop.name}</div>
                      <div className="text-xs text-slate-500">{prop.tenantName}</div>
                      <div className="text-[11px] text-slate-400">{prop.city}</div>
                    </td>

                    {/* Period */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{rent.month} {rent.year}</div>
                      <div className="text-[11px] text-slate-400">{rent.period}</div>
                    </td>

                    {/* Loyer Nu */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {rent.rentAmount.toLocaleString('fr-FR')} €
                    </td>

                    {/* Charges */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {rent.chargesAmount.toLocaleString('fr-FR')} €
                    </td>

                    {/* Total Dû */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {rent.total.toLocaleString('fr-FR')} €
                      </div>
                    </td>

                    {/* Statut Paiement (Selectable dropdown) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1">
                        <select
                          id={`rent-status-select-${rent.id}`}
                          value={rent.status}
                          onChange={(e) => onUpdateRentStatus(rent.id, e.target.value as any)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            rent.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : rent.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="PAID">✓ Encaissé / Payé</option>
                          <option value="PENDING">⏳ En attente virement</option>
                          <option value="LATE">⚠️ En retard</option>
                        </select>
                        {rent.paidDate && (
                          <span className="text-[11px] text-slate-400">
                            Reçu le {rent.paidDate}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {rent.status === 'LATE' && (
                          <button
                            id={`btn-relance-rent-${rent.id}`}
                            onClick={() => onOpenReminder(prop, rent)}
                            title="Générer un message de relance amiable"
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Relancer</span>
                          </button>
                        )}

                        <button
                          id={`btn-download-quittance-${rent.id}`}
                          onClick={() => generateQuittancePDF(prop, rent)}
                          title="Télécharger la quittance de loyer officielle en PDF"
                          className="px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition flex items-center space-x-1 cursor-pointer"
                        >
                          <FileDown className="w-3.5 h-3.5 text-teal-600" />
                          <span>Quittance PDF</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Property, RentRecord } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileDown, 
  Send, 
  FileText, 
  ShieldAlert, 
  Calendar, 
  Euro,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { generateQuittancePDF } from '../utils/generateReceipt';
import { generateLrarMiseEnDemeure } from '../utils/generateLrarPdf';

interface RentSectionProps {
  property: Property;
  rents: RentRecord[];
  onValidateRent: (rentId: string) => void;
  onSetLateStatus: (rentId: string, status: 'LATE_J10' | 'LATE_J20' | 'LATE_J35') => void;
  onOpenReminderModal: (property: Property, rent: RentRecord) => void;
  onGenerateNextMonth: (month: string, year: number) => void;
}

export const RentSection: React.FC<RentSectionProps> = ({
  property,
  rents,
  onValidateRent,
  onSetLateStatus,
  onOpenReminderModal,
  onGenerateNextMonth
}) => {
  const propertyRents = rents.filter(r => r.propertyId === property.id);
  const currentRent = propertyRents[0]; // most recent

  // Stats
  const totalReceived = propertyRents
    .filter(r => r.status === 'PAID')
    .reduce((acc, r) => acc + r.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Procédure Militaire Impayé GLI/Visale guide */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00434A]/10 text-[#00434A]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Protocole de recouvrement & Procédure militaire (Visale / GLI)
              </h3>
              <p className="text-xs text-slate-500">
                Respectez scrupuleusement ces étapes pour éviter la déchéance de garantie de votre assureur.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Garantie active : {property.gliProvider || 'Visale'}
          </span>
        </div>

        {/* Timeline Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Step 1: Le 5 */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
            <span className="font-bold text-[#00434A] block">1. Le 5 du mois</span>
            <p className="font-medium text-slate-800">Échéance normale</p>
            <p className="text-[11px] text-slate-500">
              Vérification bancaire. Si reçu : validation 1-clic et quittance immédiate.
            </p>
          </div>

          {/* Step 2: J+10 */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-xs space-y-1">
            <span className="font-bold text-amber-800 block">2. J+10 (Le 15)</span>
            <p className="font-medium text-slate-800">Relance amiable</p>
            <p className="text-[11px] text-slate-600">
              Envoi d'un SMS ou email de rappel courtois pour acter la démarche.
            </p>
          </div>

          {/* Step 3: J+20 */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-xs space-y-1">
            <span className="font-bold text-rose-800 block">3. J+20 (Le 25)</span>
            <p className="font-medium text-slate-800">Mise en demeure LRAR</p>
            <p className="text-[11px] text-slate-600">
              Notification recommandée avec AR sous huitaine. Déclenche la clause résolutoire.
            </p>
          </div>

          {/* Step 4: J+35 */}
          <div className="p-3 rounded-xl border border-red-300 bg-red-100/50 text-xs space-y-1">
            <span className="font-bold text-red-900 block">4. J+35 (Le 10 suivant)</span>
            <p className="font-medium text-slate-800">Déclaration Sinistre</p>
            <p className="text-[11px] text-slate-700">
              Alerte critique : transmission du dossier à Visale / GLI pour indemnisation.
            </p>
          </div>
        </div>
      </div>

      {/* Pointing en 1-clic Card */}
      {currentRent && (
        <div className="bg-[#FBF7EE] rounded-2xl p-6 border-2 border-[#00434A]/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#00434A]">
                Échéance en cours
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{currentRent.month} {currentRent.year}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              Loyer de {property.tenantName} : {currentRent.total.toFixed(2)} €
            </h4>
            <p className="text-xs text-slate-600">
              ({currentRent.rentAmount} € nu + {currentRent.chargesAmount} € charges) • {currentRent.period}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {currentRent.status === 'PAID' ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Encaissé le {currentRent.paidDate}
                </span>

                <button
                  id="btn-download-receipt"
                  onClick={() => generateQuittancePDF(property, currentRent)}
                  className="px-3.5 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Télécharger la quittance</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-confirm-payment-one-click"
                  onClick={() => onValidateRent(currentRent.id)}
                  className="px-4 py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valider l'encaissement (1-clic)</span>
                </button>

                <button
                  id="btn-trigger-late-j10"
                  onClick={() => {
                    onSetLateStatus(currentRent.id, 'LATE_J10');
                    onOpenReminderModal(property, currentRent);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>J+10 Relance amiable</span>
                </button>

                <button
                  id="btn-trigger-late-j20"
                  onClick={() => {
                    onSetLateStatus(currentRent.id, 'LATE_J20');
                    generateLrarMiseEnDemeure(property, currentRent);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>J+20 LRAR</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rents History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Registre des loyers & Historique des quittances</h4>
            <p className="text-xs text-slate-400">Total encaissé : {totalReceived.toLocaleString('fr-FR')} €</p>
          </div>

          <button
            onClick={() => onGenerateNextMonth('Avril', 2025)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-[#00434A] text-xs font-semibold text-[#00434A] transition flex items-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Créer appel Avril 2025</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Loyer HC</th>
                <th className="py-3 px-4">Provisions / Forfait</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyRents.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {r.month} {r.year}
                    <span className="text-[10px] text-slate-400 block font-normal">{r.period}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{r.rentAmount.toFixed(2)} €</td>
                  <td className="py-3 px-4 text-slate-700">{r.chargesAmount.toFixed(2)} €</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.total.toFixed(2)} €</td>
                  <td className="py-3 px-4">
                    {r.status === 'PAID' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Payé le {r.paidDate || 'Terme'}
                      </span>
                    ) : r.status === 'PENDING' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        En attente virement
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 animate-pulse">
                        {r.status === 'LATE_J10' ? 'Impayé J+10' : r.status === 'LATE_J20' ? 'Impayé J+20 (LRAR)' : 'Impayé J+35 (Sinistre)'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {r.status !== 'PAID' && (
                        <button
                          onClick={() => onValidateRent(r.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                        >
                          Valider
                        </button>
                      )}
                      <button
                        onClick={() => generateQuittancePDF(property, r)}
                        className="px-2.5 py-1 rounded-lg bg-[#00434A]/10 hover:bg-[#00434A]/20 text-[#00434A] font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Quittance</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

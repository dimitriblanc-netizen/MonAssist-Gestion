import React, { useState } from 'react';
import { Property, RentRecord, ExpenseRecord, ExpenseCategory } from '../types';
import { 
  Euro, 
  Plus, 
  FileDown, 
  Trash2, 
  Receipt, 
  Shield, 
  Wrench, 
  Building, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { generateTaxReportPdf } from '../utils/generateTaxReportPdf';
import { compressImage } from '../utils/imageCompress';

interface FinanceSectionProps {
  property: Property;
  rents: RentRecord[];
  expenses: ExpenseRecord[];
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const FinanceSection: React.FC<FinanceSectionProps> = ({
  property,
  rents,
  expenses,
  onAddExpense,
  onDeleteExpense
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form state with smart prefilling
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<ExpenseCategory>('COPRO_DEDUCTIBLE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState<boolean>(false);

  // Filtered by property and year
  const propertyExpenses = expenses.filter(
    e => e.propertyId === property.id && new Date(e.date).getFullYear() === selectedYear
  );

  const paidRents = rents.filter(
    r => r.propertyId === property.id && r.year === selectedYear && r.status === 'PAID'
  );

  const totalIncome = paidRents.reduce((acc, r) => acc + r.total, 0);
  const totalDeductible = propertyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netResult = totalIncome - totalDeductible;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const compressed = await compressImage(file);
      setProofUrl(compressed);
    } catch (err) {
      console.error('Erreur compression image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || amount <= 0) return;

    const newExp: ExpenseRecord = {
      id: `exp_${Date.now()}`,
      propertyId: property.id,
      date,
      label: label.trim(),
      amount: Number(amount),
      category,
      notes: notes.trim() || undefined,
      proofUrl
    };

    onAddExpense(newExp);
    setLabel('');
    setNotes('');
    setProofUrl(undefined);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Financial KPI Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-base">
            Bilan Financier & Déclarations Fiscales ({selectedYear})
          </h3>
          <p className="text-xs text-slate-500">
            {property.leaseType === 'vide' ? 'Revenus Fonciers (2044 / Micro)' : 'LMNP (Micro-BIC ou Réel)'} • 100% Déclaratif
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
          >
            <option value={2025}>Année fiscale 2025</option>
            <option value={2024}>Année fiscale 2024</option>
          </select>

          <button
            id="btn-export-tax-pdf"
            onClick={() => generateTaxReportPdf(property, rents, expenses, selectedYear)}
            className="px-4 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Télécharger Bilan PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FBF7EE] p-5 rounded-2xl border border-[#00434A]/20 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00434A]">
            Loyers bruts encaissés
          </span>
          <div className="text-2xl font-extrabold text-[#00434A]">
            {totalIncome.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-500 block">
            {paidRents.length} quittances validées
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Dépenses déductibles saisies
          </span>
          <div className="text-2xl font-extrabold text-slate-800">
            {totalDeductible.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-500 block">
            Copropriété, travaux, honoraires Dryos...
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Résultat net imposable
          </span>
          <div className={`text-2xl font-extrabold ${netResult < 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            {netResult.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-500 block">
            {netResult < 0 ? 'Déficit foncier reportable' : 'Base avant abattement'}
          </span>
        </div>
      </div>

      {/* Add Expense Button & Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Registre des dépenses déductibles</h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une dépense</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmitExpense} className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Libellé de la dépense *</label>
                <input
                  type="text"
                  placeholder="Ex: Facture plomberie robinet, Appel charges T1..."
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant TTC (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="150.00"
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie fiscale légale</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="HONORAIRES_DRYOS">Honoraires de mise en location DRYOS</option>
                  <option value="COPRO_DEDUCTIBLE">Charges de copropriété déductibles</option>
                  <option value="ASSURANCE_PNO_GLI">Primes assurance PNO & GLI</option>
                  <option value="TRAVAUX_ENTRETIEN">Travaux d'entretien & réparation</option>
                  <option value="TAXE_FONCIERE_HORS_TEOM">Taxe foncière (hors TEOM)</option>
                  <option value="INTERETS_EMPRUNT">Intérêts d'emprunt</option>
                  <option value="AUTRE_DEDUCTIBLE">Autre charge déductible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facture / Justificatif (Compressé auto en WebP)
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 cursor-pointer"
                />
                {uploading && <span className="text-[11px] text-[#00434A]">Compression locale en cours...</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes internes</label>
                <input
                  type="text"
                  placeholder="Référence facture, artisan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold cursor-pointer"
              >
                Enregistrer la dépense
              </button>
            </div>
          </form>
        )}

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4">Catégorie fiscale</th>
                <th className="py-3 px-4">Montant TTC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {propertyExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Aucune dépense enregistrée pour {selectedYear}. Cliquez sur "Ajouter une dépense" pour saisir vos charges copro, assurances ou honoraires Dryos.
                  </td>
                </tr>
              ) : (
                propertyExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {new Date(e.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {e.label}
                      {e.notes && <span className="text-[10px] text-slate-400 block font-normal">{e.notes}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700">
                        {e.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{e.amount.toFixed(2)} €</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteExpense(e.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

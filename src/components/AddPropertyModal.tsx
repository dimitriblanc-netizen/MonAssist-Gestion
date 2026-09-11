import React, { useState } from 'react';
import { Property, PropertyType } from '../types';
import { X, Building2, User, Key, Check } from 'lucide-react';

interface AddPropertyModalProps {
  onClose: () => void;
  onAddProperty: (property: Property) => void;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  onClose,
  onAddProperty
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Paris');
  const [postalCode, setPostalCode] = useState('75010');
  const [floor, setFloor] = useState('3ème étage');
  const [surface, setSurface] = useState<number>(35);
  const [rooms, setRooms] = useState<number>(2);
  const [type, setType] = useState<PropertyType>('meuble');
  const [rentExcl, setRentExcl] = useState<number>(1100);
  const [charges, setCharges] = useState<number>(90);
  const [deposit, setDeposit] = useState<number>(2200);
  const [leaseStartDate, setLeaseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [guarantor, setGuarantor] = useState('Garant physique / Visale');
  const [insuranceValidUntil, setInsuranceValidUntil] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !tenantName.trim()) return;

    const newProperty: Property = {
      id: `prop_${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      floor: floor.trim(),
      surface: Number(surface),
      rooms: Number(rooms),
      leaseType: type,
      type,
      isTenseZone: true,
      leaseDurationYears: type === 'vide' ? 3 : 1,
      chargesMode: 'provisions',
      rentExcl: Number(rentExcl),
      charges: Number(charges),
      deposit: Number(deposit),
      leaseStartDate,
      tenantName: tenantName.trim(),
      tenantEmail: tenantEmail.trim(),
      tenantPhone: tenantPhone.trim(),
      guarantor: guarantor.trim(),
      tenantInsuranceExpiry: insuranceValidUntil,
      insuranceValidUntil,
      pnoExpiryDate: insuranceValidUntil,
      hasGli: true,
      hasGasHeating: false,
      hasChimney: false,
      dpeRating: 'D',
      irlBaseQuarter: 'T3 2024',
      irlBaseValue: 144.51,
      irlQuarter: 'T3 2024',
      irlIndex: 144.51,
      createdAt: new Date().toISOString()
    };

    onAddProperty(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="add-property-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Ajouter un bien en location</h3>
              <p className="text-xs text-slate-500">
                Enregistrez le logement et le locataire mis en place par Dryos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Le Logement */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Key className="w-4 h-4 text-teal-600" />
              <span>1. Caractéristiques du Logement</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du bien / Référence *</label>
                <input
                  type="text"
                  placeholder="Ex: T2 Canal Saint-Martin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type de location *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PropertyType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="meuble">Location Meublée (Bail 1 an ou mobilité)</option>
                  <option value="vide">Location Nue / Vide (Bail 3 ans)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse postale *</label>
                <input
                  type="text"
                  placeholder="Ex: 58 Rue de la Grange aux Belles"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code Postal *</label>
                <input
                  type="text"
                  placeholder="75010"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ville *</label>
                <input
                  type="text"
                  placeholder="Paris"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Surface habitable (m²)</label>
                <input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de pièces</label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Données Financières */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <span>2. Loyer & Charges (€)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loyer hors charges (€) *</label>
                <input
                  type="number"
                  value={rentExcl}
                  onChange={(e) => setRentExcl(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Charges locatives (€) *</label>
                <input
                  type="number"
                  value={charges}
                  onChange={(e) => setCharges(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dépôt de garantie (€)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Locataire en place */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>3. Locataire & Bail en place</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom et Prénom du locataire *</label>
                <input
                  type="text"
                  placeholder="Ex: Julie Morel"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date d'effet du bail *</label>
                <input
                  type="date"
                  value={leaseStartDate}
                  onChange={(e) => setLeaseStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email du locataire</label>
                <input
                  type="email"
                  placeholder="julie.morel@email.com"
                  value={tenantEmail}
                  onChange={(e) => setTenantEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone mobile</label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Garant / Caution solidaire</label>
                <input
                  type="text"
                  placeholder="Ex: Visale ou Parents"
                  value={guarantor}
                  onChange={(e) => setGuarantor(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Échéance attestation assurance</label>
                <input
                  type="date"
                  value={insuranceValidUntil}
                  onChange={(e) => setInsuranceValidUntil(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer le bien dans Firebase</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

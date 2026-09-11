import React, { useState } from 'react';
import { Property, LeaseType, ChargesMode, DpeRating } from '../types';
import { 
  Building2, 
  MapPin, 
  FileCheck, 
  Euro, 
  Calendar, 
  Shield, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface OnboardingTunnelProps {
  onClose: () => void;
  onComplete: (property: Property) => void;
}

export const OnboardingTunnel: React.FC<OnboardingTunnelProps> = ({
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Step 1: Adresse & Identité
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('75011');
  const [city, setCity] = useState('Paris');
  const [surface, setSurface] = useState<number>(45);
  const [rooms, setRooms] = useState<number>(2);

  // Step 2: Type de bail
  const [leaseType, setLeaseType] = useState<LeaseType>('meuble');
  // Déductions automatiques :
  // Meublé = 1 an, préavis locataire 1 mois
  // Vide = 3 ans, préavis locataire 3 mois (ou 1 mois si zone tendue)

  // Step 3: Finances
  const [rentExcl, setRentExcl] = useState<number>(1200);
  const [charges, setCharges] = useState<number>(100);
  const [chargesMode, setChargesMode] = useState<ChargesMode>('provisions');
  const [deposit, setDeposit] = useState<number>(2400);

  // Step 4: Dates clés & IRL
  const [leaseStartDate, setLeaseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [irlQuarter, setIrlQuarter] = useState('T3 2024');
  const [irlIndex, setIrlIndex] = useState<number>(144.51);

  // Step 5: Conformité & Technique
  const [dpeRating, setDpeRating] = useState<DpeRating>('D');
  const [pnoExpiryDate, setPnoExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [hasGli, setHasGli] = useState<boolean>(true);
  const [gliProvider, setGliProvider] = useState<string>('Visale');
  const [hasGasHeating, setHasGasHeating] = useState<boolean>(false);
  const [hasChimney, setHasChimney] = useState<boolean>(false);

  // Step 6: Répertoire Locataire
  const [tenantName, setTenantName] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantInsuranceExpiry, setTenantInsuranceExpiry] = useState(
    new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [guarantor, setGuarantor] = useState('Garantie Visale (Action Logement)');

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !tenantName.trim()) return;

    const newProp: Property = {
      id: `prop_${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      city: city.trim(),
      isTenseZone: true, // Paris & Petite Couronne
      surface: Number(surface),
      rooms: Number(rooms),
      leaseType,
      leaseStartDate,
      leaseDurationYears: leaseType === 'vide' ? 3 : 1,
      chargesMode,
      rentExcl: Number(rentExcl),
      charges: Number(charges),
      deposit: Number(deposit),
      irlBaseQuarter: irlQuarter,
      irlBaseValue: Number(irlIndex),
      dpeRating,
      pnoExpiryDate,
      hasGli,
      gliProvider: hasGli ? gliProvider : undefined,
      hasGasHeating,
      hasChimney,
      tenantName: tenantName.trim(),
      tenantEmail: tenantEmail.trim(),
      tenantPhone: tenantPhone.trim(),
      tenantInsuranceExpiry,
      guarantor: guarantor.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onComplete(newProp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00434A]/80 backdrop-blur-xs">
      <div 
        id="onboarding-tunnel-card"
        className="bg-[#FBF7EE] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-300 flex flex-col"
      >
        {/* Progress header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white/70 backdrop-blur-xs flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <AppLogo className="w-10 h-10 flex-shrink-0" />
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-[#00434A] font-bold">
                Étape {step} sur {totalSteps} • Configuration du bien
              </span>
              <div className="w-36 sm:w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00434A] transition-all duration-300 rounded-full"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 sm:p-8 flex-1">
          {/* Étape 1 : Adresse & Identité */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Où se situe le bien loué ?
                </h3>
                <p className="text-xs text-slate-600">
                  Identifiez le logement mis en location par Dryos à Paris ou Petite Couronne.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom usuel du bien *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2 Pièces Voltaire"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#00434A] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adresse postale *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 42 Rue Léon Frot"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#00434A] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Code Postal *</label>
                    <input
                      type="text"
                      placeholder="75011"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#00434A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      placeholder="Paris"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#00434A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Surface (m²)</label>
                    <input
                      type="number"
                      value={surface}
                      onChange={(e) => setSurface(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pièces</label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Type de bail */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Quel est le type de bail signé ?
                </h3>
                <p className="text-xs text-slate-600">
                  L'application déduit automatiquement les durées légales et les fenêtres de congé.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setLeaseType('meuble')}
                  className={`p-5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    leaseType === 'meuble'
                      ? 'border-[#00434A] bg-white shadow-md'
                      : 'border-slate-300 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#00434A] uppercase tracking-wider block">Option 1</span>
                    <h4 className="text-lg font-bold text-slate-900">Location Meublée</h4>
                    <p className="text-xs text-slate-500">
                      Bail de 1 an renouvelable (ou 9 mois étudiant). Dépôt max : 2 mois de loyer HC.
                    </p>
                  </div>
                  <div className="text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                    ✓ Préavis locataire : 1 mois<br />
                    ✓ Préavis bailleur : 3 mois
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLeaseType('vide')}
                  className={`p-5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    leaseType === 'vide'
                      ? 'border-[#00434A] bg-white shadow-md'
                      : 'border-slate-300 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#00434A] uppercase tracking-wider block">Option 2</span>
                    <h4 className="text-lg font-bold text-slate-900">Location Nue / Vide</h4>
                    <p className="text-xs text-slate-500">
                      Bail classique de 3 ans. Dépôt max : 1 mois de loyer HC.
                    </p>
                  </div>
                  <div className="text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                    ✓ Préavis locataire : 1 mois (zone tendue)<br />
                    ✓ Préavis bailleur : 6 mois
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Finances & Charges */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Conditions financières du bail
                </h3>
                <p className="text-xs text-slate-600">
                  Ces montants seront repris pour chaque quittance et pour la déclaration fiscale.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Loyer nu hors charges (€) *
                    </label>
                    <input
                      type="number"
                      value={rentExcl}
                      onChange={(e) => setRentExcl(parseFloat(e.target.value) || 0)}
                      className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Charges (€/mois) *
                    </label>
                    <input
                      type="number"
                      value={charges}
                      onChange={(e) => setCharges(parseFloat(e.target.value) || 0)}
                      className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Régime des charges locatives
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChargesMode('provisions')}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                        chargesMode === 'provisions' ? 'bg-[#00434A] text-white border-[#00434A]' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Provisions (avec régularisation annuelle)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChargesMode('forfait')}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold cursor-pointer ${
                        chargesMode === 'forfait' ? 'bg-[#00434A] text-white border-[#00434A]' : 'bg-white border-slate-300 text-slate-700'
                      }`}
                    >
                      Forfait fixe (sans régularisation)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dépôt de garantie versé à l'entrée (€)
                  </label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Conservé par vous (rappel : l'app ne touche jamais aux fonds, 100% déclaratif).
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4 : Dates clés & Indice IRL */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Dates clés & Indice de Référence (IRL)
                </h3>
                <p className="text-xs text-slate-600">
                  L'application calculera automatiquement la date anniversaire pour la révision de loyer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de prise d'effet du bail *
                  </label>
                  <input
                    type="date"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Trimestre IRL de référence (Bail)
                    </label>
                    <input
                      type="text"
                      value={irlQuarter}
                      onChange={(e) => setIrlQuarter(e.target.value)}
                      placeholder="Ex: T3 2024"
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valeur de l'indice
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={irlIndex}
                      onChange={(e) => setIrlIndex(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 5 : Conformité, DPE & Garanties */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Conformité & Protections
                </h3>
                <p className="text-xs text-slate-600">
                  Gestion des obligations légales (Loi Climat, PNO, GLI, chaudière).
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Classe DPE (Diagnostic de Performance Énergétique)
                  </label>
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold">
                    {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as DpeRating[]).map(letter => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setDpeRating(letter)}
                        className={`py-2 rounded-lg border transition cursor-pointer ${
                          dpeRating === letter
                            ? 'bg-[#00434A] text-white border-[#00434A] ring-2 ring-[#00434A]/30'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                  {(dpeRating === 'F' || dpeRating === 'G') && (
                    <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                      <span>⚠️ <strong>Passoire thermique (Loi Climat) :</strong> La révision IRL sera automatiquement bloquée par l'application.</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assurance PNO Propriétaire (Échéance)
                    </label>
                    <input
                      type="date"
                      value={pnoExpiryDate}
                      onChange={(e) => setPnoExpiryDate(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Garantie Loyers Impayés (GLI)
                    </label>
                    <select
                      value={gliProvider}
                      onChange={(e) => setGliProvider(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Visale">Garantie Visale (Action Logement)</option>
                      <option value="Galian">Assurance GLI (Galian / Autre)</option>
                      <option value="Garant Physique">Garant physique caution solidaire</option>
                      <option value="Aucune">Aucune garantie souscrite</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGasHeating}
                      onChange={(e) => setHasGasHeating(e.target.checked)}
                      className="rounded text-[#00434A] h-4 w-4"
                    />
                    <span>Chaudière gaz/fioul individuelle (Entretien annuel obligatoire)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasChimney}
                      onChange={(e) => setHasChimney(e.target.checked)}
                      className="rounded text-[#00434A] h-4 w-4"
                    />
                    <span>Cheminée fonctionnelle (Ramonage annuel obligatoire)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Étape 6 : Répertoire Locataire */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-[#00434A]">
                  Qui est votre locataire en place ?
                </h3>
                <p className="text-xs text-slate-600">
                  Coordonnées stockées pour l'envoi des quittances et relances amiables.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom et Prénom du locataire *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Camille Rochefort"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="camille@email.com"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone mobile</label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Échéance de l'assurance habitation locataire (MRH) *
                  </label>
                  <input
                    type="date"
                    value={tenantInsuranceExpiry}
                    onChange={(e) => setTenantInsuranceExpiry(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Un rappel vous sera envoyé 30 jours avant la date d'échéance pour réclamer la nouvelle attestation.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-200 bg-white/70 backdrop-blur-xs flex items-center justify-between rounded-b-3xl">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Valider & Enregistrer le bien</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

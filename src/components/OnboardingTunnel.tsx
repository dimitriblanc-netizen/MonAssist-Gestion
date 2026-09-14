import React, { useState, useEffect } from 'react';
import { Property, LeaseType, DpeRating, TenantInfo } from '../types';
import { 
  Building2, 
  User, 
  Users, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Info,
  TrendingUp,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface OnboardingTunnelProps {
  onClose: () => void;
  onComplete: (property: Property) => void;
  initialProperty?: Property | null;
}

export const OnboardingTunnel: React.FC<OnboardingTunnelProps> = ({
  onClose,
  onComplete,
  initialProperty
}) => {
  const isEditing = !!initialProperty;

  // 1. Essentiels du bien
  const [name, setName] = useState(initialProperty?.name || '');
  const [leaseType, setLeaseType] = useState<LeaseType>(initialProperty?.leaseType || 'meuble');
  const [rentExcl, setRentExcl] = useState<number | ''>(
    initialProperty ? initialProperty.rentExcl : 850
  );
  const [charges, setCharges] = useState<number | ''>(
    initialProperty ? initialProperty.charges : 70
  );

  // 2. Caution / Dépôt de garantie intelligent (Loi ALUR)
  // Meublé = 2x loyer HC | Vide = 1x loyer HC
  const calculateDefaultDeposit = (type: LeaseType, rent: number | '') => {
    const numericRent = typeof rent === 'number' ? rent : 0;
    return type === 'meuble' ? numericRent * 2 : numericRent;
  };

  const [deposit, setDeposit] = useState<number | ''>(() => {
    if (initialProperty && initialProperty.deposit !== undefined) {
      return initialProperty.deposit;
    }
    return 1700; // 850 * 2
  });
  const [isDepositManuallySet, setIsDepositManuallySet] = useState(!!initialProperty?.deposit);

  // Mettre à jour automatiquement la caution si le type de bail ou le loyer change (sauf si modifié manuellement)
  const handleLeaseTypeChange = (newType: LeaseType) => {
    setLeaseType(newType);
    if (!isDepositManuallySet) {
      setDeposit(calculateDefaultDeposit(newType, rentExcl));
    }
  };

  const handleRentChange = (newRent: number | '') => {
    setRentExcl(newRent);
    if (!isDepositManuallySet) {
      setDeposit(calculateDefaultDeposit(leaseType, newRent));
    }
  };

  // 3. Locataire & Colocation
  const [isColocation, setIsColocation] = useState<boolean>(
    initialProperty?.isColocation || (initialProperty?.tenants && initialProperty.tenants.length > 1) || false
  );
  const [tenantName, setTenantName] = useState(initialProperty?.tenantName || '');
  const [tenantEmail, setTenantEmail] = useState(initialProperty?.tenantEmail || '');
  const [tenantPhone, setTenantPhone] = useState(initialProperty?.tenantPhone || '');

  // Liste des colocataires
  const [colocataires, setColocataires] = useState<TenantInfo[]>(() => {
    if (initialProperty?.tenants && initialProperty.tenants.length > 0) {
      return initialProperty.tenants;
    }
    return [
      { id: '1', name: '', sharePercent: 50, email: '', phone: '' },
      { id: '2', name: '', sharePercent: 50, email: '', phone: '' }
    ];
  });

  const handleAddColoc = () => {
    const nextId = String(Date.now());
    const count = colocataires.length + 1;
    const defaultShare = Math.round(100 / count);
    setColocataires(prev => [
      ...prev.map(c => ({ ...c, sharePercent: defaultShare })),
      { id: nextId, name: '', sharePercent: defaultShare, email: '', phone: '' }
    ]);
  };

  const handleRemoveColoc = (id: string) => {
    if (colocataires.length <= 1) return;
    const updated = colocataires.filter(c => c.id !== id);
    const defaultShare = Math.round(100 / updated.length);
    setColocataires(updated.map(c => ({ ...c, sharePercent: defaultShare })));
  };

  const handleUpdateColoc = (id: string, field: keyof TenantInfo, value: any) => {
    setColocataires(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // 4. Section déroulante : Détails facultatifs (sans blocage !)
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(false);
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [city, setCity] = useState(initialProperty?.city || 'Paris');
  const [postalCode, setPostalCode] = useState(initialProperty?.postalCode || '75011');
  const [surface, setSurface] = useState<number | ''>(initialProperty?.surface || 32);
  const [rooms, setRooms] = useState<number | ''>(initialProperty?.rooms || 2);
  const [floor, setFloor] = useState(initialProperty?.floor || '');

  // PNO : Tacite reconduction par défaut (souvent le cas en réalité)
  const [pnoTacitRenewal, setPnoTacitRenewal] = useState<boolean>(
    initialProperty?.pnoTacitRenewal ?? true
  );
  const [pnoInsurer, setPnoInsurer] = useState(initialProperty?.pnoInsurer || '');
  const [pnoExpiryDate, setPnoExpiryDate] = useState(
    initialProperty?.pnoExpiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  // DPE & IRL
  const [dpeRating, setDpeRating] = useState<DpeRating>(initialProperty?.dpeRating || 'D');
  const [leaseStartDate, setLeaseStartDate] = useState(
    initialProperty?.leaseStartDate || new Date().toISOString().split('T')[0]
  );
  const [hasRevisionClause, setHasRevisionClause] = useState<boolean>(
    initialProperty?.hasRevisionClause ?? true
  );
  const [irlReferenceQuarter, setIrlReferenceQuarter] = useState<string>(
    initialProperty?.irlReferenceQuarter || 'T3'
  );
  const [lastRevisionDate, setLastRevisionDate] = useState<string>(
    initialProperty?.lastRevisionDate || ''
  );
  const [guarantor, setGuarantor] = useState(initialProperty?.guarantor || '');

  // Total calculé
  const totalRent = (typeof rentExcl === 'number' ? rentExcl : 0) + (typeof charges === 'number' ? charges : 0);

  // Soumission Ultra Rapide
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Le nom du bien est le seul pré-requis direct. S'il est vide, on utilise l'adresse ou un nom par défaut
    const finalName = name.trim() || address.trim() || 'Logement locatif';
    const finalAddress = address.trim() || finalName;

    let finalTenantName = '';
    let finalTenants: TenantInfo[] = [];

    if (isColocation) {
      const validColocs = colocataires.filter(c => c.name.trim().length > 0);
      if (validColocs.length > 0) {
        finalTenants = validColocs;
        finalTenantName = validColocs.map(c => c.name.trim()).join(' & ');
      } else {
        finalTenants = [{ id: '1', name: 'Colocation (en attente des noms)' }];
        finalTenantName = 'Colocation en place';
      }
    } else {
      finalTenantName = tenantName.trim() || 'Locataire en place';
      finalTenants = [{
        id: '1',
        name: finalTenantName,
        email: tenantEmail.trim() || undefined,
        phone: tenantPhone.trim() || undefined
      }];
    }

    const newProperty: Property = {
      id: initialProperty?.id || `prop_${Date.now()}`,
      name: finalName,
      address: finalAddress,
      city: city.trim() || 'Paris',
      postalCode: postalCode.trim() || '75000',
      isTenseZone: true,
      surface: surface ? Number(surface) : 30,
      rooms: rooms ? Number(rooms) : 2,
      floor: floor.trim() || undefined,

      leaseType,
      type: leaseType,
      leaseStartDate,
      leaseDurationYears: leaseType === 'vide' ? 3 : 1,
      chargesMode: 'provisions',

      rentExcl: Number(rentExcl) || 0,
      charges: Number(charges) || 0,
      deposit: deposit !== '' ? Number(deposit) : calculateDefaultDeposit(leaseType, rentExcl),

      // IRL
      hasRevisionClause,
      irlReferenceQuarter,
      lastRevisionDate: lastRevisionDate.trim() || undefined,
      irlBaseQuarter: initialProperty?.irlBaseQuarter || `${irlReferenceQuarter} 2024`,
      irlBaseValue: initialProperty?.irlBaseValue || 144.51,
      irlQuarter: initialProperty?.irlQuarter || `${irlReferenceQuarter} 2024`,
      irlIndex: initialProperty?.irlIndex || 144.51,

      // Conformité
      dpeRating: dpeRating || 'D',
      pnoTacitRenewal,
      pnoInsurer: pnoInsurer.trim() || undefined,
      pnoExpiryDate: pnoTacitRenewal ? undefined : pnoExpiryDate,
      hasGli: !!guarantor.toLowerCase().includes('gli') || !!guarantor.toLowerCase().includes('visale'),
      gliProvider: guarantor.trim() || undefined,
      hasGasHeating: false,
      hasChimney: false,

      // Locataires
      tenantName: finalTenantName,
      tenantEmail: !isColocation ? (tenantEmail.trim() || undefined) : finalTenants[0]?.email,
      tenantPhone: !isColocation ? (tenantPhone.trim() || undefined) : finalTenants[0]?.phone,
      tenantInsuranceExpiry: initialProperty?.tenantInsuranceExpiry,
      insuranceValidUntil: initialProperty?.insuranceValidUntil,
      guarantor: guarantor.trim() || undefined,
      isColocation,
      tenants: finalTenants,

      createdAt: initialProperty?.createdAt || new Date().toISOString()
    };

    onComplete(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="onboarding-tunnel-card"
        className="bg-slate-50 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header : Clair & Rassurant */}
        <div className="bg-navy text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5 pr-8">
            <AppLogo className="w-12 h-12 bg-white rounded-2xl p-1 shadow-md flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-light text-navy tracking-wider">
                  ⚡ Création Express
                </span>
                <span className="text-[10px] text-emerald-light font-semibold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-light mr-1 animate-pulse" />
                  Zéro blocage
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                {isEditing ? 'Modifier la fiche du bien' : 'Ajouter un bien en location'}
              </h3>
              <p className="text-xs text-navy-100 font-medium mt-0.5">
                Renseignez l'essentiel en 30 secondes. Vous pourrez compléter le reste plus tard à votre rythme.
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          
          {/* SECTION 1: LE LOGEMENT & LE TYPE DE BAIL */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="text-sm font-black text-navy">
                  Le Logement
                </h4>
                <p className="text-[11px] text-slate-500">
                  Donnez un nom ou une adresse pour identifier votre bien
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Nom ou adresse du bien <span className="text-status-urgent">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Studio Rue Oberkampf, 2P Voltaire, T3 Belleville..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy focus:border-navy focus:outline-none transition shadow-xs"
                autoFocus
              />
            </div>

            {/* Type de bail : Gros sélecteurs visuels */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Type de location
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLeaseTypeChange('meuble')}
                  className={`p-3.5 rounded-xl border-2 text-left transition flex items-start space-x-3 cursor-pointer ${
                    leaseType === 'meuble'
                      ? 'border-navy bg-navy-50/60 ring-2 ring-navy/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🛋️</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-extrabold text-slate-900">Meublé</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-navy-100 text-navy">
                        Bail 1 an
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Caution légale ALUR : <strong className="text-slate-800">2 mois de loyer HC</strong>
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLeaseTypeChange('vide')}
                  className={`p-3.5 rounded-xl border-2 text-left transition flex items-start space-x-3 cursor-pointer ${
                    leaseType === 'vide'
                      ? 'border-navy bg-navy-50/60 ring-2 ring-navy/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🏢</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-extrabold text-slate-900">Nu / Non meublé</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-navy-100 text-navy">
                        Bail 3 ans
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Caution légale ALUR : <strong className="text-slate-800">1 mois de loyer HC</strong>
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: LE LOYER & LA CAUTION INTELLIGENTE */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="text-sm font-black text-navy">
                  Loyer & Caution
                </h4>
                <p className="text-[11px] text-slate-500">
                  La caution est calculée automatiquement selon la Loi ALUR (2 mois si meublé, 1 mois si vide)
                </p>
              </div>
            </div>

            {/* Loyer HC + Charges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Loyer mensuel hors charges (€) <span className="text-status-urgent">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="850"
                    value={rentExcl}
                    onChange={(e) => handleRentChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm font-bold p-3 pr-8 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold text-xs">€</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Provisions pour charges (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="70"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full text-sm font-bold p-3 pr-8 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy focus:outline-none"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 font-bold text-xs">€</span>
                </div>
              </div>
            </div>

            {/* Total Mensuel Callout */}
            <div className="p-3 bg-navy-50/70 border border-navy-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-extrabold text-navy flex items-center space-x-1.5">
                <span>Total appelé au locataire :</span>
              </span>
              <span className="text-base font-black text-navy">
                {totalRent.toLocaleString('fr-FR')} € <span className="text-[11px] font-medium text-slate-600">/ mois CC</span>
              </span>
            </div>

            {/* Caution Évidente avec boutons rapides */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <span>Dépôt de garantie (Caution)</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border">
                    {leaseType === 'meuble' ? '💡 Recommandé meublé : 2 mois' : '💡 Recommandé vide : 1 mois'}
                  </span>
                </label>
              </div>

              {/* Suggestions en 1 clic */}
              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const val = (typeof rentExcl === 'number' ? rentExcl : 0) * 2;
                    setDeposit(val);
                    setIsDepositManuallySet(true);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    deposit === (typeof rentExcl === 'number' ? rentExcl : 0) * 2
                      ? 'bg-navy text-white border-navy'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  2 mois ({((typeof rentExcl === 'number' ? rentExcl : 0) * 2).toLocaleString('fr-FR')} €)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const val = (typeof rentExcl === 'number' ? rentExcl : 0);
                    setDeposit(val);
                    setIsDepositManuallySet(true);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                    deposit === (typeof rentExcl === 'number' ? rentExcl : 0)
                      ? 'bg-navy text-white border-navy'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  1 mois ({((typeof rentExcl === 'number' ? rentExcl : 0)).toLocaleString('fr-FR')} €)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeposit(0);
                    setIsDepositManuallySet(true);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    deposit === 0
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  Sans caution (0 €)
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="Montant du dépôt de garantie"
                  value={deposit}
                  onChange={(e) => {
                    setDeposit(e.target.value === '' ? '' : Number(e.target.value));
                    setIsDepositManuallySet(true);
                  }}
                  className="w-full text-sm font-semibold p-2.5 pr-8 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-xs">€</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATAIRE & COLOCATION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-navy-50 text-navy flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-black text-navy">
                    Locataire(s) & Colocation
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Prenez en compte plusieurs locataires ou une colocation en 1 clic
                  </p>
                </div>
              </div>

              {/* Toggle Locataire unique vs Colocation */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsColocation(false)}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                    !isColocation
                      ? 'bg-white text-navy shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Seul</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsColocation(true)}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 cursor-pointer ${
                    isColocation
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Colocation</span>
                </button>
              </div>
            </div>

            {/* CAS 1 : LOCATAIRE UNIQUE */}
            {!isColocation ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Prénom et Nom du locataire
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Alexandre Martin"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    (Si vous n'avez pas encore le nom exact, laissez vide : il sera noté « Locataire en place »)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email (facultatif)
                    </label>
                    <input
                      type="email"
                      placeholder="alexandre@gmail.com"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Téléphone (facultatif)
                    </label>
                    <input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-navy"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* CAS 2 : COLOCATION */
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-navy" />
                    <span>Liste des colocataires ({colocataires.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddColoc}
                    className="text-xs font-bold text-navy hover:text-navy-800 bg-white border border-slate-200 hover:bg-navy-50 px-2.5 py-1 rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter un colocataire</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {colocataires.map((coloc, idx) => (
                    <div key={coloc.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Colocataire {idx + 1}
                        </span>
                        {colocataires.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColoc(coloc.id)}
                            className="text-status-urgent-text hover:text-red-800 p-1 rounded hover:bg-status-urgent-bg transition cursor-pointer"
                            title="Supprimer ce colocataire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Prénom & Nom"
                            value={coloc.name}
                            onChange={(e) => handleUpdateColoc(coloc.id, 'name', e.target.value)}
                            className="w-full text-xs font-semibold p-2 rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="Quote-part"
                              value={coloc.sharePercent || ''}
                              onChange={(e) => handleUpdateColoc(coloc.id, 'sharePercent', Number(e.target.value))}
                              className="w-full text-xs font-bold p-2 pr-6 rounded-lg border border-slate-300"
                            />
                            <span className="absolute right-2 top-2 text-slate-400 text-xs font-bold">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="email"
                          placeholder="Email (facultatif)"
                          value={coloc.email || ''}
                          onChange={(e) => handleUpdateColoc(coloc.id, 'email', e.target.value)}
                          className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200"
                        />
                        <input
                          type="tel"
                          placeholder="Téléphone (facultatif)"
                          value={coloc.phone || ''}
                          onChange={(e) => handleUpdateColoc(coloc.id, 'phone', e.target.value)}
                          className="w-full text-[11px] p-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4 : VOLET DÉROULANT OPTIONNEL (PNO, IRL, DPE) */}
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowOptionalDetails(!showOptionalDetails)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-navy-50 text-navy">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-navy">
                    {showOptionalDetails 
                      ? 'Masquer les options secondaires' 
                      : 'Afficher plus de détails (PNO, DPE, IRL... facultatif)'}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Pas tout sous la main ? Aucun problème, vous pourrez compléter plus tard !
                  </p>
                </div>
              </div>

              {showOptionalDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showOptionalDetails && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-5 animate-in slide-in-from-top-2 duration-150">
                
                {/* PNO : TACITE RECONDUCTION */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h6 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-status-ok" />
                        <span>Assurance PNO (Propriétaire Non Occupant)</span>
                      </h6>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Obligatoire en copropriété (Loi ALUR)
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start space-x-2.5 cursor-pointer p-2 rounded-lg bg-status-ok-bg border border-status-ok-border">
                    <input
                      type="checkbox"
                      checked={pnoTacitRenewal}
                      onChange={(e) => setPnoTacitRenewal(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-status-ok focus:ring-status-ok"
                    />
                    <div className="text-xs">
                      <span className="font-extrabold text-slate-900 block">
                        Renouvellement en tacite reconduction annuelle (le plus fréquent)
                      </span>
                      <span className="text-[11px] text-status-ok-text">
                        Votre contrat se renouvelle chaque année automatiquement. Vous n'avez pas besoin de chercher ou de saisir une date d'échéance exacte !
                      </span>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Compagnie d'assurance (facultatif)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Macif, AXA, Allianz, Matmut..."
                        value={pnoInsurer}
                        onChange={(e) => setPnoInsurer(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    {!pnoTacitRenewal && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Date d'échéance précise
                        </label>
                        <input
                          type="date"
                          value={pnoExpiryDate}
                          onChange={(e) => setPnoExpiryDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* INDICE IRL : EXPLIQUÉ EN TOUTE SIMPLICITÉ */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h6 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-navy" />
                    <span>Révision annuelle de loyer (Indice IRL)</span>
                  </h6>
                  <div className="p-3 rounded-lg bg-navy-50/70 border border-navy-100 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-navy">
                      ✨ Calcul et rappel 100% automatiques par Dryos
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Vous n'avez aucun calcul à faire. Chaque année à la date anniversaire du bail, l'application vous propose la révision exacte basée sur le dernier indice officiel publié par l'INSEE.
                    </p>
                  </div>
                </div>

                {/* DPE */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                  <h6 className="text-xs font-extrabold text-slate-900">
                    Diagnostic DPE
                  </h6>
                  <p className="text-[11px] text-slate-500">
                    Note énergétique du logement (facultatif si vous ne l'avez pas sous la main)
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(['A', 'B', 'C', 'D', 'E', 'F', 'G'] as DpeRating[]).map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setDpeRating(rating)}
                        className={`w-8 h-8 rounded-lg font-black text-xs transition cursor-pointer ${
                          dpeRating === rating
                            ? 'bg-navy text-white ring-2 ring-navy'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ADRESSE DÉTAILLÉE, SURFACE, ÉTAGE */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h6 className="text-xs font-extrabold text-slate-900">
                    Adresse postale & Surface
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Adresse postale (ex: 14 rue de la Roquette)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Code postal (ex: 75011)"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Ville (ex: Paris)"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Surface (m²)"
                        value={surface}
                        onChange={(e) => setSurface(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Étage / Porte (ex: 3ème gauche)"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* DATE DU BAIL, IRL & GARANT */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Date de signature / début du bail
                      </label>
                      <input
                        type="date"
                        value={leaseStartDate}
                        onChange={(e) => setLeaseStartDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Trimestre IRL de référence (Bail)
                      </label>
                      <select
                        value={irlReferenceQuarter}
                        onChange={(e) => setIrlReferenceQuarter(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="T1">T1 (1er trimestre)</option>
                        <option value="T2">T2 (2ème trimestre)</option>
                        <option value="T3">T3 (3ème trimestre)</option>
                        <option value="T4">T4 (4ème trimestre)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Date de dernière révision (si déjà révisé)
                      </label>
                      <input
                        type="date"
                        value={lastRevisionDate}
                        onChange={(e) => setLastRevisionDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Garant / Caution solidaire (facultatif)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Visale, Parents, Garantme..."
                        value={guarantor}
                        onChange={(e) => setGuarantor(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Clause d'indexation annuelle */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Clause d'indexation annuelle IRL
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Prévue dans le contrat (permet la révision du loyer à date anniversaire)
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasRevisionClause}
                        onChange={(e) => setHasRevisionClause(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-navy"></div>
                    </label>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* BOUTON D'ACTION PRINCIPAL : TOUJOURS ACCESSIBLE */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-navy hover:bg-navy-800 text-white font-extrabold text-base rounded-2xl transition shadow-lg flex items-center justify-center space-x-2.5 cursor-pointer transform active:scale-[0.99]"
            >
              <Zap className="w-5 h-5 text-emerald-light" />
              <span>{isEditing ? 'Enregistrer les modifications' : '⚡ Créer le bien immédiatement'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              ✅ Tout est prêt dès la création : quittances PDF, pointage des loyers et alertes. Vous pourrez compléter les documents quand vous les aurez !
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

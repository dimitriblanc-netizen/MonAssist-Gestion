import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Building2, 
  Home, 
  Euro, 
  FileCheck2, 
  CheckCircle2, 
  Copy, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AccountSetupFormData, LandlordAccount, LeaseType, ChargesMode, DpeRating, MandateType } from '../types';
import { createAccountFromSetup } from '../services/adminService';

interface AccountSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (account: LandlordAccount) => void;
}

export const AccountSetupModal: React.FC<AccountSetupModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<LandlordAccount | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const [formData, setFormData] = useState<AccountSetupFormData>({
    // Landlord
    fullName: '',
    email: '',
    phone: '',
    mandateType: 'MISE_EN_LOCATION',
    agencyNotes: 'Mise en location réalisée par l\'agence DRYOS.',

    // Property
    propertyName: '',
    address: '',
    postalCode: '',
    city: '',
    surface: 45,
    rooms: 2,
    floor: '2e',
    leaseType: 'meuble',
    rentExcl: 750,
    charges: 80,
    chargesMode: 'forfait',
    deposit: 1500,
    dpeRating: 'C',
    dpeExpiryDate: '2032-12-31',
    irlBaseQuarter: 'T3 2024',
    irlBaseValue: 144.51,
    hasRevisionClause: true,

    // Tenant
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseDurationYears: 1,
    gliProvider: 'Visale / Garantie DRYOS',
    guarantor: '',

    // Docs
    hasSignedLeaseDoc: true,
    hasEdleDoc: true,
    hasDdtDoc: true,
    hasInsuranceDoc: true,
    hasAgencyInvoiceDoc: true
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof AccountSetupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as any);
    } else if (step === 4) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.propertyName) {
      alert("Veuillez renseigner au minimum le nom du bailleur, son email et le nom du bien.");
      return;
    }

    setIsSubmitting(true);
    try {
      const account = await createAccountFromSetup(formData);
      setCreatedAccount(account);
      onAccountCreated(account);
      setStep(5); // Success step
    } catch (err) {
      console.error("Error creating account:", err);
      alert("Une erreur est survenue lors de la création du compte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailSubject = `Votre espace de gestion locative configuré par DRYOS Immobilier`;
  const emailBody = `Bonjour ${formData.fullName},

DRYOS Immobilier a le plaisir de vous annoncer la finalisation de la mise en location de votre bien : ${formData.propertyName}.

Nous avons préparé et configuré pour vous votre espace personnalisé sur "Mon Assist'Gestion" :
- Votre bien et votre locataire (${formData.tenantName || 'en place'}) sont déjà intégrés
- Le bail signé, l'état des lieux et vos diagnostics sont archivés dans votre coffre-fort numérique
- Vos quittances mensuelles et vos échéances sont prêtes en 1 clic

Accédez à votre espace dès maintenant :
https://gestion.dryos.fr/app

Pour vous connecter la première fois, utilisez simplement votre adresse email : ${formData.email}

Bien cordialement,
Dimitri Blanc
DRYOS Immobilier
contact@dryos.fr`;

  const copyEmailText = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-navy text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-emerald-light">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mise en place de compte bailleur</h3>
              <p className="text-xs text-slate-200">
                Service agence DRYOS Immobilier • Pack Clé-en-main
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper (Steps 1 to 4) */}
        {step < 5 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-navy' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 1 ? 'bg-navy text-white' : step > 1 ? 'bg-emerald-brand text-white' : 'bg-slate-200'}`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className="hidden sm:inline">1. Bailleur</span>
            </div>
            <div className="h-0.5 w-6 bg-slate-200" />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-navy' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-navy text-white' : step > 2 ? 'bg-emerald-brand text-white' : 'bg-slate-200'}`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className="hidden sm:inline">2. Le Bien</span>
            </div>
            <div className="h-0.5 w-6 bg-slate-200" />
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-navy' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-navy text-white' : step > 3 ? 'bg-emerald-brand text-white' : 'bg-slate-200'}`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span className="hidden sm:inline">3. Locataire</span>
            </div>
            <div className="h-0.5 w-6 bg-slate-200" />
            <div className={`flex items-center space-x-2 ${step >= 4 ? 'text-navy' : 'text-slate-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 4 ? 'bg-navy text-white' : 'bg-slate-200'}`}>
                4
              </span>
              <span className="hidden sm:inline">4. Dossier</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: LE PROPRIÉTAIRE */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-navy font-bold text-sm">
                <UserPlus className="w-4 h-4" />
                <span>Informations du propriétaire bailleur</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom et Prénom du client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Dupont"
                    value={formData.fullName}
                    onChange={e => handleChange('fullName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse Email (identifiant) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone portable
                  </label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Formule de mandat DRYOS
                  </label>
                  <select
                    value={formData.mandateType}
                    onChange={e => handleChange('mandateType', e.target.value as MandateType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none bg-white font-medium"
                  >
                    <option value="MISE_EN_LOCATION">Mise en location DRYOS (Pack Sérénité)</option>
                    <option value="GESTION_COMPLETE">Gestion Déléguée Complète DRYOS</option>
                    <option value="AUTONOME">Gestion Autonome (Client indépendant)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes internes agence
                </label>
                <textarea
                  rows={2}
                  value={formData.agencyNotes}
                  onChange={e => handleChange('agencyNotes', e.target.value)}
                  placeholder="Notes particulières sur le client, exigences..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-navy text-xs focus:outline-none"
                />
              </div>

              <div className="bg-navy-50 border border-navy-200 rounded-2xl p-3 text-xs text-navy flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-brand shrink-0 mt-0.5" />
                <p>
                  En créant ce compte pour votre client, son espace sera immédiatement prêt avec le bien, le locataire, et le contrat déjà configurés.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: LE BIEN */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-navy font-bold text-sm">
                <Building2 className="w-4 h-4" />
                <span>Fiche du bien immobilier loué</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Désignation du bien *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: T2 République - Lyon 2e"
                    value={formData.propertyName}
                    onChange={e => handleChange('propertyName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse complète
                  </label>
                  <input
                    type="text"
                    placeholder="12 rue de la République, 69002 Lyon"
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type de bail
                  </label>
                  <select
                    value={formData.leaseType}
                    onChange={e => {
                      const lt = e.target.value as LeaseType;
                      handleChange('leaseType', lt);
                      handleChange('leaseDurationYears', lt === 'meuble' ? 1 : 3);
                      handleChange('chargesMode', lt === 'meuble' ? 'forfait' : 'provisions');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none bg-white font-medium"
                  >
                    <option value="meuble">Meublé (Bail 1 an renouvelable)</option>
                    <option value="vide">Non meublé / Nu (Bail 3 ans)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Classe DPE (Énergie)
                  </label>
                  <select
                    value={formData.dpeRating}
                    onChange={e => handleChange('dpeRating', e.target.value as DpeRating)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none bg-white font-bold"
                  >
                    <option value="A">Classe A</option>
                    <option value="B">Classe B</option>
                    <option value="C">Classe C (Très bon)</option>
                    <option value="D">Classe D</option>
                    <option value="E">Classe E</option>
                    <option value="F">Classe F (Passoire - IRL gelé)</option>
                    <option value="G">Classe G (Passoire - IRL gelé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Loyer nu (€ hors charges) *
                  </label>
                  <input
                    type="number"
                    value={formData.rentExcl}
                    onChange={e => handleChange('rentExcl', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Charges (€/mois)
                  </label>
                  <input
                    type="number"
                    value={formData.charges}
                    onChange={e => handleChange('charges', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dépôt de garantie (€)
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={e => handleChange('deposit', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trimestre IRL de référence fixé au bail
                  </label>
                  <input
                    type="text"
                    value={formData.irlBaseQuarter}
                    onChange={e => handleChange('irlBaseQuarter', e.target.value)}
                    placeholder="Ex: T3 2024 (144.51)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LE LOCATAIRE */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-navy font-bold text-sm">
                <Home className="w-4 h-4" />
                <span>Locataire mis en place par DRYOS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom et Prénom du locataire *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Bernard"
                    value={formData.tenantName}
                    onChange={e => handleChange('tenantName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email du locataire
                  </label>
                  <input
                    type="email"
                    placeholder="locataire@gmail.com"
                    value={formData.tenantEmail}
                    onChange={e => handleChange('tenantEmail', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone du locataire
                  </label>
                  <input
                    type="tel"
                    placeholder="07 12 34 56 78"
                    value={formData.tenantPhone}
                    onChange={e => handleChange('tenantPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date d'effet du bail
                  </label>
                  <input
                    type="date"
                    value={formData.leaseStartDate}
                    onChange={e => handleChange('leaseStartDate', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Garantie locative validée
                  </label>
                  <select
                    value={formData.gliProvider}
                    onChange={e => handleChange('gliProvider', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-navy text-sm focus:outline-none bg-white font-medium"
                  >
                    <option value="Visale">Garantie Visale (Action Logement)</option>
                    <option value="GLI DRYOS">Assurance Loyers Impayés (GLI DRYOS)</option>
                    <option value="Caution solidaire">Caution solidaire (Garants physiques)</option>
                    <option value="Garantme">Garantme / Caution bancaire</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DOSSIER & PIÈCES COFFRE-FORT */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center space-x-2 text-navy font-bold text-sm">
                <FileCheck2 className="w-4 h-4" />
                <span>Dossier & Coffre-fort numérique initialisé par DRYOS</span>
              </div>
              <p className="text-xs text-slate-500">
                Cochez les pièces remises au bailleur qui seront automatiquement répertoriées dans son coffre-fort numérique :
              </p>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasSignedLeaseDoc}
                    onChange={e => handleChange('hasSignedLeaseDoc', e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy"
                  />
                  <span>Contrat de bail d'habitation signé par les parties</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasEdleDoc}
                    onChange={e => handleChange('hasEdleDoc', e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy"
                  />
                  <span>État des lieux d'entrée (EDLE) contradictoire + photos</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDdtDoc}
                    onChange={e => handleChange('hasDdtDoc', e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy"
                  />
                  <span>Dossier de Diagnostics Techniques (DDT, DPE, ERP, Plomb)</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasInsuranceDoc}
                    onChange={e => handleChange('hasInsuranceDoc', e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy"
                  />
                  <span>Attestation d'assurance Multirisque Habitation (MRH) locataire</span>
                </label>

                <label className="flex items-center space-x-3 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasAgencyInvoiceDoc}
                    onChange={e => handleChange('hasAgencyInvoiceDoc', e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy"
                  />
                  <span>Facture d'honoraires DRYOS (Déductible fiscalement à 100%)</span>
                </label>
              </div>

              <div className="bg-status-warning-bg border border-status-warning-border rounded-2xl p-3 text-xs text-status-warning-text flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-status-warning-text shrink-0 mt-0.5" />
                <p>
                  Le compte sera créé avec le premier mois de loyer déjà validé et la dépense d'honoraires DRYOS pré-remplie pour le bilan fiscal du propriétaire.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: COMPTE CRÉÉ & MODÈLE D'EMAIL */}
          {step === 5 && createdAccount && (
            <div className="space-y-5 animate-in zoom-in-95 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-status-ok-bg border border-status-ok-border p-4 sm:p-5 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-status-ok text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-status-ok-text">
                    Compte client configuré avec succès !
                  </h4>
                  <p className="text-xs text-status-ok-text">
                    Le compte pour <strong>{createdAccount.fullName}</strong> ({createdAccount.email}) a été initialisé avec le bien <strong>{formData.propertyName}</strong>.
                  </p>
                </div>
              </div>

              {/* Email Template */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Message d'activation prêt à envoyer au client
                  </span>
                  <button
                    onClick={copyEmailText}
                    className="text-xs font-bold text-navy hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedEmail ? 'Copié !' : 'Copier le message'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono bg-white p-3 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {emailBody}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`mailto:${formData.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  className="flex-1 px-4 py-3 rounded-xl bg-navy hover:bg-navy-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Ouvrir dans mon logiciel de messagerie</span>
                </a>

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                Précédent
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Création en cours...</span>
              ) : step === 4 ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-light" />
                  <span>Finaliser la mise en place du compte</span>
                </>
              ) : (
                <>
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

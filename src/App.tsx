import React, { useState, useEffect } from 'react';
import { 
  Property, 
  RentRecord, 
  ExpenseRecord, 
  PaymentStatus 
} from './types';
import { 
  initializeData, 
  saveProperty, 
  updateRentStatus, 
  addRentRecord, 
  saveExpense, 
  deleteExpenseFromDb,
  getCachedActivePropertyId,
  setCachedActivePropertyId
} from './services/dataService';
import { Header } from './components/Header';
import { PropertySelector } from './components/PropertySelector';
import { ActionFeed } from './components/ActionFeed';
import { RentSection } from './components/RentSection';
import { LegalRemindersSection } from './components/LegalRemindersSection';
import { FinanceSection } from './components/FinanceSection';
import { TenantExitSection } from './components/TenantExitSection';
import { OnboardingTunnel } from './components/OnboardingTunnel';
import { IrlCalculatorModal } from './components/IrlCalculatorModal';
import { ReminderModal } from './components/ReminderModal';
import { DryosAgencyModal } from './components/DryosAgencyModal';
import { generateQuittancePDF } from './utils/generateReceipt';
import { generateLrarMiseEnDemeure } from './utils/generateLrarPdf';
import { NotificationBanner } from './components/NotificationBanner';
import { usePWA } from './hooks/usePWA';
import { InstallHeroBanner } from './components/InstallHeroBanner';
import { InstallAppModal } from './components/InstallAppModal';
import { 
  Sparkles, 
  Receipt, 
  Scale, 
  Euro, 
  LogOut, 
  ShieldAlert, 
  Home, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

export default function App() {
  const pwa = usePWA();
  const [properties, setProperties] = useState<Property[]>([]);
  const [rents, setRents] = useState<RentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'RENTS' | 'LEGAL' | 'FINANCE' | 'EXIT'>('ACTIONS');

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [selectedIrlProperty, setSelectedIrlProperty] = useState<Property | null>(null);
  const [reminderTarget, setReminderTarget] = useState<{ property: Property; rent: RentRecord } | null>(null);

  // Load and cache
  useEffect(() => {
    async function load() {
      try {
        const data = await initializeData();
        setProperties(data.properties);
        setRents(data.rents);
        setExpenses(data.expenses);
        setFirebaseConnected(true);

        // Check local cache for active property
        const cachedId = getCachedActivePropertyId();
        if (cachedId && data.properties.some(p => p.id === cachedId)) {
          setActivePropertyId(cachedId);
        } else if (data.properties.length > 0) {
          setActivePropertyId(data.properties[0].id);
          setCachedActivePropertyId(data.properties[0].id);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectProperty = (prop: Property) => {
    setActivePropertyId(prop.id);
    setCachedActivePropertyId(prop.id);
  };

  const activeProperty = properties.find(p => p.id === activePropertyId) || properties[0] || null;

  // Handlers for Data Mutations
  const handleCompleteOnboarding = async (newProp: Property) => {
    setProperties(prev => [newProp, ...prev]);
    setActivePropertyId(newProp.id);
    setCachedActivePropertyId(newProp.id);
    setShowOnboarding(false);
    await saveProperty(newProp);

    // Create current month rent record
    const newRent: RentRecord = {
      id: `rent_${newProp.id}_03_2025`,
      propertyId: newProp.id,
      month: 'Mars',
      year: 2025,
      period: '01/03/2025 au 31/03/2025',
      rentAmount: newProp.rentExcl,
      chargesAmount: newProp.charges,
      total: newProp.rentExcl + newProp.charges,
      status: 'PENDING',
      paymentMethod: 'Virement bancaire'
    };
    setRents(prev => [newRent, ...prev]);
    await addRentRecord(newRent);
  };

  const handleValidateRent = async (rentId: string) => {
    const paidDate = new Date().toLocaleDateString('fr-FR');
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status: 'PAID', paidDate } : r));
    await updateRentStatus(rentId, 'PAID', paidDate);

    // Auto trigger PDF receipt download
    const targetRent = rents.find(r => r.id === rentId);
    if (targetRent && activeProperty) {
      generateQuittancePDF(activeProperty, { ...targetRent, status: 'PAID', paidDate });
    }
  };

  const handleRejectRent = async (rentId: string) => {
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status: 'LATE_J10' } : r));
    await updateRentStatus(rentId, 'LATE_J10');
    const target = rents.find(r => r.id === rentId);
    if (target && activeProperty) {
      setReminderTarget({ property: activeProperty, rent: { ...target, status: 'LATE_J10' } });
    }
  };

  const handleSetLateStatus = async (rentId: string, status: PaymentStatus) => {
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status } : r));
    await updateRentStatus(rentId, status);
  };

  const handleGenerateNextMonth = async (monthName: string, year: number) => {
    if (!activeProperty) return;
    const exists = rents.some(r => r.propertyId === activeProperty.id && r.month === monthName && r.year === year);
    if (exists) {
      alert(`L'appel de loyer pour ${monthName} ${year} existe déjà.`);
      return;
    }

    const newRecord: RentRecord = {
      id: `rent_${activeProperty.id}_${monthName.toLowerCase()}_${year}`,
      propertyId: activeProperty.id,
      month: monthName,
      year,
      period: `01/04/${year} au 30/04/${year}`,
      rentAmount: activeProperty.rentExcl,
      chargesAmount: activeProperty.charges,
      total: activeProperty.rentExcl + activeProperty.charges,
      status: 'PENDING',
      paymentMethod: 'Virement bancaire'
    };

    setRents(prev => [newRecord, ...prev]);
    await addRentRecord(newRecord);
    alert(`Appel de loyer créé pour ${monthName} ${year} (${newRecord.total} €).`);
  };

  const handleApplyNewIrlRent = async (propertyId: string, newRentExcl: number, newQuarter: string, newIndex: number) => {
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const updated = { ...p, rentExcl: newRentExcl, irlBaseQuarter: newQuarter, irlBaseValue: newIndex };
        saveProperty(updated);
        return updated;
      }
      return p;
    }));
  };

  const handleAddExpense = async (expense: ExpenseRecord) => {
    setExpenses(prev => [expense, ...prev]);
    await saveExpense(expense);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    await deleteExpenseFromDb(expenseId);
  };

  // Current rent for active property
  const currentRent = rents.find(r => r.propertyId === activeProperty?.id && r.month === 'Mars' && r.year === 2025)
    || rents.find(r => r.propertyId === activeProperty?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7EE] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#00434A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#00434A]">Chargement de Mon Assist'Gestion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        onOpenAgencyContact={() => setShowAgencyModal(true)}
        onAddProperty={() => setShowOnboarding(true)}
        onDownloadAppClick={() => pwa.setShowInstallModal(true)}
        firebaseConnected={firebaseConnected}
        totalProperties={properties.length}
        isStandalone={pwa.isStandalone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6">

        {/* The Standout "Télécharger l'app ici" Hero Banner */}
        <InstallHeroBanner
          onOpenInstallModal={() => pwa.setShowInstallModal(true)}
          onTriggerInstall={pwa.triggerInstall}
          isInstallable={pwa.isInstallable}
          isStandalone={pwa.isStandalone}
          isIos={pwa.isIos}
        />

        {/* Active Property Selector (cached in localStorage) */}
        {properties.length > 0 && activeProperty && (
          <PropertySelector
            properties={properties}
            activeProperty={activeProperty}
            onSelectProperty={handleSelectProperty}
            onOpenOnboarding={() => setShowOnboarding(true)}
          />
        )}

        {/* Smartphone Push & Proactive Alert Banner */}
        <NotificationBanner />

        {/* Sub-Navigation Tabs (DESKTOP ONLY: On mobile, bottom navigation is used) */}
        <div className="hidden sm:block border-b border-slate-200/80 bg-white rounded-2xl shadow-xs px-2 pt-2">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1">
            <button
              id="tab-actions-feed"
              onClick={() => setActiveTab('ACTIONS')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'ACTIONS'
                  ? 'bg-[#00434A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Flux d'actions (Accueil)</span>
            </button>

            <button
              id="tab-rents-section"
              onClick={() => setActiveTab('RENTS')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'RENTS'
                  ? 'bg-[#00434A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4 text-teal-300" />
              <span>Loyers & Impayés</span>
            </button>

            <button
              id="tab-legal-section"
              onClick={() => setActiveTab('LEGAL')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'LEGAL'
                  ? 'bg-[#00434A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-teal-300" />
              <span>Rappels Légaux & IRL</span>
            </button>

            <button
              id="tab-finance-section"
              onClick={() => setActiveTab('FINANCE')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'FINANCE'
                  ? 'bg-[#00434A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Euro className="w-4 h-4 text-teal-300" />
              <span>Bilan Fiscal & Dépenses</span>
            </button>

            <button
              id="tab-exit-section"
              onClick={() => setActiveTab('EXIT')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'EXIT'
                  ? 'bg-[#00434A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LogOut className="w-4 h-4 text-teal-300" />
              <span>Sortie Locataire & Relouer</span>
            </button>
          </nav>
        </div>

        {/* View 1: Flux d'actions (L'anti-Rentila) */}
        {activeTab === 'ACTIONS' && activeProperty && (
          <div className="space-y-4 sm:space-y-6">
            <ActionFeed
              property={activeProperty}
              currentRent={currentRent}
              onValidateRent={handleValidateRent}
              onRejectRent={handleRejectRent}
              onOpenReminderModal={(p, r) => setReminderTarget({ property: p, rent: r })}
              onGenerateLrar={(p, r) => generateLrarMiseEnDemeure(p, r)}
              onOpenIrlModal={(p) => setSelectedIrlProperty(p)}
              onOpenDryosContact={() => setShowAgencyModal(true)}
            />

            {/* Mobile collapsible toggle for property details */}
            <div className="sm:hidden flex justify-center pt-2">
              <button
                onClick={() => setShowMobileDetails(!showMobileDetails)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-white/80 border border-slate-200 shadow-2xs transition cursor-pointer"
              >
                <span>{showMobileDetails ? 'Masquer la fiche locataire' : 'Fiche du bien & locataire'}</span>
                {showMobileDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick overview cards (Collapsed on mobile, visible on desktop) */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1 ${
              showMobileDetails ? 'grid' : 'hidden sm:grid'
            }`}>
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Locataire en place</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">{activeProperty.tenantName}</h4>
                <p className="text-xs text-slate-500">{activeProperty.tenantPhone} • {activeProperty.tenantEmail}</p>
                <div className="pt-2 text-xs font-semibold text-teal-800">
                  Garantie : {activeProperty.gliProvider || 'Visale'}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Bail & Loyer</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {activeProperty.rentExcl + activeProperty.charges} € / mois
                </h4>
                <p className="text-xs text-slate-500">
                  ({activeProperty.rentExcl} € nu + {activeProperty.charges} € {activeProperty.chargesMode})
                </p>
                <div className="pt-2 text-xs font-semibold text-slate-700">
                  Bail {activeProperty.leaseType} ({activeProperty.leaseDurationYears} an{activeProperty.leaseDurationYears > 1 ? 's' : ''})
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">DPE & Conformité</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm sm:text-lg font-black px-2.5 sm:px-3 py-0.5 rounded-lg text-white ${
                    activeProperty.dpeRating === 'F' || activeProperty.dpeRating === 'G' ? 'bg-rose-600' : 'bg-emerald-600'
                  }`}>
                    {activeProperty.dpeRating}
                  </span>
                  <span className="text-xs text-slate-600">
                    {activeProperty.dpeRating === 'F' || activeProperty.dpeRating === 'G' ? 'Passoire (IRL bloqué)' : 'Conforme'}
                  </span>
                </div>
                <div className="pt-2 text-xs text-slate-500">
                  PNO : {new Date(activeProperty.pnoExpiryDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Loyers & Impayés (Procédure Militaire) */}
        {activeTab === 'RENTS' && activeProperty && (
          <RentSection
            property={activeProperty}
            rents={rents}
            onValidateRent={handleValidateRent}
            onSetLateStatus={handleSetLateStatus}
            onOpenReminderModal={(p, r) => setReminderTarget({ property: p, rent: r })}
            onGenerateNextMonth={handleGenerateNextMonth}
          />
        )}

        {/* View 3: Rappels Légaux (IRL, Charges, Congé) */}
        {activeTab === 'LEGAL' && activeProperty && (
          <LegalRemindersSection
            property={activeProperty}
            onOpenIrlModal={(p) => setSelectedIrlProperty(p)}
            onOpenDryosContact={() => setShowAgencyModal(true)}
          />
        )}

        {/* View 4: Bilan Fiscal & Dépenses Déductibles */}
        {activeTab === 'FINANCE' && activeProperty && (
          <FinanceSection
            property={activeProperty}
            rents={rents}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {/* View 5: Sortie Locataire & Relouer (Dryos) */}
        {activeTab === 'EXIT' && activeProperty && (
          <TenantExitSection
            property={activeProperty}
            onOpenDryosModal={() => setShowAgencyModal(true)}
          />
        )}

      </main>

      {/* Modals */}
      {showOnboarding && (
        <OnboardingTunnel
          onClose={() => setShowOnboarding(false)}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {showAgencyModal && (
        <DryosAgencyModal
          properties={properties}
          onClose={() => setShowAgencyModal(false)}
          onSubmitTicket={() => setShowAgencyModal(false)}
        />
      )}

      {selectedIrlProperty && (
        <IrlCalculatorModal
          property={selectedIrlProperty as any}
          onClose={() => setSelectedIrlProperty(null)}
          onApplyNewRent={handleApplyNewIrlRent}
        />
      )}

      {reminderTarget && (
        <ReminderModal
          property={reminderTarget.property as any}
          rent={reminderTarget.rent as any}
          onClose={() => setReminderTarget(null)}
        />
      )}

      {/* PWA Install & QR Code Modal */}
      <InstallAppModal
        isOpen={pwa.showInstallModal}
        onClose={() => pwa.setShowInstallModal(false)}
        onTriggerInstall={pwa.triggerInstall}
        isInstallable={pwa.isInstallable}
        isIos={pwa.isIos}
        isStandalone={pwa.isStandalone}
      />

      {/* Sticky Bottom Legal & Dryos Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12 pb-24 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <span className="font-black text-[#00434A]">MON ASSIST'GESTION</span>
            <span className="hidden sm:inline">•</span>
            <span>Une initiative DRYOS Immobilier (paris.dryos.fr)</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-400">100% déclaratif (aucun encaissement tiers, pas de Carte G)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Quota Firebase gratuit (0 €/mois)</span>
            </span>
            <button
              onClick={() => setShowAgencyModal(true)}
              className="font-bold text-[#00434A] hover:underline cursor-pointer"
            >
              Contact agence DRYOS
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Smartphone First) */}
      <nav 
        id="mobile-bottom-nav"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 pb-5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      >
        <button
          onClick={() => setActiveTab('ACTIONS')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer active:scale-95 ${
            activeTab === 'ACTIONS' ? 'bg-[#00434A] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === 'ACTIONS' ? 'text-teal-300' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('RENTS')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer active:scale-95 ${
            activeTab === 'RENTS' ? 'bg-[#00434A] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Receipt className={`w-4 h-4 ${activeTab === 'RENTS' ? 'text-teal-300' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Loyers</span>
        </button>

        <button
          onClick={() => setActiveTab('LEGAL')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer active:scale-95 ${
            activeTab === 'LEGAL' ? 'bg-[#00434A] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Scale className={`w-4 h-4 ${activeTab === 'LEGAL' ? 'text-teal-300' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Légal</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer active:scale-95 ${
            activeTab === 'FINANCE' ? 'bg-[#00434A] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Euro className={`w-4 h-4 ${activeTab === 'FINANCE' ? 'text-teal-300' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Bilan</span>
        </button>

        <button
          onClick={() => setActiveTab('EXIT')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition cursor-pointer active:scale-95 ${
            activeTab === 'EXIT' ? 'bg-[#00434A] text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <LogOut className={`w-4 h-4 ${activeTab === 'EXIT' ? 'text-teal-300' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-0.5">Sortie</span>
        </button>
      </nav>
    </div>
  );
}

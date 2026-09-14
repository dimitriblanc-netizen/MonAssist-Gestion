import React, { useState, useEffect } from 'react';
import { 
  Property, 
  RentRecord, 
  ExpenseRecord, 
  PaymentStatus,
  LandlordAccount 
} from './types';
import { 
  initializeData, 
  saveProperty, 
  updateRentStatus, 
  addRentRecord, 
  saveExpense, 
  deleteExpenseFromDb,
  getCachedActivePropertyId,
  setCachedActivePropertyId,
  seedDemoDataForUser,
  clearUserDataFromDb
} from './services/dataService';
import { isUserAdmin } from './services/adminService';
import { auth, onAuthStateChanged, logoutUser, User } from './firebase';
import { AppLogo } from './components/AppLogo';
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
import { ChargesRegulModal } from './components/ChargesRegulModal';
import { VaultModal } from './components/VaultModal';
import { DryosAgencyModal } from './components/DryosAgencyModal';
import { AuthModal } from './components/AuthModal';
import { EmptyPortfolioState } from './components/EmptyPortfolioState';
import { AdminConsole } from './components/AdminConsole';
import { generateQuittancePDF } from './utils/generateReceipt';
import { generateLrarMiseEnDemeure } from './utils/generateLrarPdf';
import { NotificationBanner } from './components/NotificationBanner';
import { usePWA } from './hooks/usePWA';
import { InstallHeroBanner } from './components/InstallHeroBanner';
import { InstallAppModal } from './components/InstallAppModal';
import { LandingPage } from './components/LandingPage';
import { PrivacyProvider, MaskedValue } from './context/PrivacyContext';
import { VaultSection } from './components/VaultSection';
import { SecurityModal } from './components/SecurityModal';
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
  Download,
  LogIn,
  Info,
  FolderLock,
  ShieldCheck,
  Eye,
  UserCheck
} from 'lucide-react';

export default function App() {
  const pwa = usePWA();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [rents, setRents] = useState<RentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);
  const [showMobileDetails, setShowMobileDetails] = useState<boolean>(false);

  // Active sub-tab (including Vault & Dossiers)
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'RENTS' | 'LEGAL' | 'FINANCE' | 'EXIT' | 'VAULT'>('ACTIONS');

  // Check standalone mode (PWA installed on device)
  const isDeviceStandalone = pwa.isStandalone || 
    (typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('dryos_pwa_installed') === 'true'
    ));

  // Admin & Impersonation state
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [previewingClient, setPreviewingClient] = useState<LandlordAccount | null>(null);

  // Routing: 'landing' (/) vs 'app' (/app)
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'app'>(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('dryos_pwa_installed') === 'true'
    );
    const hasEnteredApp = typeof localStorage !== 'undefined' && localStorage.getItem('dryos_has_entered_app') === 'true';
    if (pathname.startsWith('/app') || isStandalone || hasEnteredApp) {
      return 'app';
    }
    return 'landing';
  });

  const navigateTo = (route: 'landing' | 'app') => {
    // If installed as standalone app, landing is strictly locked out
    if (isDeviceStandalone && route === 'landing') {
      setCurrentRoute('app');
      return;
    }
    if (route === 'app') {
      localStorage.setItem('dryos_has_entered_app', 'true');
    }
    setCurrentRoute(route);
    const targetPath = route === 'app' ? '/app' : '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ route }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lock out landing page if standalone or logged in
  useEffect(() => {
    if (isDeviceStandalone || currentUser) {
      if (currentRoute !== 'app') {
        setCurrentRoute('app');
      }
      if (typeof window !== 'undefined' && window.location.pathname !== '/app') {
        window.history.replaceState({ route: 'app' }, '', '/app');
      }
    }
  }, [isDeviceStandalone, currentUser, currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      if (isDeviceStandalone) {
        setCurrentRoute('app');
        return;
      }
      if (window.location.pathname.startsWith('/app')) {
        setCurrentRoute('app');
      } else {
        setCurrentRoute('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDeviceStandalone]);

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showAgencyModal, setShowAgencyModal] = useState<boolean>(false);
  const [selectedIrlProperty, setSelectedIrlProperty] = useState<Property | null>(null);
  const [selectedChargesProperty, setSelectedChargesProperty] = useState<Property | null>(null);
  const [selectedVaultProperty, setSelectedVaultProperty] = useState<Property | null>(null);
  const [reminderTarget, setReminderTarget] = useState<{ property: Property; rent: RentRecord } | null>(null);

  // Monitor Authentication and Load Isolated Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
      setLoading(true);

      try {
        if (user) {
          // User is authenticated: load their private isolated data
          const data = await initializeData(user.uid);
          setProperties(data.properties);
          setRents(data.rents);
          setExpenses(data.expenses);
          setFirebaseConnected(true);

          const cachedId = getCachedActivePropertyId(user.uid);
          if (cachedId && data.properties.some(p => p.id === cachedId)) {
            setActivePropertyId(cachedId);
          } else if (data.properties.length > 0) {
            setActivePropertyId(data.properties[0].id);
            setCachedActivePropertyId(data.properties[0].id, user.uid);
          } else {
            setActivePropertyId(null);
          }
        } else {
          // Empty guest state
          setProperties([]);
          setRents([]);
          setExpenses([]);
          setActivePropertyId(null);
        }
      } catch (err) {
        console.error('Error loading data in auth state change:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setProperties([]);
    setRents([]);
    setExpenses([]);
    setActivePropertyId(null);
  };

  const handleSelectProperty = (prop: Property) => {
    setActivePropertyId(prop.id);
    setCachedActivePropertyId(prop.id, currentUser?.uid);
  };

  // Test data seeding & wiping for Admin's personal test workspace
  const handleLoadTestData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await seedDemoDataForUser(currentUser.uid);
      setProperties(data.properties);
      setRents(data.rents);
      setExpenses(data.expenses);
      if (data.properties.length > 0) {
        setActivePropertyId(data.properties[0].id);
        setCachedActivePropertyId(data.properties[0].id, currentUser.uid);
      }
    } catch (err) {
      console.error('Error loading test data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    if (!currentUser) return;
    const confirmed = window.confirm("Confirmez-vous la réinitialisation de votre espace personnel ? (Vos comptes clients en agence ne seront absolument pas touchés)");
    if (!confirmed) return;

    try {
      setLoading(true);
      await clearUserDataFromDb(currentUser.uid);
      setProperties([]);
      setRents([]);
      setExpenses([]);
      setActivePropertyId(null);
    } catch (err) {
      console.error('Error clearing personal test data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delegated data when previewing a client account from Admin Console
  const displayedProperties = previewingClient ? (previewingClient.properties || []) : properties;
  const displayedRents = previewingClient ? (previewingClient.rents || []) : rents;
  const displayedExpenses = previewingClient ? (previewingClient.expenses || []) : expenses;
  const activeProperty = displayedProperties.find(p => p.id === activePropertyId) || displayedProperties[0] || null;
  const isAdmin = isUserAdmin(currentUser);

  // Handlers for Data Mutations
  const handleCompleteOnboarding = async (newProp: Property) => {
    setProperties(prev => [newProp, ...prev]);
    setActivePropertyId(newProp.id);
    setCachedActivePropertyId(newProp.id, currentUser?.uid);
    setShowOnboarding(false);
    await saveProperty(newProp, currentUser?.uid);

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
    await addRentRecord(newRent, currentUser?.uid);
  };

  const handleUpdateProperty = async (updatedProp: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
    setEditingProperty(null);
    await saveProperty(updatedProp, currentUser?.uid);
  };

  const handleValidateRent = async (rentId: string) => {
    const paidDate = new Date().toLocaleDateString('fr-FR');
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status: 'PAID', paidDate } : r));
    await updateRentStatus(rentId, 'PAID', paidDate, currentUser?.uid);

    // Auto trigger PDF receipt download
    const targetRent = rents.find(r => r.id === rentId);
    if (targetRent && activeProperty) {
      generateQuittancePDF(activeProperty, { ...targetRent, status: 'PAID', paidDate });
    }
  };

  const handleRejectRent = async (rentId: string) => {
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status: 'LATE_J10' } : r));
    await updateRentStatus(rentId, 'LATE_J10', undefined, currentUser?.uid);
    const target = rents.find(r => r.id === rentId);
    if (target && activeProperty) {
      setReminderTarget({ property: activeProperty, rent: { ...target, status: 'LATE_J10' } });
    }
  };

  const handleSetLateStatus = async (rentId: string, status: PaymentStatus) => {
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status } : r));
    await updateRentStatus(rentId, status, undefined, currentUser?.uid);
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
    await addRentRecord(newRecord, currentUser?.uid);
    alert(`Appel de loyer créé pour ${monthName} ${year} (${newRecord.total} €).`);
  };

  const handleApplyNewIrlRent = async (
    propertyId: string, 
    newRentExcl: number, 
    newQuarter: string, 
    newIndex: number,
    revisionDate?: string
  ) => {
    const today = revisionDate || new Date().toISOString().split('T')[0];
    setProperties(prev => prev.map(p => {
      if (p.id === propertyId) {
        const updated: Property = { 
          ...p, 
          rentExcl: newRentExcl, 
          irlBaseQuarter: newQuarter, 
          irlBaseValue: newIndex,
          irlQuarter: newQuarter,
          irlIndex: newIndex,
          lastRevisionDate: today
        };
        saveProperty(updated, currentUser?.uid);
        return updated;
      }
      return p;
    }));
  };

  const handleAddExpense = async (expense: ExpenseRecord) => {
    setExpenses(prev => [expense, ...prev]);
    await saveExpense(expense, currentUser?.uid);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    await deleteExpenseFromDb(expenseId, currentUser?.uid);
  };

  const handlePurgeData = async () => {
    try {
      localStorage.removeItem('dryos_local_properties');
      localStorage.removeItem('dryos_local_rents');
      localStorage.removeItem('dryos_local_expenses');
      localStorage.removeItem('dryos_active_property_id');
      setProperties([]);
      setRents([]);
      setExpenses([]);
      setActivePropertyId(null);
      alert("Toutes vos données personnelles ont été supprimées définitivement conformément au RGPD.");
    } catch (err) {
      console.error("Purge error:", err);
    }
  };

  // Current rent for active property
  const currentRent = rents.find(r => r.propertyId === activeProperty?.id && r.month === 'Mars' && r.year === 2025)
    || rents.find(r => r.propertyId === activeProperty?.id);

  if (loading && !authInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-navy">Initialisation de Mon Assist'Gestion...</p>
        </div>
      </div>
    );
  }

  // Showcase & Download Landing Page (gestion.dryos.fr /) - strictly inaccessible if installed or authenticated
  if (currentRoute === 'landing' && !isDeviceStandalone && !currentUser) {
    return (
      <>
        <LandingPage
          onNavigateToApp={() => navigateTo('app')}
          onInstallClick={() => {
            if (pwa.isInstallable) {
              pwa.triggerInstall();
            } else {
              pwa.setShowInstallModal(true);
            }
          }}
          canInstall={pwa.isInstallable}
          isInstalled={isDeviceStandalone}
          onOpenAgencyContact={() => setShowAgencyModal(true)}
        />

        {/* Modal Dryos Agency */}
        {showAgencyModal && (
          <DryosAgencyModal onClose={() => setShowAgencyModal(false)} />
        )}

        {/* Modal Installation PWA */}
        <InstallAppModal
          isOpen={pwa.showInstallModal}
          onClose={() => pwa.setShowInstallModal(false)}
          onInstall={pwa.triggerInstall}
          isInstallable={pwa.isInstallable}
          isIos={pwa.isIos}
          isStandalone={isDeviceStandalone}
        />
      </>
    );
  }

  return (
    <PrivacyProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-navy selection:text-white">
        {/* Top Header */}
        <Header
          onOpenAgencyContact={() => setShowAgencyModal(true)}
          onAddProperty={() => setShowOnboarding(true)}
          onDownloadAppClick={() => pwa.setShowInstallModal(true)}
          onNavigateToLanding={() => isDeviceStandalone ? setActiveTab('ACTIONS') : navigateTo('landing')}
          onResetToAppHome={() => {
            setIsAdminView(false);
            setPreviewingClient(null);
            setActiveTab('ACTIONS');
          }}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onOpenSecurity={() => setShowSecurityModal(true)}
          currentUser={currentUser}
          firebaseConnected={firebaseConnected}
          totalProperties={displayedProperties.length}
          isStandalone={isDeviceStandalone}
          isAdmin={isAdmin}
          isAdminViewActive={isAdminView}
          onToggleAdmin={() => {
            setPreviewingClient(null);
            setIsAdminView(prev => !prev);
          }}
          onLoadTestData={handleLoadTestData}
          onClearTestData={handleClearTestData}
        />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 sm:pb-8 space-y-4 sm:space-y-6">

        {/* Client Impersonation / Preview Top Banner */}
        {previewingClient && (
          <div className="bg-navy-900 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-3xl shadow-lg border border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-emerald-light shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-light">
                    Mode Consultation Compte Client
                  </span>
                  <span className="text-[10px] font-extrabold bg-navy-800 text-slate-200 px-2 py-0.5 rounded-md border border-navy-700">
                    {previewingClient.mandateType === 'MISE_EN_LOCATION' ? 'Mise en location DRYOS' : previewingClient.mandateType === 'GESTION_COMPLETE' ? 'Gestion Sérénité' : 'Autonome'}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {previewingClient.fullName} <span className="text-xs font-normal text-slate-300">({previewingClient.email})</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPreviewingClient(null);
                setIsAdminView(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-navy font-extrabold text-xs shadow-md transition cursor-pointer flex items-center space-x-2 self-start sm:self-auto"
            >
              <span>← Revenir à la console admin</span>
            </button>
          </div>
        )}

        {/* Admin Personal Workspace Top Banner */}
        {isAdmin && !previewingClient && !isAdminView && (
          <div className="bg-navy-800 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-sm border border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start sm:items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-brand shrink-0 animate-ping mt-1 sm:mt-0" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black uppercase tracking-wider text-emerald-light text-xs">
                    Mon Espace Bailleur Personnel • Dimitri Blanc
                  </span>
                  <span className="text-[10px] bg-navy-900 text-slate-200 px-2 py-0.5 rounded-md font-bold border border-navy-700">
                    {properties.length} lot{properties.length > 1 ? 's' : ''} actif{properties.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Vous êtes sur votre espace bailleur dédié. Vous pouvez tester librement baux, quittances, impayés, régularisations et IRL.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="btn-banner-load-test-data"
                onClick={handleLoadTestData}
                className="px-3 py-1.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-white font-bold text-xs transition cursor-pointer border border-navy-600 flex items-center space-x-1.5 shadow-2xs"
                title="Charger 3 biens de test complets (à jour, impayé, passoire DPE)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-light" />
                <span>Charger 3 tests</span>
              </button>

              {properties.length > 0 && (
                <button
                  id="btn-banner-clear-test-data"
                  onClick={handleClearTestData}
                  className="px-2.5 py-1.5 rounded-xl bg-status-urgent-bg hover:bg-red-100 text-status-urgent-text font-bold text-xs transition cursor-pointer border border-status-urgent-border"
                  title="Vider les biens de mon compte personnel"
                >
                  Vider
                </button>
              )}

              <button
                id="btn-banner-back-to-admin"
                onClick={() => setIsAdminView(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-navy font-black text-xs shadow-sm transition cursor-pointer flex items-center space-x-1.5"
              >
                <span>Console Agence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* If Admin Console is activated */}
        {isAdminView ? (
          <AdminConsole
            onSelectClientToView={(account) => {
              setPreviewingClient(account);
              setIsAdminView(false);
              if (account.properties && account.properties.length > 0) {
                setActivePropertyId(account.properties[0].id);
              }
            }}
            onExitAdmin={() => setIsAdminView(false)}
            adminEmail={currentUser?.email || 'dimitri.blanc@dryos.fr'}
            onLoadTestData={handleLoadTestData}
            onClearTestData={handleClearTestData}
            personalPropertiesCount={properties.length}
          />
        ) : (
          <>
            {/* The Standout "Télécharger l'app ici" Hero Banner */}
            <InstallHeroBanner
              onOpenInstallModal={() => pwa.setShowInstallModal(true)}
              onTriggerInstall={pwa.triggerInstall}
              isInstallable={pwa.isInstallable}
              isStandalone={isDeviceStandalone}
              isIos={pwa.isIos}
            />

            {/* Not Logged In: Show Clean Client Login Invitation */}
            {!currentUser && !previewingClient && (
              <div className="max-w-xl mx-auto my-10 p-6 sm:p-10 bg-white rounded-3xl border border-slate-200/90 shadow-sm text-center">
                <div className="flex justify-center mb-5">
                  <AppLogo className="h-16 w-auto object-contain" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-navy tracking-tight mb-2">
                  Connectez-vous à votre espace
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Accédez à votre espace gestionnaire pour administrer vos biens immobiliers et suivre vos loyers en temps réel.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    id="btn-gate-google-login"
                    onClick={() => setShowAuthModal(true)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-navy hover:bg-navy-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Accéder à mon compte</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Logged in with 0 properties: Display Welcoming Empty State */}
            {currentUser && !previewingClient && displayedProperties.length === 0 && (
              <EmptyPortfolioState
                userName={currentUser.displayName || currentUser.email}
                onAddFirstProperty={() => setShowOnboarding(true)}
                isAdmin={isAdmin}
                onLoadTestData={handleLoadTestData}
              />
            )}

            {/* If properties exist: Display selector and content */}
            {displayedProperties.length > 0 && activeProperty && (
              <>
                {/* Active Property Selector (cached in localStorage) */}
                <PropertySelector
                  properties={displayedProperties}
                  activeProperty={activeProperty}
                  onSelectProperty={handleSelectProperty}
                  onOpenOnboarding={() => setShowOnboarding(true)}
                  onEditProperty={(prop) => setEditingProperty(prop)}
                />

                {/* Smartphone Push & Proactive Alert Banner */}
                <NotificationBanner properties={displayedProperties} rents={displayedRents} />

            {/* Sub-Navigation Tabs (DESKTOP ONLY: On mobile, bottom navigation is used) */}
            <div className="hidden sm:block border-b border-slate-200/80 bg-white rounded-2xl shadow-xs px-2 pt-2">
              <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1">
                <button
                  id="tab-actions-feed"
                  onClick={() => setActiveTab('ACTIONS')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'ACTIONS'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-light" />
                  <span>Flux d'actions (Accueil)</span>
                </button>

                <button
                  id="tab-rents-section"
                  onClick={() => setActiveTab('RENTS')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'RENTS'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-emerald-light" />
                  <span>Loyers & Impayés</span>
                </button>

                <button
                  id="tab-vault-section"
                  onClick={() => setActiveTab('VAULT')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'VAULT'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FolderLock className="w-4 h-4 text-emerald-light" />
                  <span>Dossiers & Coffre-fort</span>
                </button>

                <button
                  id="tab-legal-section"
                  onClick={() => setActiveTab('LEGAL')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'LEGAL'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-4 h-4 text-emerald-light" />
                  <span>Rappels Légaux & IRL</span>
                </button>

                <button
                  id="tab-finance-section"
                  onClick={() => setActiveTab('FINANCE')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'FINANCE'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Euro className="w-4 h-4 text-emerald-light" />
                  <span>Bilan Fiscal & Dépenses</span>
                </button>

                <button
                  id="tab-exit-section"
                  onClick={() => setActiveTab('EXIT')}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                    activeTab === 'EXIT'
                      ? 'bg-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LogOut className="w-4 h-4 text-emerald-light" />
                  <span>Sortie Locataire & Relouer</span>
                </button>
              </nav>
            </div>

            {/* View 1: Flux d'actions */}
            {activeTab === 'ACTIONS' && (
              <div className="space-y-4 sm:space-y-6">
                <ActionFeed
                  property={activeProperty}
                  currentRent={currentRent}
                  onValidateRent={handleValidateRent}
                  onRejectRent={handleRejectRent}
                  onOpenReminderModal={(p, r) => setReminderTarget({ property: p, rent: r })}
                  onGenerateLrar={(p, r) => generateLrarMiseEnDemeure(p, r)}
                  onOpenIrlModal={(p) => setSelectedIrlProperty(p)}
                  onOpenChargesModal={(p) => setSelectedChargesProperty(p)}
                  onOpenVaultModal={() => setActiveTab('VAULT')}
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
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      <MaskedValue value={activeProperty.tenantName} />
                    </h4>
                    <p className="text-xs text-slate-500">
                      <MaskedValue value={activeProperty.tenantPhone} /> • <MaskedValue value={activeProperty.tenantEmail} />
                    </p>
                    <div className="pt-2 text-xs font-semibold text-navy">
                      Garantie : {activeProperty.gliProvider || 'Visale'}
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Bail & Loyer</span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      <MaskedValue value={`${activeProperty.rentExcl + activeProperty.charges} € / mois`} />
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
                        activeProperty.dpeRating === 'F' || activeProperty.dpeRating === 'G' ? 'bg-status-urgent' : 'bg-status-ok'
                      }`}>
                        {activeProperty.dpeRating}
                      </span>
                      <span className="text-xs text-slate-600">
                        {activeProperty.dpeRating === 'F' || activeProperty.dpeRating === 'G' 
                          ? 'Passoire thermique (Audit obligatoire)' 
                          : 'Conforme aux normes énergétiques'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Loyers & Impayés */}
            {activeTab === 'RENTS' && (
              <RentSection
                property={activeProperty}
                rents={displayedRents}
                onValidateRent={handleValidateRent}
                onRejectRent={handleRejectRent}
                onSetLateStatus={handleSetLateStatus}
                onGenerateNextMonth={handleGenerateNextMonth}
                onOpenAgencyContact={() => setShowAgencyModal(true)}
              />
            )}

            {/* View 3: Rappels Légaux & IRL */}
            {activeTab === 'LEGAL' && (
              <LegalRemindersSection
                property={activeProperty}
                onOpenIrlModal={() => setSelectedIrlProperty(activeProperty)}
                onOpenChargesModal={(p) => setSelectedChargesProperty(p)}
                onOpenVaultModal={() => setActiveTab('VAULT')}
                onOpenDryosContact={() => setShowAgencyModal(true)}
              />
            )}

            {/* View 4: Bilan Fiscal & Dépenses Déductibles */}
            {activeTab === 'FINANCE' && (
              <FinanceSection
                property={activeProperty}
                rents={displayedRents}
                expenses={displayedExpenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {/* View 5: Sortie Locataire & Relouer (Dryos) */}
            {activeTab === 'EXIT' && (
              <TenantExitSection
                property={activeProperty}
                onOpenDryosModal={() => setShowAgencyModal(true)}
              />
            )}

            {/* View 6: Dossiers & Coffre-fort numérique */}
            {activeTab === 'VAULT' && (
              <VaultSection
                property={activeProperty}
                onUpdateProperty={handleUpdateProperty}
                onOpenChargesRegulModal={() => setSelectedChargesProperty(activeProperty)}
                onOpenIrlModal={() => setSelectedIrlProperty(activeProperty)}
              />
            )}
          </>
        )}
      </>
    )}

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />

      {/* Modals */}
      {(showOnboarding || editingProperty) && (
        <OnboardingTunnel
          initialProperty={editingProperty}
          onClose={() => {
            setShowOnboarding(false);
            setEditingProperty(null);
          }}
          onComplete={(prop) => {
            if (editingProperty) {
              handleUpdateProperty(prop);
            } else {
              handleCompleteOnboarding(prop);
            }
          }}
        />
      )}

      {showAgencyModal && (
        <DryosAgencyModal
          properties={displayedProperties}
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

      {selectedChargesProperty && (
        <ChargesRegulModal
          property={selectedChargesProperty}
          isOpen={Boolean(selectedChargesProperty)}
          onClose={() => setSelectedChargesProperty(null)}
          onSaveRegul={(updated) => {
            handleUpdateProperty(updated);
            setSelectedChargesProperty(null);
          }}
        />
      )}

      {selectedVaultProperty && (
        <VaultModal
          property={selectedVaultProperty}
          isOpen={Boolean(selectedVaultProperty)}
          onClose={() => setSelectedVaultProperty(null)}
          onUpdateProperty={(updated) => {
            handleUpdateProperty(updated);
          }}
        />
      )}

      {/* PWA Install & QR Code Modal */}
      <InstallAppModal
        isOpen={pwa.showInstallModal}
        onClose={() => pwa.setShowInstallModal(false)}
        onInstall={pwa.triggerInstall}
        isInstallable={pwa.isInstallable}
        isIos={pwa.isIos}
        isStandalone={isDeviceStandalone}
      />

      {/* Security & RGPD Modal */}
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        currentUser={currentUser}
        properties={displayedProperties}
        rents={displayedRents}
        expenses={displayedExpenses}
        onPurgeData={handlePurgeData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12 pb-24 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
            <span className="font-black text-navy">MON ASSIST'GESTION</span>
            <span className="hidden sm:inline">•</span>
            <span>DRYOS Immobilier</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-slate-500">Espace de gestion locative pour bailleurs</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Agency Admin Access Shortcut */}
            <button
              id="btn-footer-admin-toggle"
              onClick={() => {
                if (!currentUser) {
                  setShowAuthModal(true);
                } else {
                  setPreviewingClient(null);
                  setIsAdminView(prev => !prev);
                }
              }}
              className="text-navy hover:text-navy-900 font-bold flex items-center space-x-1 cursor-pointer bg-navy-50 hover:bg-navy-100 px-2.5 py-1 rounded-lg border border-navy-200"
              title="Console réservée agence DRYOS (dimitri.blanc@dryos.fr)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
              <span>Accès Agence DRYOS</span>
            </button>

            <button
              onClick={() => setShowSecurityModal(true)}
              className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-brand" />
              <span>Confidentialité & Sécurité</span>
            </button>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <button
              onClick={() => setShowAgencyModal(true)}
              className="font-bold text-navy hover:underline cursor-pointer"
            >
              Contact agence DRYOS
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Smartphone First) - Only when properties exist and not in admin console */}
      {displayedProperties.length > 0 && !isAdminView && (
        <nav 
          id="mobile-bottom-nav"
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 pb-5 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        >
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'ACTIONS' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'ACTIONS' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Actions</span>
          </button>

          <button
            onClick={() => setActiveTab('RENTS')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'RENTS' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Receipt className={`w-4 h-4 ${activeTab === 'RENTS' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Loyers</span>
          </button>

          <button
            onClick={() => setActiveTab('VAULT')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'VAULT' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <FolderLock className={`w-4 h-4 ${activeTab === 'VAULT' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Dossiers</span>
          </button>

          <button
            onClick={() => setActiveTab('LEGAL')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'LEGAL' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Scale className={`w-4 h-4 ${activeTab === 'LEGAL' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Légal</span>
          </button>

          <button
            onClick={() => setActiveTab('FINANCE')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'FINANCE' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Euro className={`w-4 h-4 ${activeTab === 'FINANCE' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Bilan</span>
          </button>

          <button
            onClick={() => setActiveTab('EXIT')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition cursor-pointer active:scale-95 ${
              activeTab === 'EXIT' ? 'bg-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <LogOut className={`w-4 h-4 ${activeTab === 'EXIT' ? 'text-emerald-light' : 'text-slate-400'}`} />
            <span className="text-[9px] mt-0.5 font-medium">Sortie</span>
          </button>
        </nav>
      )}
    </div>
    </PrivacyProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Euro, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  FolderLock,
  Calendar,
  Layers,
  HelpCircle,
  MessageSquare,
  User as UserIcon
} from 'lucide-react';
import { LandlordAccount, DryosSupportTicket, Property } from '../types';
import { 
  getLandlordAccounts, 
  deleteLandlordAccount, 
  getAgencyTickets, 
  updateAgencyTicketStatus 
} from '../services/adminService';
import { AccountSetupModal } from './AccountSetupModal';

interface AdminConsoleProps {
  onSelectClientToView: (account: LandlordAccount) => void;
  onExitAdmin: () => void;
  adminEmail: string;
  onLoadTestData?: () => void;
  onClearTestData?: () => void;
  personalPropertiesCount?: number;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  onSelectClientToView,
  onExitAdmin,
  adminEmail,
  onLoadTestData,
  onClearTestData,
  personalPropertiesCount = 0
}) => {
  const [accounts, setAccounts] = useState<LandlordAccount[]>([]);
  const [tickets, setTickets] = useState<DryosSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mandateFilter, setMandateFilter] = useState<'ALL' | 'MISE_EN_LOCATION' | 'GESTION_COMPLETE' | 'AUTONOME'>('ALL');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'ACCOUNTS' | 'TICKETS'>('ACCOUNTS');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, tix] = await Promise.all([
        getLandlordAccounts(),
        getAgencyTickets()
      ]);
      setAccounts(accs);
      setTickets(tix);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression du compte de ${name} ?`)) {
      await deleteLandlordAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: DryosSupportTicket['status']) => {
    await updateAgencyTicketStatus(ticketId, status);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  // KPIs
  const totalLandlords = accounts.length;
  const totalProperties = accounts.reduce((acc, a) => acc + (a.properties?.length || 0), 0);
  const totalMonthlyRents = accounts.reduce((acc, a) => {
    const propsSum = (a.properties || []).reduce((pAcc, p) => pAcc + (p.rentExcl + p.charges), 0);
    return acc + propsSum;
  }, 0);
  const openTicketsCount = tickets.filter(t => t.status === 'OUVERT' || t.status === 'EN_COURS').length;

  const filteredAccounts = accounts.filter(a => {
    const matchesSearch = 
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.properties && a.properties.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.city?.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesMandate = mandateFilter === 'ALL' || a.mandateType === mandateFilter;

    return matchesSearch && matchesMandate;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#002f35] to-[#00434A] rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-teal-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Console Super-Admin Agence DRYOS</span>
            <span className="text-teal-400/60">•</span>
            <span className="font-mono text-white">{adminEmail}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestion du Parc & Bailleurs DRYOS
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 max-w-xl">
            Pilotez les comptes de vos propriétaires, mettez en place les nouveaux baux suite à une mise en location, et suivez les demandes d'assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-admin-setup-account"
            onClick={() => setShowSetupModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#00434A] font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#00434A]" />
            <span>Mettre en place un compte client</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Vue bailleur personnel
          </button>
        </div>
      </div>

      {/* Admin Personal Account Card (Dimitri Blanc) */}
      <div className="bg-gradient-to-r from-teal-900 via-[#00434A] to-[#00343a] rounded-2xl p-4 sm:p-5 text-white border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-start sm:items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-teal-200 shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                Mon Espace Personnel (Mode Test & Gestion)
              </span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-300/30 font-bold">
                {personalPropertiesCount} lot{personalPropertiesCount > 1 ? 's' : ''} dans mon espace
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-teal-100/90 mt-0.5">
              Votre espace bailleur privé ({adminEmail}) pour tester quittances, IRL, impayés, ou administrer vos propres investissements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onLoadTestData && (
            <button
              id="btn-admin-load-test-data"
              onClick={onLoadTestData}
              className="px-3.5 py-2 rounded-xl bg-teal-800/90 hover:bg-teal-700 text-teal-100 font-bold text-xs border border-teal-500/40 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
              title="Charger 3 biens de test complets dans mon espace perso"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Charger jeux de test</span>
            </button>
          )}

          {onClearTestData && personalPropertiesCount > 0 && (
            <button
              id="btn-admin-clear-test-data"
              onClick={onClearTestData}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-200 font-bold text-xs border border-rose-800/40 transition cursor-pointer"
              title="Vider les biens de mon compte personnel"
            >
              Vider mes tests
            </button>
          )}

          <button
            id="btn-admin-open-personal-account"
            onClick={onExitAdmin}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#00434A] font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5"
          >
            <span>Accéder à mon espace perso</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Agency KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bailleurs suivis</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#00434A]">
            {totalLandlords}
          </div>
          <span className="text-[11px] text-slate-500 block">Comptes configurés</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Lots en gestion</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {totalProperties}
          </div>
          <span className="text-[11px] text-slate-500 block">Biens immobiliers actifs</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Volume Loyers</span>
            <Euro className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {totalMonthlyRents.toLocaleString('fr-FR')} €
          </div>
          <span className="text-[11px] text-slate-500 block">Flux mensuel géré</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Demandes bailleurs</span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {openTicketsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">À traiter ou en cours</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedTab('ACCOUNTS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center space-x-2 ${
            selectedTab === 'ACCOUNTS'
              ? 'bg-[#00434A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Comptes Bailleurs ({accounts.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('TICKETS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center space-x-2 ${
            selectedTab === 'TICKETS'
              ? 'bg-[#00434A] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Demandes & Assistance ({tickets.length})</span>
          {openTicketsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
              {openTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACCOUNTS LIST */}
      {selectedTab === 'ACCOUNTS' && (
        <div className="space-y-4">
          
          {/* Search & Mandate Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, bien..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#00434A] focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Mandat :</span>
              <button
                onClick={() => setMandateFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  mandateFilter === 'ALL' ? 'bg-[#00434A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setMandateFilter('MISE_EN_LOCATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mandateFilter === 'MISE_EN_LOCATION' ? 'bg-[#00434A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Mise en location DRYOS
              </button>
              <button
                onClick={() => setMandateFilter('GESTION_COMPLETE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mandateFilter === 'GESTION_COMPLETE' ? 'bg-[#00434A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Gestion Complète
              </button>
              <button
                onClick={() => setMandateFilter('AUTONOME')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  mandateFilter === 'AUTONOME' ? 'bg-[#00434A] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Autonome
              </button>
            </div>
          </div>

          {/* Accounts List */}
          {filteredAccounts.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">Aucun compte bailleur trouvé</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchTerm ? 'Aucun résultat ne correspond à votre recherche.' : 'Commencez par mettre en place le premier compte client suite à une mise en location.'}
              </p>
              <button
                onClick={() => setShowSetupModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#00434A] text-white text-xs font-bold cursor-pointer"
              >
                + Mettre en place un compte
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map(account => {
                const primaryProp = account.properties?.[0];
                const totalRent = (account.properties || []).reduce((acc, p) => acc + p.rentExcl + p.charges, 0);

                return (
                  <div 
                    key={account.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#00434A]/30 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-slate-900">{account.fullName}</h4>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            account.mandateType === 'MISE_EN_LOCATION' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                            account.mandateType === 'GESTION_COMPLETE' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {account.mandateType === 'MISE_EN_LOCATION' ? 'Mise en location DRYOS' :
                             account.mandateType === 'GESTION_COMPLETE' ? 'Gestion Complète DRYOS' : 'Autonome'}
                          </span>
                          {account.configuredByAdmin && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Configuré par l'agence
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{account.email}</span>
                          </span>
                          {account.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{account.phone}</span>
                            </span>
                          )}
                          <span>• Créé le {new Date(account.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectClientToView(account)}
                          className="px-3.5 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          title="Prévisualiser ce compte comme le verrait le client"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir le compte</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(account.id, account.fullName)}
                          className="w-9 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                          title="Supprimer ce compte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Property Summary Bar */}
                    {primaryProp && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-[#00434A]" />
                          <span className="font-bold text-slate-800">{primaryProp.name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">Locataire : <strong>{primaryProp.tenantName}</strong></span>
                        </div>

                        <div className="flex items-center space-x-3 text-slate-600">
                          <span>Bail {primaryProp.leaseType}</span>
                          <span>•</span>
                          <span className="font-bold text-[#00434A]">{primaryProp.rentExcl + primaryProp.charges} € / mois</span>
                          <span>•</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] text-white ${primaryProp.dpeRating === 'F' || primaryProp.dpeRating === 'G' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                            DPE {primaryProp.dpeRating}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS & MANDATE LEADS */}
      {selectedTab === 'TICKETS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Demandes directes reçues des propriétaires
            </span>
            <span className="text-xs text-slate-500">
              {tickets.length} demande{tickets.length > 1 ? 's' : ''} au total
            </span>
          </div>

          <div className="space-y-3">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ticket.status === 'OUVERT' ? 'bg-rose-100 text-rose-800' :
                        ticket.status === 'EN_COURS' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ticket.status === 'OUVERT' ? 'À traiter' : ticket.status === 'EN_COURS' ? 'En cours' : 'Traité'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                    </div>

                    <p className="text-xs text-slate-500">
                      De : <strong>{ticket.userName || ticket.userEmail}</strong> • Bien : {ticket.propertyName || 'Non spécifié'} • Reçu le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={ticket.status}
                    onChange={e => handleTicketStatusChange(ticket.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none bg-white"
                  >
                    <option value="OUVERT">Marquer À traiter</option>
                    <option value="EN_COURS">Marquer En cours</option>
                    <option value="CLOS">Marquer Traité / Résolu</option>
                  </select>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  "{ticket.message}"
                </p>

                {ticket.contactPhone && (
                  <div className="flex items-center space-x-3 text-xs">
                    <a
                      href={`tel:${ticket.contactPhone}`}
                      className="text-[#00434A] font-bold hover:underline flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Rappeler le client : {ticket.contactPhone}</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turnkey Account Setup Modal */}
      <AccountSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onAccountCreated={(newAcc) => {
          setAccounts(prev => [newAcc, ...prev]);
        }}
      />

    </div>
  );
};

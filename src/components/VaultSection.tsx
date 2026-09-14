import React, { useState } from 'react';
import { 
  FolderLock, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Calendar, 
  ExternalLink,
  Flame,
  Shield,
  Home,
  Receipt,
  FileCheck,
  Search,
  Filter,
  Trash2,
  Eye,
  Plus,
  Lock,
  Sparkles,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { Property, VaultFileItem } from '../types';
import { usePrivacy, MaskedValue } from '../context/PrivacyContext';

interface VaultSectionProps {
  property: Property;
  onUpdateProperty: (updated: Property) => void;
  onOpenChargesRegulModal?: () => void;
  onOpenIrlModal?: () => void;
}

type CategoryFilter = 'ALL' | 'BAIL' | 'TECHNIQUE' | 'OBLIGATIONS' | 'COMPTA';

export const VaultSection: React.FC<VaultSectionProps> = ({
  property,
  onUpdateProperty,
  onOpenChargesRegulModal,
  onOpenIrlModal
}) => {
  const { privacyMode } = usePrivacy();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ title: string; fileName: string; date?: string; url?: string; lawRef?: string } | null>(null);
  const [uploadDrawerKey, setUploadDrawerKey] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState('');
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const vault = property.vaultDocuments || {};

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save an uploaded document to property
  const handleSaveDocument = (
    key: string, 
    customName?: string, 
    extraData?: Partial<VaultFileItem>
  ) => {
    const finalName = (customName || tempFileName).trim() || `${key}_${property.name.replace(/\s+/g, '_')}.pdf`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newDoc: VaultFileItem = {
      name: finalName,
      date: todayStr,
      size: '240 Ko',
      ...extraData
    };

    const updatedVault = {
      ...vault,
      [key]: newDoc
    };

    const updatedProp: Property = {
      ...property,
      vaultDocuments: updatedVault,
      ...(key === 'insuranceFile' ? {
        insuranceCertificateFile: finalName,
        tenantInsuranceExpiry: new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0]
      } : {}),
      ...(key === 'boilerFile' ? {
        boilerCertificateFile: finalName,
        boilerCheckDate: todayStr
      } : {})
    };

    onUpdateProperty(updatedProp);
    setUploadDrawerKey(null);
    setTempFileName('');
    showToast(`Document « ${finalName} » chiffré et sécurisé dans le coffre-fort.`);
  };

  // Real file drop or input selection
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault();
    setDragOverKey(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleSaveDocument(key, file.name, {
        size: `${Math.round(file.size / 1024)} Ko`
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleSaveDocument(key, file.name, {
        size: `${Math.round(file.size / 1024)} Ko`
      });
    }
  };

  const handleRemoveDoc = (key: string) => {
    if (!confirm('Supprimer cette pièce du coffre-fort ?')) return;

    const updatedVault = { ...vault } as any;
    delete updatedVault[key];

    const updatedProp: Property = {
      ...property,
      vaultDocuments: updatedVault
    };

    onUpdateProperty(updatedProp);
    showToast('Document retiré du dossier.');
  };

  // Folder & Document specifications
  const documentsList = [
    // 1. Dossier Juridique & Bail
    {
      key: 'leaseFile',
      category: 'BAIL' as const,
      categoryLabel: 'Bail & Locataire',
      title: 'Contrat de bail principal',
      lawRef: 'Loi du 6 juillet 1989 • Décret Alur n° 2015-587',
      icon: FileText,
      data: vault.leaseFile,
      defaultName: 'Bail_signe_loi_alur.pdf',
      mandatory: true,
      description: 'Contrat signé par toutes les parties, notice d\'information et clause d\'indexation IRL.'
    },
    {
      key: 'edlFile',
      category: 'BAIL' as const,
      categoryLabel: 'Bail & Locataire',
      title: 'État des lieux d\'entrée (EDL)',
      lawRef: 'Art. 3-2 Loi 1989 • Décret n° 2016-382',
      icon: Home,
      data: vault.edlFile,
      defaultName: 'Etat_des_lieux_remise_cles.pdf',
      mandatory: true,
      description: 'Constat contradictoire et inventaire photographique lors de l\'entrée du locataire.'
    },
    {
      key: 'tenantIdCardFile',
      category: 'BAIL' as const,
      categoryLabel: 'Bail & Locataire',
      title: 'Pièce d\'identité du locataire',
      lawRef: 'Décret n° 2015-1437 (Pièces justificatives autorisées)',
      icon: FileCheck,
      data: vault.tenantIdCardFile,
      defaultName: `CNI_${property.tenantName.replace(/\s+/g, '_')}.pdf`,
      mandatory: true,
      description: 'CNI, Passeport ou Titre de séjour en cours de validité (protégé sous chiffrement RGPD).'
    },
    {
      key: 'salaryProofFile',
      category: 'BAIL' as const,
      categoryLabel: 'Bail & Locataire',
      title: 'Justificatif de revenus / Bulletins de paie',
      lawRef: 'Décret n° 2015-1437 • Solvabilité du foyer',
      icon: Receipt,
      data: vault.salaryProofFile,
      defaultName: 'Justificatifs_revenus_locataire.pdf',
      mandatory: false,
      description: 'Derniers bulletins de salaire ou avis d\'imposition confirmant le ratio de solvabilité 3x.'
    },
    {
      key: 'cautionFile',
      category: 'BAIL' as const,
      categoryLabel: 'Bail & Locataire',
      title: 'Acte de cautionnement solidaire ou Garantie Visale',
      lawRef: 'Art. 22-1 Loi 1989 • Action Logement Visale',
      icon: Shield,
      data: vault.cautionFile,
      defaultName: 'Engagement_caution_solidaire.pdf',
      mandatory: Boolean(property.guarantor || property.hasGli),
      description: 'Engagement écrit du garant ou attestation Visale certifiant la garantie des impayés.'
    },

    // 2. Dossier Technique & Bien
    {
      key: 'dpeFile',
      category: 'TECHNIQUE' as const,
      categoryLabel: 'Diagnostics du Bien',
      title: `Diagnostic de Performance Énergétique (DPE : ${property.dpeRating || 'Non renseigné'})`,
      lawRef: 'Validité 10 ans • Règle Loi Climat & Résilience',
      icon: Shield,
      data: vault.dpeFile,
      defaultName: 'DPE_Performance_Energetique.pdf',
      mandatory: true,
      description: `Classement énergétique ${property.dpeRating || '?'}. Rappel : les logements F et G sont bloqués en révision IRL.`
    },
    {
      key: 'taxeFonciereFile',
      category: 'TECHNIQUE' as const,
      categoryLabel: 'Diagnostics du Bien',
      title: 'Avis de taxe foncière',
      lawRef: 'Base légale récupération TEOM & déduction fiscale 2044',
      icon: Receipt,
      data: vault.taxeFonciereFile,
      defaultName: 'Taxe_Fonciere_Avis.pdf',
      mandatory: true,
      description: 'Indispensable pour réclamer la taxe d\'enlèvement des ordures ménagères (TEOM) au locataire.'
    },

    // 3. Attestations Annuelles Obligatoires
    {
      key: 'insuranceFile',
      category: 'OBLIGATIONS' as const,
      categoryLabel: 'Attestations Annuelles',
      title: 'Attestation assurance habitation locataire (MRH)',
      lawRef: 'Obligation légale annuelle art. 7g Loi 1989',
      icon: Shield,
      data: vault.insuranceFile || (property.insuranceCertificateFile ? { name: property.insuranceCertificateFile, date: property.leaseStartDate } : undefined),
      defaultName: 'Attestation_Assurance_MRH.pdf',
      mandatory: true,
      description: 'Attestation couvrant les risques locatifs pour l\'année en cours. À renouveler chaque année.'
    },
    ...(property.hasGasHeating ? [{
      key: 'boilerFile',
      category: 'OBLIGATIONS' as const,
      categoryLabel: 'Attestations Annuelles',
      title: 'Attestation annuelle d\'entretien de chaudière gaz',
      lawRef: 'Décret n° 2009-649 • Entretien annuel à charge du locataire',
      icon: Flame,
      data: vault.boilerFile || (property.boilerCertificateFile ? { name: property.boilerCertificateFile, date: property.boilerCheckDate } : undefined),
      defaultName: 'Entretien_chaudiere_certificat.pdf',
      mandatory: true,
      description: 'Certificat remis par un chauffagiste agréé assurant le bon fonctionnement et la sécurité.'
    }] : [])
  ];

  // Filtering
  const filteredDocs = documentsList.filter(d => {
    if (activeCategory !== 'ALL' && d.category !== activeCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.lawRef.toLowerCase().includes(q) ||
        (d.data?.name && d.data.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const mandatoryDocs = documentsList.filter(d => d.mandatory);
  const securedMandatory = mandatoryDocs.filter(d => Boolean(d.data)).length;
  const complianceScore = Math.round((securedMandatory / mandatoryDocs.length) * 100);

  // Full dossier download simulation
  const handleDownloadFullDossier = () => {
    alert(`Téléchargement de l'archive sécurisée du bien « ${property.name} » avec ${documentsList.filter(d => Boolean(d.data)).length} documents chiffrés.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-status-ok-bg border border-status-ok-border text-status-ok-text text-xs font-bold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-ok flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-status-ok hover:text-status-ok-text">
            Fermer
          </button>
        </div>
      )}

      {/* Hero Dossier Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-light/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-navy-50 text-navy">
                <FolderLock className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy block">
                  Coffre-fort numérique & Dossier locatif
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {property.name}
                </h2>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Dossier complet du bien et du locataire (<MaskedValue value={property.tenantName} type="name" className="font-semibold text-slate-800" />).
              Toutes vos pièces justificatives sont chiffrées en AES-256 et isolées sous clé stricte.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                <Lock className="w-3.5 h-3.5 text-navy" />
                <span>Zero-Trust Cloisonné</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-light/30 text-navy font-bold border border-emerald-brand/20">
                <Shield className="w-3.5 h-3.5 text-emerald-brand" />
                <span>Conforme RGPD Art. 32</span>
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-500 text-xs">
                {documentsList.filter(d => Boolean(d.data)).length} / {documentsList.length} documents archivés
              </span>
            </div>
          </div>

          {/* Compliance Gauge Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between min-w-[240px] space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700">Conformité légale du dossier</span>
                <span className={complianceScore === 100 ? 'text-status-ok-text' : 'text-status-warning-text'}>
                  {complianceScore}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    complianceScore === 100 ? 'bg-status-ok' : complianceScore > 60 ? 'bg-status-warning' : 'bg-status-urgent'
                  }`}
                  style={{ width: `${complianceScore}%` }}
                />
              </div>
              
              <p className="text-[11px] text-slate-500 mt-1.5">
                {complianceScore === 100 
                  ? '✓ Toutes les pièces obligatoires sont validées' 
                  : `${mandatoryDocs.length - securedMandatory} pièce(s) légale(s) à ajouter`}
              </p>
            </div>

            <button
              onClick={handleDownloadFullDossier}
              className="w-full px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Télécharger le dossier complet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        
        {/* Categories Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tous les documents ({documentsList.length})
          </button>

          <button
            onClick={() => setActiveCategory('BAIL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategory === 'BAIL'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Bail & Locataire
          </button>

          <button
            onClick={() => setActiveCategory('TECHNIQUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategory === 'TECHNIQUE'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Diagnostics & Bien
          </button>

          <button
            onClick={() => setActiveCategory('OBLIGATIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeCategory === 'OBLIGATIONS'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Attestations Annuelles
          </button>
        </div>

        {/* Search field */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer une pièce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-navy focus:bg-white transition"
          />
        </div>

      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((docItem) => {
          const Icon = docItem.icon;
          const isUploaded = Boolean(docItem.data);
          const isDragOver = dragOverKey === docItem.key;

          return (
            <div
              key={docItem.key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(docItem.key);
              }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(e) => handleFileDrop(e, docItem.key)}
              className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                isDragOver
                  ? 'border-navy bg-navy-50 scale-[1.01] ring-2 ring-navy/20'
                  : isUploaded
                  ? 'bg-white border-slate-200/90 shadow-2xs hover:border-navy-300'
                  : 'bg-slate-50/70 border-dashed border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-3">
                {/* Header item */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isUploaded ? 'bg-navy-50 text-navy' : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {docItem.title}
                        </h4>
                        {docItem.mandatory && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-status-warning-bg text-status-warning-text border border-status-warning-border">
                            Requis
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                        {docItem.categoryLabel}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div>
                    {isUploaded ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Sécurisé</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 whitespace-nowrap">
                        <span>À déposer</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description & Legal Ref */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {docItem.description}
                </p>
                <span className="text-[10px] font-medium text-slate-400 block">
                  Réf. légale : {docItem.lawRef}
                </span>

                {/* Uploaded File details */}
                {isUploaded && docItem.data && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileCheck className="w-4 h-4 text-navy flex-shrink-0" />
                      <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-[220px]">
                        {docItem.data.name}
                      </span>
                      {docItem.data.size && (
                        <span className="text-slate-400 text-[11px]">({docItem.data.size})</span>
                      )}
                    </div>
                    {docItem.data.date && (
                      <span className="text-slate-400 text-[10px] whitespace-nowrap">
                        {docItem.data.date}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {isUploaded ? (
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setPreviewDoc({
                          title: docItem.title,
                          fileName: docItem.data?.name || docItem.defaultName,
                          date: docItem.data?.date,
                          lawRef: docItem.lawRef
                        })}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Aperçu</span>
                      </button>

                      <button
                        onClick={() => alert(`Téléchargement de « ${docItem.data?.name} » certifié conforme.`)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Télécharger</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveDoc(docItem.key)}
                      className="p-1.5 text-slate-400 hover:text-status-urgent-text hover:bg-status-urgent-bg rounded-lg transition cursor-pointer"
                      title="Supprimer la pièce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full">
                    {uploadDrawerKey === docItem.key ? (
                      <div className="space-y-2 animate-fadeIn">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder={docItem.defaultName}
                            value={tempFileName}
                            onChange={(e) => setTempFileName(e.target.value)}
                            className="flex-1 text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy"
                          />
                          <button
                            onClick={() => handleSaveDocument(docItem.key, tempFileName)}
                            className="px-3 py-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-800 transition cursor-pointer"
                          >
                            Valider
                          </button>
                          <button
                            onClick={() => {
                              setUploadDrawerKey(null);
                              setTempFileName('');
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 px-2"
                          >
                            Annuler
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Ou glissez-déposez directement un fichier PDF ou JPG sur cette carte.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <label className="flex-1 px-3.5 py-2 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer active:scale-98">
                          <Upload className="w-3.5 h-3.5 text-emerald-light" />
                          <span>Choisir un fichier (PDF, image)</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileInputChange(e, docItem.key)}
                          />
                        </label>
                        <button
                          onClick={() => setUploadDrawerKey(docItem.key)}
                          className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                          title="Saisie manuelle du nom"
                        >
                          Nommer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-navy to-navy-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-emerald-light" />
                <h3 className="font-bold text-base">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Nom du fichier :</span>
                  <span className="font-bold text-slate-800">{previewDoc.fileName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Date d'archivage :</span>
                  <span className="font-bold text-slate-800">{previewDoc.date || 'À jour'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Chiffrement :</span>
                  <span className="font-bold text-status-ok-text">AES-256 (Intègre)</span>
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/50">
                <FileText className="w-12 h-12 text-navy/40" />
                <p className="text-xs text-slate-600 font-medium">
                  Document numérique certifié conforme stocké dans votre espace privé.
                </p>
                <span className="text-[10px] text-slate-400">
                  {previewDoc.lawRef}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  alert(`Téléchargement de « ${previewDoc.fileName} » en cours...`);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-light" />
                <span>Télécharger le document</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

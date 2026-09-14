import React, { useState } from 'react';
import { Property } from '../types';
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  Calendar, 
  ExternalLink,
  Flame,
  Shield,
  Home,
  Receipt,
  FileCheck
} from 'lucide-react';

interface VaultModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProperty: (updated: Property) => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  property,
  isOpen,
  onClose,
  onUpdateProperty
}) => {
  if (!isOpen) return null;

  const [activeUploadDoc, setActiveUploadDoc] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const vault = property.vaultDocuments || {};

  const handleSimulateUpload = (key: 'leaseFile' | 'edlFile' | 'taxeFonciereFile' | 'dpeFile' | 'insuranceFile' | 'boilerFile', defaultTitle: string) => {
    const filename = tempFileName.trim() || `${defaultTitle}_${property.name.replace(/\s+/g, '_')}.pdf`;
    
    const updatedVault = {
      ...vault,
      [key]: {
        name: filename,
        date: new Date().toISOString().split('T')[0],
        ...(key === 'insuranceFile' ? { validUntil: new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0] } : {}),
        ...(key === 'dpeFile' ? { rating: property.dpeRating || 'D' } : {})
      }
    };

    const updatedProp: Property = {
      ...property,
      vaultDocuments: updatedVault,
      ...(key === 'insuranceFile' ? { 
        insuranceCertificateFile: filename,
        tenantInsuranceExpiry: new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0]
      } : {}),
      ...(key === 'boilerFile' ? {
        boilerCertificateFile: filename,
        boilerCheckDate: new Date().toISOString().split('T')[0]
      } : {})
    };

    onUpdateProperty(updatedProp);
    setActiveUploadDoc(null);
    setTempFileName('');
    setSuccessToast(`Document « ${filename} » enregistré dans votre coffre-fort.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRemoveDoc = (key: 'leaseFile' | 'edlFile' | 'taxeFonciereFile' | 'dpeFile' | 'insuranceFile' | 'boilerFile') => {
    if (!confirm('Supprimer ce document du coffre-fort numérique ?')) return;

    const updatedVault = { ...vault };
    delete updatedVault[key];

    const updatedProp: Property = {
      ...property,
      vaultDocuments: updatedVault
    };

    onUpdateProperty(updatedProp);
  };

  const docsConfig = [
    {
      key: 'leaseFile' as const,
      title: 'Contrat de bail signé',
      lawRef: 'Loi Alur / Loi du 6 juillet 1989',
      icon: FileText,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.leaseFile,
      defaultName: 'Bail_signe',
      description: 'Bail principal, annexes obligatoires et notice d\'information légale.'
    },
    {
      key: 'edlFile' as const,
      title: 'État des lieux d\'entrée (EDL)',
      lawRef: 'Art. 3-2 Loi 1989 • Décret n° 2016-382',
      icon: Home,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.edlFile,
      defaultName: 'Etat_des_lieux_entree',
      description: 'Inventaire contradictoire et photos certifiées lors de la remise des clés.'
    },
    {
      key: 'taxeFonciereFile' as const,
      title: 'Avis de taxe foncière',
      lawRef: 'Pour calcul TEOM récupérable & déduction fiscale',
      icon: Receipt,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.taxeFonciereFile,
      defaultName: 'Avis_taxe_fonciere',
      description: 'Justificatif officiel utile pour réclamer la taxe d\'ordures ménagères (TEOM) et pour votre 2044/LMNP.'
    },
    {
      key: 'dpeFile' as const,
      title: `Diagnostic de Performance Énergétique (DPE : ${property.dpeRating || 'Non renseigné'})`,
      lawRef: 'Obligation légale de validité 10 ans • Règle Loi Climat',
      icon: Shield,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.dpeFile,
      defaultName: 'Diagnostic_DPE',
      description: 'Certifie la classe énergétique et le respect du seuil de décence (audit pour F et G).'
    },
    {
      key: 'insuranceFile' as const,
      title: 'Attestation assurance habitation locataire (MRH)',
      lawRef: 'Obligation annuelle art. 7g Loi 1989',
      icon: ShieldCheck,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.insuranceFile || (property.insuranceCertificateFile ? { name: property.insuranceCertificateFile, validUntil: property.tenantInsuranceExpiry } : undefined),
      defaultName: 'Attestation_Assurance_MRH',
      description: 'Garantit les risques locatifs (incendie, dégât des eaux, explosion) pour l\'année en cours.'
    },
    ...(property.hasGasHeating ? [{
      key: 'boilerFile' as const,
      title: 'Attestation d\'entretien annuel de chaudière gaz',
      lawRef: 'Décret n° 2009-649 • Obligation annuelle à charge du locataire',
      icon: Flame,
      iconColor: 'text-navy',
      bgColor: 'bg-navy-50',
      data: vault.boilerFile || (property.boilerCertificateFile ? { name: property.boilerCertificateFile, date: property.boilerCheckDate } : undefined),
      defaultName: 'Entretien_chaudiere_gaz',
      description: 'Rapport annuel délivré par un professionnel certifié RGE/chauffagiste.'
    }] : [])
  ];

  const presentCount = docsConfig.filter(d => Boolean(d.data)).length;
  const totalCount = docsConfig.length;
  const isComplete = presentCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-navy to-navy-800 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-6 h-6 text-emerald-light" />
              <h3 className="font-black text-lg sm:text-xl tracking-tight">
                Coffre-fort numérique ultra-simple
              </h3>
            </div>
            <p className="text-xs text-navy-100">
              {property.name} • Les 5 documents vitaux accessibles en 2 secondes en cas de pépin
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status progress bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-status-ok' : 'bg-status-warning'}`} />
            <span className="text-xs font-bold text-slate-800">
              Complétude du dossier : {presentCount} / {totalCount} documents
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
            isComplete ? 'bg-status-ok-bg text-status-ok-text border border-status-ok-border' : 'bg-status-warning-bg text-status-warning-text border border-status-warning-border'
          }`}>
            {isComplete ? 'Dossier 100% sécurisé' : 'Documents manquants'}
          </span>
        </div>

        {successToast && (
          <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-status-ok-bg border border-status-ok-border text-status-ok-text text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-status-ok flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Content list */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {docsConfig.map((docItem) => {
            const Icon = docItem.icon;
            const isUploaded = Boolean(docItem.data);

            return (
              <div
                key={docItem.key}
                className={`p-4 rounded-xl border transition-all ${
                  isUploaded 
                    ? 'bg-white border-slate-200 shadow-2xs hover:border-navy-300' 
                    : 'bg-slate-50/70 border-dashed border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl ${docItem.bgColor} ${docItem.iconColor} flex-shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm">{docItem.title}</h4>
                        {isUploaded ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-ok-bg text-status-ok-text border border-status-ok-border">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sécurisé</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            <span>À ajouter</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{docItem.description}</p>
                      <span className="text-[10px] text-slate-400 block">{docItem.lawRef}</span>
                      
                      {isUploaded && docItem.data && (
                        <div className="pt-1 flex items-center space-x-2 text-xs font-semibold text-slate-700">
                          <FileCheck className="w-3.5 h-3.5 text-navy" />
                          <span className="truncate max-w-xs">{docItem.data.name}</span>
                          {docItem.data.date && (
                            <span className="text-slate-400 text-[10px]">(mis à jour le {docItem.data.date})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:self-center pl-10 sm:pl-0">
                    {isUploaded ? (
                      <>
                        <button
                          onClick={() => {
                            alert(`Ouverture du document « ${docItem.data?.name} » (archivé en haute sécurité dans votre coffre-fort numérique).`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                          title="Consulter"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Consulter</span>
                        </button>
                        <button
                          onClick={() => handleRemoveDoc(docItem.key)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-status-urgent-text hover:bg-status-urgent-bg transition cursor-pointer"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setActiveUploadDoc(docItem.key)}
                        className="px-3.5 py-1.5 rounded-lg bg-navy hover:bg-navy-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-98"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-light" />
                        <span>Déposer le PDF</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Upload Mini-Drawer */}
                {activeUploadDoc === docItem.key && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-lg space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Ajout rapide d'un document
                      </span>
                      <button
                        onClick={() => setActiveUploadDoc(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Annuler
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Ex : ${docItem.defaultName}.pdf`}
                        value={tempFileName}
                        onChange={(e) => setTempFileName(e.target.value)}
                        className="flex-1 text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy"
                      />
                      <button
                        onClick={() => handleSimulateUpload(docItem.key, docItem.defaultName)}
                        className="px-3.5 py-2 rounded-lg bg-emerald-brand hover:bg-emerald-dark text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        Enregistrer
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Vous pouvez également glisser-déposer votre fichier PDF ou prendre une photo nette depuis votre smartphone.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-brand flex-shrink-0" />
            <span>Coffre-fort conforme RGPD • Archivage certifié pour vos déclarations et contentieux</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Fermer le coffre-fort
          </button>
        </div>

      </div>
    </div>
  );
};

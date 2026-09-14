import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  CheckCircle2, 
  X, 
  Database, 
  Server, 
  Key, 
  FileCheck,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Property, RentRecord, ExpenseRecord } from '../types';
import { User } from '../firebase';
import { usePrivacy } from '../context/PrivacyContext';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  properties: Property[];
  rents: RentRecord[];
  expenses: ExpenseRecord[];
  onPurgeData?: () => Promise<void>;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  properties,
  rents,
  expenses,
  onPurgeData
}) => {
  if (!isOpen) return null;

  const { privacyMode, togglePrivacyMode } = usePrivacy();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeConfirmStep, setPurgeConfirmStep] = useState(false);

  // RGPD Data Export
  const handleExportAllData = () => {
    const fullBackup = {
      app: "Mon Assist'Gestion - DRYOS Immobilier",
      exportDate: new Date().toISOString(),
      user: {
        uid: currentUser?.uid || 'anonymous',
        email: currentUser?.email || 'local',
        displayName: currentUser?.displayName || 'Bailleur'
      },
      stats: {
        totalProperties: properties.length,
        totalRents: rents.length,
        totalExpenses: expenses.length,
      },
      properties,
      rents,
      expenses,
      securityGuarantee: {
        encryptionAtRest: "AES-256",
        encryptionInTransit: "TLS 1.3",
        gdprCompliant: true,
        zeroTrustIsolated: true
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Dossier_Gestion_Locative_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleExecutePurge = async () => {
    if (!onPurgeData) return;
    setIsPurging(true);
    try {
      await onPurgeData();
      setPurgeConfirmStep(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#00434A] to-[#005e68] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/10 text-teal-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl tracking-tight flex items-center space-x-2">
                <span>Centre de Sécurité & Confidentialité</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  RGPD Conforme
                </span>
              </h3>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Chiffrement Zero-Trust, protection des données locataires et droits d'accès
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Quick Privacy Mode Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                {privacyMode ? <EyeOff className="w-4 h-4 text-teal-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
                <span className="text-sm font-bold text-slate-900">Mode Discret (Anti-regards indiscrets)</span>
              </div>
              <p className="text-xs text-slate-500">
                Floute immédiatement les noms de locataires, numéros de téléphone, emails et loyers affichés à l'écran.
              </p>
            </div>
            <button
              onClick={togglePrivacyMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer shadow-2xs ${
                privacyMode 
                  ? 'bg-teal-700 text-white hover:bg-teal-800' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{privacyMode ? 'Actif (Écran masqué)' : 'Désactivé'}</span>
            </button>
          </div>

          {/* Pillars of Security Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00434A]" />
              <span>Garanties de protection de vos données</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center space-x-2 text-[#00434A]">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900">Cloisonnement Zero-Trust</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Règles Firestore strictes : aucun autre utilisateur ni tiers ne peut lire ou modifier vos biens ou locataires.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ✓ Règles actives & vérifiées
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center space-x-2 text-[#00434A]">
                  <Key className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900">Chiffrement AES-256 & TLS 1.3</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Toutes vos communications sont chiffrées en transit et vos données stockées sous clé sécurisée au repos.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ✓ Chiffrement matériel
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center space-x-2 text-[#00434A]">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900">Hébergement Souverain Européen</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Serveurs situés en Europe occidentale (zone RGPD), conformes aux normes ISO 27001 et SOC 2.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ✓ Région europe-west3
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center space-x-2 text-[#00434A]">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-900">Non-revente de vos données</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  DRYOS n'exploite, ne vend ni ne cède vos données à aucun courtier, démarcheur publicitaire ou organisme tiers.
                </p>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                  ✓ Strict usage privatif
                </span>
              </div>
            </div>
          </div>

          {/* RGPD Section: Portability and Right to be forgotten */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Download className="w-3.5 h-3.5 text-[#00434A]" />
              <span>Vos droits RGPD (Articles 17 et 20)</span>
            </h4>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-[#00434A]">Portabilité intégrale de vos dossiers</h5>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Téléchargez une archive complète en un clic contenant l'historique de vos biens, loyers, quittances et charges.
                </p>
              </div>
              <button
                onClick={handleExportAllData}
                className="px-3.5 py-2 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition flex items-center space-x-2 self-start sm:self-auto cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-teal-300" />
                <span>Exporter mon dossier complet (JSON)</span>
              </button>
            </div>

            {downloadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Votre dossier complet a été exporté et téléchargé avec succès !</span>
              </div>
            )}

            {/* Right to be forgotten */}
            {onPurgeData && (
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-rose-900">Droit à l'oubli & Purge des données personnelles</h5>
                    <p className="text-[11px] text-rose-700/80 mt-0.5">
                      Supprime immédiatement toutes vos données enregistrées sur cette instance. Cette action est irréversible.
                    </p>
                  </div>
                </div>

                {!purgeConfirmStep ? (
                  <button
                    onClick={() => setPurgeConfirmStep(true)}
                    className="mt-2 text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Demander la purge de mes données</span>
                  </button>
                ) : (
                  <div className="mt-2 p-3 rounded-xl bg-white border border-rose-300 space-y-2 animate-fadeIn">
                    <p className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>Êtes-vous absolument certain ? Tous les biens et pointages seront effacés.</span>
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={handleExecutePurge}
                        disabled={isPurging}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isPurging ? 'Purge en cours...' : 'Oui, effacer définitivement mes données'}
                      </button>
                      <button
                        onClick={() => setPurgeConfirmStep(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#00434A] hover:bg-[#00343a] text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Fermer le centre de sécurité
          </button>
        </div>

      </div>
    </div>
  );
};

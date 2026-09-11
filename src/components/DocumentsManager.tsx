import React, { useState } from 'react';
import { Property, DocumentRecord } from '../types';
import { FileText, Plus, ShieldCheck, Download, Calendar, Folder, FileCheck } from 'lucide-react';

interface DocumentsManagerProps {
  properties: Property[];
  documents: DocumentRecord[];
  onAddDocument: (doc: DocumentRecord) => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({
  properties,
  documents,
  onAddDocument
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentRecord['category']>('BAIL_SIGNE');
  const [filename, setFilename] = useState('');

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const filteredDocs = documents.filter(d => {
    if (selectedPropertyId !== 'ALL' && d.propertyId !== selectedPropertyId) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !propertyId) return;

    const newDoc: DocumentRecord = {
      id: `doc_${Date.now()}`,
      propertyId,
      title: title.trim(),
      category,
      date: new Date().toISOString().split('T')[0],
      filename: filename.trim() || `${title.replace(/\s+/g, '_')}.pdf`,
      size: '1.2 Mo'
    };

    onAddDocument(newDoc);
    setTitle('');
    setFilename('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <Folder className="w-5 h-5 text-teal-600" />
            <span>Dossier Locatif & Documents Juridiques</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Baux, états des lieux certifiés Dryos, diagnostics obligatoires et attestations d'assurance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-300 bg-white text-slate-800"
          >
            <option value="ALL">Tous les biens</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            id="btn-add-document"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un document</span>
          </button>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-3">Ajouter une pièce au dossier</h4>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bien rattaché</label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type de document</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                >
                  <option value="BAIL_SIGNE">Bail d'habitation signé</option>
                  <option value="ETAT_DES_LIEUX">État des lieux d'entrée (Dryos)</option>
                  <option value="DIAGNOSTICS">Dossier Diagnostics (DPE, etc.)</option>
                  <option value="ASSURANCE">Attestation assurance locataire</option>
                  <option value="QUITTANCE">Quittance archivée</option>
                  <option value="AUTRE">Autre pièce légale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intitulé du document *</label>
                <input
                  type="text"
                  placeholder="Ex: Attestation Assurance 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du fichier PDF</label>
                <input
                  type="text"
                  placeholder="Ex: Assurance_2025_Duval.pdf"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map(doc => {
          const prop = getProperty(doc.propertyId);
          return (
            <div 
              key={doc.id}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-500/40 shadow-xs flex items-start justify-between transition"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-slate-100 text-teal-700 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{doc.title}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{prop?.name} ({prop?.city})</p>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                    <span>{doc.filename}</span>
                    <span>•</span>
                    <span>{doc.size || 'PDF'}</span>
                    <span>•</span>
                    <span>Ajouté le {new Date(doc.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Téléchargement de la pièce : ${doc.filename}`);
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition cursor-pointer"
                title="Consulter ou télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

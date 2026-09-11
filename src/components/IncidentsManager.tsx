import React, { useState } from 'react';
import { Property, Incident, IncidentCategory, IncidentStatus } from '../types';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Euro, 
  Tag, 
  Info,
  Calendar
} from 'lucide-react';

interface IncidentsManagerProps {
  properties: Property[];
  incidents: Incident[];
  onAddIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
}

export const IncidentsManager: React.FC<IncidentsManagerProps> = ({
  properties,
  incidents,
  onAddIncident,
  onUpdateStatus
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');

  // New incident form state
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('PLOMBERIE');
  const [cost, setCost] = useState<string>('');
  const [isDeductible, setIsDeductible] = useState(true);

  const getProperty = (id: string) => properties.find(p => p.id === id);

  const filteredIncidents = incidents.filter(i => {
    if (selectedPropertyId !== 'ALL' && i.propertyId !== selectedPropertyId) return false;
    return true;
  });

  const totalDeductibleCost = filteredIncidents
    .filter(i => i.isDeductible && i.cost)
    .reduce((acc, i) => acc + (i.cost || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !propertyId) return;

    const newInc: Incident = {
      id: `inc_${Date.now()}`,
      propertyId,
      title: title.trim(),
      description: description.trim(),
      category,
      date: new Date().toISOString().split('T')[0],
      cost: cost ? parseFloat(cost) : undefined,
      isDeductible,
      status: 'A_TRAITER'
    };

    onAddIncident(newInc);
    setTitle('');
    setDescription('');
    setCost('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Incidents répertoriés</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {filteredIncidents.length}
          </span>
          <span className="text-xs text-slate-400">
            {filteredIncidents.filter(i => i.status !== 'RESOLU').length} en cours / à traiter
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-teal-600 block flex items-center">
            <Euro className="w-3.5 h-3.5 mr-1" />
            Dépenses déductibles (Fiscalité)
          </span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {totalDeductibleCost.toLocaleString('fr-FR')} €
          </span>
          <span className="text-xs text-teal-800">Déductibles de vos revenus fonciers / LMNP</span>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl text-white flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
              Carnet d'entretien
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Historique technique de vos biens post-mise en location
            </p>
          </div>
          <button
            id="btn-open-add-incident"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition flex items-center space-x-1 cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Fermer' : 'Nouvelle entrée'}</span>
          </button>
        </div>
      </div>

      {/* Add Incident Form */}
      {showAddForm && (
        <form 
          id="form-add-incident"
          onSubmit={handleSubmit} 
          className="bg-white p-5 rounded-xl border-2 border-teal-500/40 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-teal-600" />
              <span>Enregistrer une intervention ou un signalement</span>
            </h4>
            <span className="text-xs text-slate-400">Carnet numérique du bien</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bien concerné *</label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                required
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="PLOMBERIE">Plomberie / Sanitaire</option>
                <option value="ELECTRICITE">Électricité</option>
                <option value="CHAUFFAGE">Chauffage / Ballon d'eau chaude</option>
                <option value="COPROPRIETE">Syndic & Copropriété</option>
                <option value="SERRURERIE">Serrurerie & Accès</option>
                <option value="AUTRE">Autre maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Coût TTC (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 140"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'intervention *</label>
              <input
                type="text"
                placeholder="Ex: Réparation fuite robinet cuisine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDeductible}
                  onChange={(e) => setIsDeductible(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span>Charge déductible fiscalement (impôts fonciers / LMNP)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Détails de l'intervention</label>
            <textarea
              rows={2}
              placeholder="Description des réparations, coordonnées de l'artisan, date d'intervention..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition"
            >
              Enregistrer l'incident
            </button>
          </div>
        </form>
      )}

      {/* Filter by property */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Filtrer par bien :</span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
          >
            <option value="ALL">Tous les biens</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="font-medium text-sm text-slate-600">Aucun incident enregistré</p>
            <p className="text-xs">Tout est sous contrôle pour vos logements en location.</p>
          </div>
        ) : (
          filteredIncidents.map(inc => {
            const prop = getProperty(inc.propertyId);
            return (
              <div 
                key={inc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      inc.category === 'PLOMBERIE' ? 'bg-cyan-100 text-cyan-800' :
                      inc.category === 'ELECTRICITE' ? 'bg-amber-100 text-amber-800' :
                      inc.category === 'CHAUFFAGE' ? 'bg-orange-100 text-orange-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {inc.category}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{inc.title}</h5>
                  </div>
                  <p className="text-xs text-slate-500">{inc.description}</p>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span>{prop?.name} ({prop?.city})</span>
                    <span>•</span>
                    <span>Date : {new Date(inc.date).toLocaleDateString('fr-FR')}</span>
                    {inc.cost && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{inc.cost} € TTC</span>
                        {inc.isDeductible && (
                          <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-[10px]">
                            Déductible impôts
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:flex-shrink-0">
                  <select
                    value={inc.status}
                    onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                      inc.status === 'RESOLU' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : inc.status === 'EN_COURS'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="A_TRAITER">À traiter</option>
                    <option value="EN_COURS">En cours d'intervention</option>
                    <option value="RESOLU">✓ Résolu</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

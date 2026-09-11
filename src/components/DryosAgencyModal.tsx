import React, { useState } from 'react';
import { Property, DryosSupportTicket } from '../types';
import { X, PhoneCall, Mail, Send, CheckCircle2, Shield, Sparkles, Building } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface DryosAgencyModalProps {
  properties: Property[];
  onClose: () => void;
  onSubmitTicket: (ticket: DryosSupportTicket) => void;
}

export const DryosAgencyModal: React.FC<DryosAgencyModalProps> = ({
  properties,
  onClose,
  onSubmitTicket
}) => {
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id || '');
  const [type, setType] = useState<DryosSupportTicket['type']>('CONGE_LOCATAIRE');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newTicket: DryosSupportTicket = {
      id: `tkt_${Date.now()}`,
      propertyId: propertyId || undefined,
      subject: subject.trim() || (type === 'CONGE_LOCATAIRE' ? 'Préavis locataire / Nouvelle mise en location' : 'Demande d\'accompagnement Dryos'),
      type,
      message: message.trim(),
      status: 'TRANSMIS',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onSubmitTicket(newTicket);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="dryos-agency-modal"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <AppLogo className="w-11 h-11 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base">Assistance DRYOS Immobilier</h3>
              <p className="text-xs text-slate-300">
                paris.dryos.fr • Spécialiste de la mise en location Paris & IDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Demande transmise avec succès à l'équipe Dryos !</h4>
            <p className="text-xs text-slate-600">
              Dimitri et l'équipe Dryos ont bien reçu votre demande et reviendront vers vous sous 24h ouvrées.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Direct contact banner */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <PhoneCall className="w-4 h-4 text-teal-600" />
                <span>Contact direct : <strong>Dimitri Blanc</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Mail className="w-4 h-4 text-teal-600" />
                <a href="mailto:dimitri.blanc@dryos.fr" className="text-teal-700 font-semibold hover:underline">
                  dimitri.blanc@dryos.fr
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif de votre sollicitation
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
              >
                <option value="CONGE_LOCATAIRE">
                  🚨 Mon locataire a donné son préavis (Relancer une mise en location)
                </option>
                <option value="NOUVELLE_MISE_EN_LOCATION">
                  ✨ Nouveau bien à mettre en location à Paris / Petite Couronne
                </option>
                <option value="ETAT_DES_LIEUX_SORTIE">
                  📋 État des lieux de sortie & restitution de caution
                </option>
                <option value="CONSEIL_JURIDIQUE">
                  ⚖️ Question juridique / Encadrement des loyers / Révision IRL
                </option>
                <option value="AUTRE">Autre demande</option>
              </select>
            </div>

            {properties.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bien concerné
                </label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objet / Sujet
              </label>
              <input
                type="text"
                placeholder="Ex: Préavis reçu pour fin mai, besoin de relouer"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Précisez votre demande *
              </label>
              <textarea
                rows={4}
                placeholder="Expliquez votre besoin en détail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>

            {/* Dryos guarantee reminder */}
            <div className="bg-teal-50 p-3 rounded-lg border border-teal-200 text-xs text-teal-900 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">L'engagement DRYOS :</span> Pas de commissions mensuelles abusives. Un tarif forfaitaire clair et juste pour chaque mise en location, garanti par notre carte professionnelle CPI délivrée par la CCI.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer ma demande à Dryos</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

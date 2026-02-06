
import React, { useState, useEffect } from 'react';
import { WoodLog, WarehouseSetting } from '../types';

interface LogFormProps {
  settings: WarehouseSetting[];
  initialData?: WoodLog | null;
  onSave: (log: WoodLog) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LogForm: React.FC<LogFormProps> = ({ settings, initialData, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<WoodLog>({
    num: '',
    data: new Date().toISOString().split('T')[0],
    sandelys: '',
    vezejas: '',
    gavejas: '',
    sortimentas: '',
    ilgis: '',
    kiekis: 0,
    kaina: 0,
    gamyba: 0,
    pastabos: '',
    pap_pajamos: 0,
    pap_pajamos_desc: '',
    is_transfer: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) || 0 : value
      };

      // Automatiškai užpildome gamybos kainą pasirinkus sandėlį
      if (name === 'sandelys') {
        const warehouse = settings.find(s => s.name === value);
        if (warehouse) {
          updated.gamyba = warehouse.prodCost;
        }
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 animate-fadeIn mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? `Redaguojamas įrašas: ${initialData.num}` : 'Naujas įrašas'}
        </h2>
        {initialData && (
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Važtaraščio Nr.</label>
            <input 
              required
              name="num"
              value={formData.num}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Pvz. 1025"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
            <input 
              type="date"
              name="data"
              value={formData.data}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Sandėlys</label>
            <select 
              name="sandelys"
              value={formData.sandelys}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">Pasirinkti...</option>
              {settings.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Vežėjas</label>
            <input 
              name="vezejas"
              value={formData.vezejas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Pvz. Žaibo Ratai"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Gavėjas</label>
            <input 
              name="gavejas"
              value={formData.gavejas}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Pvz. Stora Enso"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase">Medienos duomenys</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="col-span-2 md:col-span-1">
               <label className="text-xs font-semibold text-slate-500">Sortimentas</label>
               <input name="sortimentas" value={formData.sortimentas} onChange={handleChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm" />
             </div>
             <div>
               <label className="text-xs font-semibold text-slate-500">Ilgis</label>
               <input name="ilgis" value={formData.ilgis} onChange={handleChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm" />
             </div>
             <div>
               <label className="text-xs font-semibold text-slate-500">Kiekis (m³)</label>
               <input type="number" step="0.01" name="kiekis" value={formData.kiekis} onChange={handleChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm" />
             </div>
             <div>
               <label className="text-xs font-semibold text-slate-500">Kaina (€)</label>
               <input type="number" step="0.01" name="kaina" value={formData.kaina} onChange={handleChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm" />
             </div>
             <div>
               <label className="text-xs font-semibold text-slate-500">Gamyba (€/m³)</label>
               <input type="number" step="0.1" name="gamyba" value={formData.gamyba} onChange={handleChange} className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm bg-slate-100" readOnly />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pap. Pajamos (€)</label>
                <input type="number" name="pap_pajamos" value={formData.pap_pajamos} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
              </div>
              <div className="flex-[2]">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Aprašymas</label>
                <input name="pap_pajamos_desc" value={formData.pap_pajamos_desc} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Pvz. šakos" />
              </div>
           </div>
           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Pastabos / Failo nuoroda</label>
              <input name="pastabos" value={formData.pastabos} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="https://..." />
           </div>
        </div>

        <div className="flex items-center gap-2">
           <input type="checkbox" id="is_transfer" name="is_transfer" checked={formData.is_transfer} onChange={handleChange} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
           <label htmlFor="is_transfer" className="text-sm font-medium text-slate-700">Atvežta iš kito sandėlio</label>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Kraunama...' : initialData ? 'ATNAUJINTI ĮRAŠĄ' : 'IŠSAUGOTI DUOMENIS'}
          </button>
          {initialData && (
            <button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
            >
              Atšaukti
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LogForm;


import React, { useState } from 'react';
import { WoodLog } from '../types';

interface LogTableProps {
  logs: WoodLog[];
  onEdit: (log: WoodLog) => void;
  onDelete: (num: string, date: string) => void;
  onInvoice: (num: string) => void;
  onRefresh: () => void;
}

const LogTable: React.FC<LogTableProps> = ({ logs, onEdit, onDelete, onInvoice, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(l => 
    l.num.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sandelys.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.gavejas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 animate-fadeIn overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Važtaraščių Registras</h2>
          <p className="text-slate-400 text-sm">Visi įrašai iš Jūsų Google Sheets</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"></i>
            <input 
              type="text" 
              placeholder="Ieškoti Nr., Gavėjo..." 
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm w-full md:w-80 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={onRefresh}
            className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
            title="Atnaujinti duomenis"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-5">Važtaraštis</th>
              <th className="px-8 py-5">Data / Sandėlis</th>
              <th className="px-8 py-5 text-right">Kiekis / Kaina</th>
              <th className="px-8 py-5 text-right">Veiksmai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
              <tr key={`${log.num}-${idx}`} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800 text-lg">#{log.num}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.gavejas || 'NENURODYTA'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-600">{log.data}</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase italic">{log.sandelys}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-800">{log.kiekis} m³</span>
                    <span className="text-xs font-bold text-slate-400">{log.kaina} €/m³</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center gap-3">
                    <button 
                      onClick={() => onInvoice(log.num)}
                      className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Siųsti sąskaitą per Gmail"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                    <button 
                      onClick={() => onEdit(log)}
                      className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                      title="Redaguoti"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => onDelete(log.num, log.data)}
                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Trinti įrašą"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-20">
                    <i className="fas fa-folder-open text-5xl"></i>
                    <span className="font-bold uppercase tracking-widest text-xs">Važtaraščių nėra</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;

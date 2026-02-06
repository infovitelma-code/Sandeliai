
import React, { useState, useEffect, useCallback } from 'react';
import { WoodLog, WarehouseSetting, AppTab } from '../types';
import { apiService } from '../services/apiService';
import Dashboard from './Dashboard';
import LogForm from './LogForm';
import LogTable from './LogTable';
import Settings from './Settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('logs');
  const [logs, setLogs] = useState<WoodLog[]>([]);
  const [settings, setSettings] = useState<WarehouseSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLog, setEditingLog] = useState<WoodLog | null>(null);

  const isConfigured = apiService.isConfigured();

  const loadData = useCallback(async () => {
    if (!isConfigured) return;
    setLoading(true);
    const data = await apiService.fetchAll();
    setLogs(data.logs);
    setSettings(data.settings);
    setLoading(false);
  }, [isConfigured]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveLog = async (log: WoodLog) => {
    setLoading(true);
    try {
      const isEdit = !!editingLog;
      await apiService.saveLog(log, isEdit, editingLog?.num, editingLog?.data);
      setEditingLog(null);
      setTimeout(loadData, 1000);
    } catch (error) {
      alert("Nepavyko išsaugoti.");
      setLoading(false);
    }
  };

  const handleDeleteLog = async (num: string, date: string) => {
    if (!confirm(`Ar tikrai ištrinti važtaraštį Nr. ${num}?`)) return;
    setLoading(true);
    await apiService.deleteLog(num, date);
    setTimeout(loadData, 1000);
  };

  const handleSaveSetting = async (setting: WarehouseSetting) => {
    setLoading(true);
    await apiService.saveSetting(setting);
    setTimeout(loadData, 1000);
  };

  const handleDeleteSetting = async (name: string) => {
    if (!confirm(`Trinti sandėlį ${name}?`)) return;
    setLoading(true);
    await apiService.deleteSetting(name);
    setTimeout(loadData, 1000);
  };

  const handleInvoice = async (num: string) => {
    if (!confirm(`Generuoti ir siųsti sąskaitą Nr. ${num}?`)) return;
    setLoading(true);
    await apiService.sendInvoice(num);
    setLoading(false);
    alert("Sąskaita bus sugeneruota ir išsiųsta Jūsų el. paštu.");
  };

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Configuration Alert */}
      {!isConfigured && activeTab !== 'settings' && (
        <div className="bg-amber-500 text-white p-4 text-center font-bold animate-pulse">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          SISTEMA DAR NESUKONFIGŪRUOTA! Eikite į "Nustatymai" ir sutvarkykite Google Sheets sąsają.
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xl">
              <i className="fas fa-tree"></i>
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight">MEDIENOS PRO</h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Valdymo Sistema v7.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'logs' ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Važtaraščiai
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Ataskaitos
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              Nustatymai
            </button>
          </nav>

          <div className="flex items-center gap-4">
             {loading && <i className="fas fa-circle-notch fa-spin text-emerald-400"></i>}
             <div className="hidden sm:block text-right">
                <div className="text-xs text-slate-400">Prisijungta kaip</div>
                <div className="text-xs font-bold">Administratorius</div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'logs' && (
          <>
            <LogForm 
              settings={settings} 
              initialData={editingLog}
              onSave={handleSaveLog}
              onCancel={() => setEditingLog(null)}
              isLoading={loading}
            />
            <LogTable 
              logs={logs}
              onEdit={setEditingLog}
              onDelete={handleDeleteLog}
              onInvoice={handleInvoice}
              onRefresh={loadData}
            />
          </>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard logs={logs} settings={settings} />
        )}

        {activeTab === 'settings' && (
          <Settings 
            settings={settings}
            onSave={handleSaveSetting}
            onDelete={handleDeleteSetting}
            isLoading={loading}
          />
        )}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-3 shadow-2xl z-50">
        <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center gap-1 ${activeTab === 'logs' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <i className="fas fa-list"></i>
          <span className="text-[10px] font-bold">Registras</span>
        </button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <i className="fas fa-chart-pie"></i>
          <span className="text-[10px] font-bold">Ataskaitos</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}>
          <i className="fas fa-cog"></i>
          <span className="text-[10px] font-bold">Nustatymai</span>
        </button>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;

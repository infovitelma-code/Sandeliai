import React, { useState } from 'react';
import { WarehouseSetting } from '../types';

interface SettingsProps {
  settings: WarehouseSetting[];
  onSave: (setting: WarehouseSetting) => void;
  onDelete: (name: string) => void;
  isLoading: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onDelete, isLoading }) => {
  const [formData, setFormData] = useState<WarehouseSetting>({
    name: '',
    cost: 0,
    volume: 0,
    prodCost: 0
  });

  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', cost: 0, volume: 0, prodCost: 0 });
  };

  const handleEdit = (s: WarehouseSetting) => {
    setFormData(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const appsScriptCode = `// MEDIENOS PRO BACKEND v10.0
const SS = SpreadsheetApp.getActiveSpreadsheet();
const LOGS_SHEET = "LOGS";
const SETTINGS_SHEET = "SETTINGS";

function doGet() {
  try {
    const logs = SS.getSheetByName(LOGS_SHEET).getDataRange().getValues().slice(1);
    const settings = SS.getSheetByName(SETTINGS_SHEET).getDataRange().getValues().slice(1);
    return ContentService.createTextOutput(JSON.stringify({logs, settings}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({logs: [], settings: [], error: e.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetLogs = SS.getSheetByName(LOGS_SHEET);
    const sheetSettings = SS.getSheetByName(SETTINGS_SHEET);

    if (data.type === "log") {
      sheetLogs.appendRow([
        data.num, data.data, data.sandelys, data.vezejas, data.gavejas,
        data.sortimentas, data.ilgis, data.kiekis, data.kaina, data.gamyba,
        data.pastabos, data.pap_pajamos, data.pap_pajamos_desc, new Date(), data.is_transfer
      ]);
    } else if (data.type === "edit_log") {
      const rows = sheetLogs.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(data.old_num) && formatDate(rows[i][1]) === formatDate(data.old_date)) {
          sheetLogs.getRange(i + 1, 1, 1, 15).setValues([[
            data.num, data.data, data.sandelys, data.vezejas, data.gavejas,
            data.sortimentas, data.ilgis, data.kiekis, data.kaina, data.gamyba,
            data.pastabos, data.pap_pajamos, data.pap_pajamos_desc, new Date(), data.is_transfer
          ]]);
          break;
        }
      }
    } else if (data.type === "delete_log_entry") {
      const rows = sheetLogs.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === String(data.num) && formatDate(rows[i][1]) === formatDate(data.data)) {
          sheetLogs.deleteRow(i + 1);
          break;
        }
      }
    } else if (data.type === "setting") {
      const rows = sheetSettings.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.name) {
          sheetSettings.getRange(i + 1, 1, 1, 4).setValues([[data.name, data.cost, data.volume, data.prodCost]]);
          found = true;
          break;
        }
      }
      if (!found) sheetSettings.appendRow([data.name, data.cost, data.volume, data.prodCost]);
    } else if (data.type === "delete_setting") {
      const rows = sheetSettings.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === data.name) {
          sheetSettings.deleteRow(i + 1);
          break;
        }
      }
    } else if (data.type === "send_invoice") {
      sendEmailInvoice(data.nr);
    }
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function sendEmailInvoice(nr) {
  const rows = SS.getSheetByName(LOGS_SHEET).getDataRange().getValues();
  let log = null;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === String(nr).trim()) {
      log = rows[i];
      break;
    }
  }
  
  if (log) {
    const email = Session.getEffectiveUser().getEmail();
    const subject = "🌲 SĄSKAITA NR. " + nr;
    const suma = (Number(log[7]) * Number(log[8])).toFixed(2);
    const body = "Važtaraščio Nr: " + nr + "\\nKiekis: " + log[7] + " m3\\nKaina: " + log[8] + " EUR\\nSuma: " + suma + " EUR";
    GmailApp.sendEmail(email, subject, body);
  }
}

function formatDate(date) {
  if (!date) return "";
  try {
    return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), "yyyy-MM-dd");
  } catch(e) {
    return String(date);
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl">
            <i className="fas fa-magic"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Sujungimas su Google Sheets</h2>
            <p className="text-slate-400 text-sm">Nukopijuokite kodą žemiau į savo Google Sheets Apps Script.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <button 
              onClick={copyToClipboard}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
              {copySuccess ? 'KODAS NUKOPIJUOTAS!' : 'KOPIJUOTI BACKEND KODĄ'}
            </button>
          </div>
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-hidden">
            <pre className="text-[10px] font-mono text-slate-500 opacity-60 overflow-y-auto max-h-32">
              {appsScriptCode}
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-black text-slate-800 mb-6 uppercase italic tracking-tighter">🏗️ Sandėlių Valdymas</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-10">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sandėlis</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Pvz. Miškas-1" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gamyba (€/m³)</label>
            <input type="number" step="0.1" name="prodCost" value={formData.prodCost} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all">
              IŠSAUGOTI
            </button>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-4">Pavadinimas</th>
                <th className="px-6 py-4">Gamyba</th>
                <th className="px-6 py-4 text-right">Veiksmai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.map(s => (
                <tr key={s.name} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-black">{s.name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{s.prodCost} €/m³</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(s)} className="p-2 text-slate-400 hover:text-emerald-500"><i className="fas fa-edit"></i></button>
                    <button onClick={() => onDelete(s.name)} className="p-2 text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
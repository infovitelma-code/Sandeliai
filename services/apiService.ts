import { WoodLog, WarehouseSetting, ApiResponse } from '../types';

// Jūsų nurodytas pagrindinis URL adresas
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIXkuYnbGeYBwfdzcu2MNHSfcysR5QY3TihI4nbxeHe5UBT_nMpOYpwh4qIMwUPwPDXw/exec";

export const apiService = {
  isConfigured(): boolean {
    return SCRIPT_URL.includes("script.google.com");
  },

  async fetchAll(): Promise<{ logs: WoodLog[], settings: WarehouseSetting[] }> {
    if (!this.isConfigured()) return { logs: [], settings: [] };
    
    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error("Serverio klaida");
      const data: ApiResponse = await response.json();

      // GRIEŽTA TAISYKLĖ: 15 STULPELIŲ APDOROJIMAS
      const logs: WoodLog[] = (data.logs || []).map(row => ({
        num: String(row[0] || ''),              // 1. Nr
        data: this.formatDate(row[1]),          // 2. Data
        sandelys: String(row[2] || ''),         // 3. Sandėlys
        vezejas: String(row[3] || ''),          // 4. Vežėjas
        gavejas: String(row[4] || ''),          // 5. Gavėjas
        sortimentas: String(row[5] || ''),      // 6. Sortimentas
        ilgis: String(row[6] || ''),            // 7. Ilgis
        kiekis: Number(row[7]) || 0,            // 8. Kiekis
        kaina: Number(row[8]) || 0,             // 9. Kaina
        gamyba: Number(row[9]) || 0,            // 10. Gamyba
        pastabos: String(row[10] || ''),        // 11. Pastabos
        pap_pajamos: Number(row[11]) || 0,      // 12. Pap_pajamos
        pap_pajamos_desc: String(row[12] || ''),// 13. Aprasymas
        time: String(row[13] || ''),            // 14. Laikas
        is_transfer: row[14] === true || row[14] === 'TRUE' // 15. Transfer
      }));

      const settings: WarehouseSetting[] = (data.settings || []).map(row => ({
        name: String(row[0] || ''),
        cost: Number(row[1]) || 0,
        volume: Number(row[2]) || 0,
        prodCost: Number(row[3]) || 0
      }));

      return { logs, settings };
    } catch (error) {
      console.error("Klaida kraunant duomenis:", error);
      return { logs: [], settings: [] };
    }
  },

  async saveLog(log: WoodLog, isEdit: boolean = false, oldNum?: string, oldDate?: string): Promise<void> {
    await this.post({
      type: isEdit ? "edit_log" : "log",
      ...log,
      old_num: oldNum,
      old_date: oldDate
    });
  },

  async deleteLog(num: string, date: string): Promise<void> {
    await this.post({ type: "delete_log_entry", num, data: date });
  },

  async saveSetting(setting: WarehouseSetting): Promise<void> {
    await this.post({ type: "setting", ...setting });
  },

  async deleteSetting(name: string): Promise<void> {
    await this.post({ type: "delete_setting", name });
  },

  async sendInvoice(nr: string): Promise<void> {
    return this.post({ type: "send_invoice", nr: nr });
  },

  async post(data: any): Promise<void> {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Ryšio klaida:", error);
      throw error;
    }
  },

  formatDate(val: any): string {
    if (!val) return "";
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toISOString().split('T')[0];
  }
};
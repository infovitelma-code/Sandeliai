
export interface WoodLog {
  num: string;
  data: string;
  sandelys: string;
  vezejas: string;
  gavejas: string;
  sortimentas: string;
  ilgis: string;
  kiekis: number;
  kaina: number;
  gamyba: number;
  pastabos: string;
  pap_pajamos: number;
  pap_pajamos_desc: string;
  is_transfer: boolean;
  time?: string;
}

export interface WarehouseSetting {
  name: string;
  cost: number;
  volume: number;
  prodCost: number;
}

export type AppTab = 'dashboard' | 'logs' | 'settings';

export interface ApiResponse {
  logs: any[][];
  settings: any[][];
}

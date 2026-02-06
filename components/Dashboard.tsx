
import React, { useMemo, useState } from 'react';
import { WoodLog, WarehouseSetting } from '../types';
import StatCard from './StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardProps {
  logs: WoodLog[];
  settings: WarehouseSetting[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#71717a'];

const Dashboard: React.FC<DashboardProps> = ({ logs, settings }) => {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => l.data >= dateFrom && l.data <= dateTo);
  }, [logs, dateFrom, dateTo]);

  const globalStats = useMemo(() => {
    const totalVolume = filteredLogs.reduce((acc, l) => acc + l.kiekis, 0);
    const totalSales = filteredLogs.reduce((acc, l) => acc + (l.kiekis * l.kaina), 0);
    const totalProdCost = filteredLogs.reduce((acc, l) => acc + (l.kiekis * l.gamyba), 0);
    const totalPap = filteredLogs.reduce((acc, l) => acc + l.pap_pajamos, 0);
    const totalInvestments = settings.reduce((acc, s) => acc + s.cost, 0);
    
    return {
      totalVolume,
      totalSales,
      totalProdCost,
      totalPap,
      totalInvestments,
      netResult: (totalSales - totalProdCost + totalPap)
    };
  }, [filteredLogs, settings]);

  const warehouseStats = useMemo(() => {
    return settings.map(s => {
      const warehouseLogs = filteredLogs.filter(l => l.sandelys === s.name);
      const vol = warehouseLogs.reduce((acc, l) => acc + l.kiekis, 0);
      const sales = warehouseLogs.reduce((acc, l) => acc + (l.kiekis * l.kaina), 0);
      const prod = warehouseLogs.reduce((acc, l) => acc + (l.kiekis * l.gamyba), 0);
      const pap = warehouseLogs.reduce((acc, l) => acc + l.pap_pajamos, 0);
      
      const distribution = warehouseLogs.reduce((acc: any, l) => {
        acc[l.sortimentas] = (acc[l.sortimentas] || 0) + l.kiekis;
        return acc;
      }, {});

      const chartData = Object.keys(distribution).map(name => ({
        name,
        value: Number(distribution[name].toFixed(2))
      }));

      return {
        ...s,
        vol,
        sales,
        prod,
        pap,
        net: (sales - prod + pap),
        chartData
      };
    });
  }, [filteredLogs, settings]);

  if (logs.length === 0 && settings.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-chart-pie text-4xl text-slate-300"></i>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Sveiki atvykę!</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">Pirmiausia nustatymuose pridėkite sandėlius, o tada registruokite važtaraščius, kad matytumėte ataskaitas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Filtrai */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Finansinė Ataskaita</h2>
          <p className="text-slate-500 text-sm">Analizuokite savo verslo našumą</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nuo</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Iki</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
        </div>
      </div>

      {/* Globali suvestinė */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Bendras Kiekis" 
          value={`${globalStats.totalVolume.toFixed(2)} m³`} 
          icon="fas fa-layer-group" 
          color="border-slate-800"
          description="Pasirinktu laikotarpiu"
        />
        <StatCard 
          title="Pajamos" 
          value={`${globalStats.totalSales.toLocaleString()}€`} 
          icon="fas fa-arrow-up text-emerald-500" 
          color="border-emerald-500"
          description={`+${globalStats.totalPap.toLocaleString()}€ papildomai`}
        />
        <StatCard 
          title="Gamybos Išlaidos" 
          value={`${globalStats.totalProdCost.toLocaleString()}€`} 
          icon="fas fa-industry text-amber-500" 
          color="border-amber-500"
          description="Pjovimas, kirtimas ir kt."
        />
        <StatCard 
          title="Grynasis Rezultatas" 
          value={`${globalStats.netResult.toLocaleString()}€`} 
          icon="fas fa-wallet text-blue-500" 
          color="border-blue-500"
          description="Pajamos - Gamyba + Pap. pajamos"
        />
      </div>

      {/* Sandėlių analizė */}
      <div className="grid grid-cols-1 gap-8">
        {warehouseStats.map(s => (
          <div key={s.name} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <i className="fas fa-warehouse text-emerald-400"></i>
                <h3 className="font-bold uppercase tracking-wider">{s.name}</h3>
              </div>
              <div className="text-xs font-medium opacity-70">
                Užpildymas: {((s.vol / s.volume) * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Kiekis</div>
                    <div className="text-lg font-bold">{s.vol.toFixed(2)} m³</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Pardavimai</div>
                    <div className="text-lg font-bold">{s.sales.toLocaleString()}€</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Gamyba</div>
                    <div className="text-lg font-bold text-amber-600">{s.prod.toLocaleString()}€</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Rezultatas</div>
                    <div className="text-lg font-bold text-emerald-700">{s.net.toLocaleString()}€</div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Sortimentų Struktūra</h4>
                <div className="space-y-2">
                  {s.chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-slate-600 uppercase">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-4 flex-1 mx-4">
                        <div className="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              backgroundColor: COLORS[i % COLORS.length],
                              width: `${(d.value / s.vol) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 w-20 text-right">{d.value} m³</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l border-slate-100 pl-8">
                 <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={s.chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {s.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                 </div>
                 <div className="mt-4 text-center">
                   <div className="text-[10px] font-bold text-slate-400 uppercase">Sandėlio talpa</div>
                   <div className="text-sm font-bold">{s.vol.toFixed(1)} / {s.volume} m³</div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;


import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</span>
        <i className={`${icon} text-slate-400 text-xl`}></i>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {description && <div className="text-slate-400 text-xs mt-1">{description}</div>}
    </div>
  );
};

export default StatCard;

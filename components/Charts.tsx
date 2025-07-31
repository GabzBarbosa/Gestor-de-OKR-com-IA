
import React from 'react';
import { Dependency, BlockingArea, DependencyStatus } from '../types';

interface ChartsProps {
    dependencies: Dependency[];
    areaConfig: { [key in BlockingArea]: { title: string; classes: string; } };
}

const PieChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-full text-slate-500">Sem dados para o gráfico.</div>;

    let cumulativePercent = 0;
    const segments = data.map(item => {
        const percent = item.value / total;
        const startAngle = cumulativePercent * 360;
        cumulativePercent += percent;
        const endAngle = cumulativePercent * 360;
        
        const largeArcFlag = percent > 0.5 ? 1 : 0;
        const startX = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
        const startY = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
        const endX = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
        const endY = 50 + 40 * Math.sin(Math.PI * endAngle / 180);

        return <path key={item.name} d={`M 50,50 L ${startX},${startY} A 40,40 0 ${largeArcFlag},1 ${endX},${endY} Z`} fill={item.color}></path>;
    });
    
    return (
         <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
                {segments}
            </svg>
            <div className="text-sm space-y-1">
                {data.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name} ({item.value})</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const BarChart: React.FC<{data: {name: string; value: number; colorClass: string}[]}> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    if (data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500">Sem dados para o gráfico.</div>;

    return (
        <div className="space-y-2">
            {data.map(item => (
                <div key={item.name} className="grid grid-cols-4 items-center gap-2 text-sm">
                    <span className="col-span-1 font-medium text-slate-600 dark:text-slate-300 text-right pr-2">{item.name}</span>
                    <div className="col-span-3 flex items-center gap-2">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                             <div className={`h-5 rounded-full ${item.colorClass}`} style={{ width: `${(item.value / maxValue) * 100}%`}}></div>
                        </div>
                        <span className="font-mono text-xs w-6 text-right">{item.value}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const Charts: React.FC<ChartsProps> = ({ dependencies, areaConfig }) => {
    const byArea = Object.keys(areaConfig).map(area => {
        const count = dependencies.filter(d => d.blockingArea === area).length;
        return { name: area, value: count, colorClass: areaConfig[area as BlockingArea].classes.split(' ')[1] };
    }).filter(d => d.value > 0);

    const statusColors: { [key in DependencyStatus]: string } = {
      Pendente: '#facc15', // yellow-400
      'Em Andamento': '#60a5fa', // blue-400
      Resolvido: '#4ade80', // green-400
      Cancelado: '#94a3b8', // slate-400
    }
    const byStatus = (Object.keys(statusColors) as DependencyStatus[]).map(status => {
        const count = dependencies.filter(d => d.status === status).length;
        return { name: status, value: count, color: statusColors[status] };
    }).filter(d => d.value > 0);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <h4 className="font-bold mb-3 text-center lg:text-left">Volume de Pendências por Área</h4>
                <BarChart data={byArea} />
            </div>
             <div>
                <h4 className="font-bold mb-3 text-center lg:text-left">Pendências por Status</h4>
                <PieChart data={byStatus} />
            </div>
        </div>
    );
};

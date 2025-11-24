
import React, { useMemo } from 'react';
import { Lead } from '../types';
import { TrendingUp, Users, Phone, Calendar, DollarSign, PieChart, ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';

type Props = {
  leads: Lead[];
};

type Stats = {
  total: number;
  engaged: number;
  booked: number;
  completed: number;
  noShows: number;
  revenue: number;
  totalCalls: number;
  answeredCalls: number;
  sources: Record<string, number>;
  services: Record<string, number>;
  conversionRate: string;
  showRate: string;
  avgDeal: string;
};

export default function ReportsPage({ leads }: Props) {
  
  // --- DATA CALCULATIONS ---
  const stats: Stats = useMemo(() => {
    const total = leads.length;
    const engaged = leads.filter(l => l.status !== 'New' && l.status !== 'AI Called – No Answer').length;
    const booked = leads.filter(l => l.status === 'Appointment Booked' || l.status === 'Appointment Completed').length;
    const completed = leads.filter(l => l.status === 'Appointment Completed').length;
    const noShows = leads.filter(l => l.status === 'No Show').length;

    const revenue = leads.reduce((sum, l) => sum + (l.saleAmount || 0), 0);
    
    // Call Stats
    const totalCalls = leads.reduce((sum, l) => sum + l.callAttempts.length, 0);
    const answeredCalls = leads.reduce((sum, l) => sum + l.callAttempts.filter(c => c.outcome === 'answered' || c.outcome === 'booked').length, 0);
    
    // Sources
    const sources: Record<string, number> = {};
    leads.forEach(l => {
      const s = l.source || 'Unknown';
      sources[s] = (sources[s] || 0) + 1;
    });

    // Services Revenue
    const services: Record<string, number> = {};
    leads.forEach(l => {
        if (l.saleAmount && l.service) {
            services[l.service] = (services[l.service] || 0) + l.saleAmount;
        }
    });

    return {
      total,
      engaged,
      booked,
      completed,
      noShows,
      revenue,
      totalCalls,
      answeredCalls,
      sources,
      services,
      conversionRate: total > 0 ? ((booked / total) * 100).toFixed(1) : '0',
      showRate: booked > 0 ? (((booked - noShows) / booked) * 100).toFixed(1) : '0',
      avgDeal: completed > 0 ? (revenue / completed).toFixed(0) : '0'
    };
  }, [leads]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Performance Reports</h1>
          <p className="text-sm text-gray-500">System-wide analytics and KPI summary.</p>
        </div>
        <div className="flex gap-3">
            <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-brand-black shadow-sm outline-none">
                <option>Last 30 Days</option>
                <option>This Quarter</option>
                <option>This Year</option>
                <option>All Time</option>
            </select>
            <button className="bg-brand-black text-brand-blue px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-900 transition">
                Download PDF
            </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard 
            label="Total Revenue" 
            value={`$${stats.revenue.toLocaleString()}`} 
            subValue={`Avg. Sale: $${stats.avgDeal}`}
            icon={DollarSign}
            trend="+12% vs last month"
        />
        <StatCard 
            label="Conversion Rate" 
            value={`${stats.conversionRate}%`} 
            subValue="Lead to Booking"
            icon={TrendingUp}
            trend="+2.4%"
        />
        <StatCard 
            label="Show Up Rate" 
            value={`${stats.showRate}%`} 
            subValue={`${stats.noShows} No Shows`}
            icon={CheckCircle2}
            color="text-green-600"
        />
        <StatCard 
            label="AI Answer Rate" 
            value={`${stats.totalCalls > 0 ? ((stats.answeredCalls / stats.totalCalls) * 100).toFixed(0) : 0}%`} 
            subValue={`${stats.totalCalls} Total Calls`}
            icon={Phone}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Funnel & Sources */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Sales Funnel */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-brand-black text-lg flex items-center gap-2">
                        <Users className="w-5 h-5 text-brand-blue" />
                        Sales Funnel
                    </h3>
                </div>
                
                <div className="space-y-4">
                    <FunnelStep 
                        label="Total Leads" 
                        count={stats.total} 
                        total={stats.total} 
                        color="bg-gray-200" 
                    />
                    <FunnelStep 
                        label="Engaged (Spoke/Msg)" 
                        count={stats.engaged} 
                        total={stats.total} 
                        color="bg-blue-200" 
                    />
                    <FunnelStep 
                        label="Appointments Booked" 
                        count={stats.booked} 
                        total={stats.total} 
                        color="bg-brand-blue" 
                    />
                    <FunnelStep 
                        label="Completed & Paid" 
                        count={stats.completed} 
                        total={stats.total} 
                        color="bg-brand-black" 
                    />
                </div>
            </div>

            {/* Marketing Sources */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-brand-black text-lg flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-brand-blue" />
                        Lead Sources
                    </h3>
                </div>
                <div className="space-y-4">
                    {Object.entries(stats.sources).map(([source, count]) => {
                        const percent = ((count / stats.total) * 100).toFixed(0);
                        return (
                            <div key={source} className="flex items-center gap-4">
                                <div className="w-32 text-sm font-medium text-gray-600 truncate">{source}</div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-black rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                                <div className="w-12 text-right text-sm font-bold text-brand-black">{count}</div>
                                <div className="w-12 text-right text-xs text-gray-400">{percent}%</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Right Col: Revenue & Alerts */}
        <div className="space-y-8">
            
            {/* Revenue by Service */}
             <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-brand-black text-lg flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        Revenue Mix
                    </h3>
                </div>
                <div className="space-y-4">
                     {Object.entries(stats.services).length === 0 && (
                         <div className="text-gray-400 italic text-sm">No revenue recorded yet.</div>
                     )}
                     {Object.entries(stats.services)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([service, amount]) => (
                        <div key={service} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wide mb-1">{service}</div>
                            <div className="flex justify-between items-end">
                                <div className="text-lg font-bold text-brand-black">${amount.toLocaleString()}</div>
                                <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${((amount as number) / stats.revenue) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                     ))}
                </div>
            </div>

            {/* Critical Alerts Card */}
            <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <div className="flex items-center gap-2 mb-4 text-red-800 font-bold text-lg">
                    <AlertCircle className="w-5 h-5" />
                    Areas for Improvement
                </div>
                <ul className="space-y-3">
                    {stats.noShows > 2 && (
                        <li className="flex items-start gap-2 text-sm text-red-700">
                            <ArrowDown className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>High No-Show Rate detected ({stats.noShows} missed). Consider automating confirmation SMS 1 hour before.</span>
                        </li>
                    )}
                    {stats.answeredCalls < stats.totalCalls * 0.3 && (
                         <li className="flex items-start gap-2 text-sm text-red-700">
                            <ArrowDown className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>AI Answer Rate is low ({((stats.answeredCalls / stats.totalCalls) * 100).toFixed(0)}%). Check phone number quality or call timing.</span>
                        </li>
                    )}
                    <li className="flex items-start gap-2 text-sm text-red-700">
                        <ArrowDown className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{stats.engaged - stats.booked} leads engaged but not booked. Review call recordings for objection handling.</span>
                    </li>
                </ul>
            </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, trend, color }: any) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${color ? 'bg-gray-50' : 'bg-brand-black'}`}>
                    <Icon className={`w-5 h-5 ${color || 'text-brand-blue'}`} />
                </div>
                {trend && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold text-brand-black">{value}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</div>
            <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">{subValue}</div>
        </div>
    )
}

function FunnelStep({ label, count, total, color }: any) {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    
    return (
        <div className="relative">
            <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-gray-700">{label}</span>
                <span className="font-bold text-brand-black">{count} <span className="text-gray-400 text-xs font-normal">({percentage}%)</span></span>
            </div>
            <div className="h-8 w-full bg-gray-50 rounded-lg overflow-hidden relative">
                <div 
                    className={`h-full ${color} transition-all duration-1000 ease-out rounded-r-lg`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    )
}

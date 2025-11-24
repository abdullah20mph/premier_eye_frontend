import React from 'react';
import { Users, Calendar, DollarSign, PhoneCall, Sparkles } from 'lucide-react';

type Props = {
  metrics: {
    total: number;
    newToday: number;
    booked: number;
    completed: number;
    revenue: number;
    callsMade: number;
    callsAnswered: number;
    whatsappTotal: number;
  };
};

export default function MetricsHeader({ metrics }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <MetricCard 
        label="Total Revenue"
        value={`$${metrics.revenue.toLocaleString()}`}
        subValue={`+$${(metrics.revenue * 0.12).toFixed(0)} this week`}
        icon={DollarSign}
      />

      <MetricCard 
        label="Total Leads"
        value={metrics.total}
        subValue={`${metrics.newToday} new today`}
        icon={Users}
        isHighlight={metrics.newToday > 0}
      />

      <MetricCard 
        label="Appointments"
        value={metrics.booked}
        subValue={`${metrics.completed} completed`}
        icon={Calendar}
      />

      <MetricCard 
        label="AI Engagement"
        value={`${metrics.callsAnswered}/${metrics.callsMade}`}
        subValue={`${metrics.whatsappTotal} WhatsApp msgs`}
        icon={PhoneCall}
      />
    </section>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, isHighlight }: any) {
  return (
    <div className="bg-brand-black text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:shadow-xl hover:shadow-brand-blue/5 transition-all duration-300 border border-gray-800">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition transform group-hover:scale-110 duration-500">
          <Icon className="w-24 h-24 text-brand-blue" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-full text-brand-blue">
                   <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-300">{label}</span>
             </div>
             {isHighlight && <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />}
          </div>

          <div className="text-3xl font-bold tracking-tight text-white mb-1">
            {value}
          </div>
          <div className="text-sm text-brand-blue font-medium mt-2 opacity-80">
             {subValue}
          </div>
        </div>
    </div>
  )
}

import React, { useState, useMemo } from 'react';
import { Lead, CallAttempt } from '../types';
import { Search, Filter, Phone, Play, User, Clock, Voicemail, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Calendar, MapPin } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

type Props = {
  leads: Lead[];
  onSelectLead: (id: string) => void;
};

type CallItem = CallAttempt & {
  leadName: string;
  leadPhone: string;
  leadId: string;
  leadLocation?: string;
};

const ITEMS_PER_PAGE = 10;

export default function AICallsPage({ leads, onSelectLead }: Props) {
  const [filter, setFilter] = useState<'all' | 'answered' | 'voicemail' | 'no_response'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Flatten calls from all leads into a single chronological list
  const allCalls = useMemo(() => {
    const calls: CallItem[] = [];
    leads.forEach(lead => {
      lead.callAttempts.forEach(call => {
        calls.push({
          ...call,
          leadName: lead.name,
          leadPhone: lead.phone,
          leadId: lead.id,
          leadLocation: lead.location,
        });
      });
    });
    return calls.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [leads]);

  // Filter Logic
  const filteredCalls = useMemo(() => {
    return allCalls.filter(call => {
      const matchesFilter = filter === 'all' ? true : call.outcome === filter;
      const matchesSearch = 
        call.leadName.toLowerCase().includes(search.toLowerCase()) ||
        call.leadPhone.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [allCalls, filter, search]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCalls.length / ITEMS_PER_PAGE);
  const paginatedCalls = filteredCalls.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Group by Date
  const groupedCalls = useMemo(() => {
    const groups: Record<string, CallItem[]> = {};
    paginatedCalls.forEach(call => {
        const date = new Date(call.ts);
        let key = format(date, 'MMMM d, yyyy');
        if (isToday(date)) key = 'Today';
        if (isYesterday(date)) key = 'Yesterday';
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(call);
    });
    return groups;
  }, [paginatedCalls]);

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'answered': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'booked': return <CheckCircle2 className="w-3 h-3 text-purple-600" />;
      case 'voicemail': return <Voicemail className="w-3 h-3 text-orange-600" />;
      default: return <XCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getOutcomeStyle = (outcome: string) => {
    switch (outcome) {
      case 'answered': return 'bg-green-50 text-green-700 border-green-100';
      case 'booked': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'voicemail': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="p-2 bg-brand-black rounded-lg">
               <Phone className="w-5 h-5 text-brand-blue" />
            </div>
            Live Call Feed
          </h1>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-blue outline-none w-full md:w-56"
              placeholder="Search name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select 
            className="pl-2 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-blue outline-none appearance-none cursor-pointer font-medium text-gray-600"
            value={filter}
            onChange={(e) => { setFilter(e.target.value as any); setCurrentPage(1); }}
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="voicemail">Voicemail</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">
        {Object.keys(groupedCalls).length === 0 && (
          <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
            No calls found.
          </div>
        )}

        {Object.entries(groupedCalls).map(([dateLabel, calls]: [string, CallItem[]]) => (
            <div key={dateLabel} className="mb-6">
                {/* Date Header */}
                <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-sm z-10 py-2 mb-2 flex items-center gap-2 border-b border-gray-200">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider">{dateLabel}</h3>
                </div>

                <div className="space-y-2">
                    {calls.map((call) => (
                        <div 
                            key={`${call.leadId}-${call.id}`} 
                            onClick={() => onSelectLead(call.leadId)}
                            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-brand-blue/30 transition group cursor-pointer flex items-center gap-4"
                        >
                            {/* Avatar */}
                            <div className="h-8 w-8 rounded-full bg-brand-black text-brand-blue flex items-center justify-center shrink-0 text-xs font-bold">
                                {call.leadName.charAt(0)}
                            </div>

                            {/* Main Info (Compact) */}
                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div className="col-span-1">
                                    <div className="font-bold text-brand-black text-sm truncate group-hover:text-brand-blue transition">
                                        {call.leadName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(call.ts), 'h:mm a')}
                                        </div>
                                        {call.leadLocation && (
                                            <div className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5">
                                                • <MapPin className="w-3 h-3" /> {call.leadLocation}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Outcome */}
                                <div className="col-span-1">
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit flex items-center gap-1 ${getOutcomeStyle(call.outcome)}`}>
                                        {getOutcomeIcon(call.outcome)}
                                        {call.outcome.replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Summary (Truncated) */}
                                <div className="col-span-2 text-xs text-gray-500 truncate">
                                    {call.summary || "No summary available"}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {call.recordingUrl && (
                                    <button 
                                        className="p-1.5 bg-gray-100 hover:bg-brand-black hover:text-white rounded-full text-gray-500 transition"
                                        onClick={(e) => { e.stopPropagation(); /* Play logic */ }}
                                        title="Play Recording"
                                    >
                                        <Play className="w-3 h-3 fill-current" />
                                    </button>
                                )}
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>

      {/* Footer Pagination */}
      <div className="pt-4 border-t border-gray-200 flex justify-between items-center shrink-0 bg-brand-bg">
          <div className="text-xs text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCalls.length)} of {filteredCalls.length} calls
          </div>
          <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                  <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                  Next <ChevronRight className="w-3 h-3" />
              </button>
          </div>
      </div>
    </div>
  );
}

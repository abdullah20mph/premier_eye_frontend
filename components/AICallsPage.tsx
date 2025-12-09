import React, { useState, useMemo, useEffect } from 'react';
import { Lead, CallAttempt } from '../types';
import {
  Search,
  Phone,
  Play,
  Clock,
  Voicemail,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fetchAICallFeed, CallItem as FeedCallItem } from "../services/aiCalls";

type Props = {
  leads: Lead[];
  onSelectLead: (id: string) => void;
};

type CallItem = CallAttempt & {
  leadName: string;
  leadPhone: string;
  leadId: string;
  leadLocation?: string;
  service?: string;
  callUrl?: string;
};

export default function AICallsPage({ leads, onSelectLead }: Props) {
  const [filter, setFilter] = useState<'all' | 'answered' | 'voicemail'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [callsFromBackend, setCallsFromBackend] = useState<FeedCallItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load calls
  useEffect(() => {
    let cancelled = false;
    const TIMEOUT_MS = 5000;

    async function load() {
      try {
        setLoading(true);
        setTimedOut(false);
        const data = await Promise.race([
          fetchAICallFeed(),
          new Promise<FeedCallItem[]>((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
          ),
        ]);
        if (!cancelled) {
          setCallsFromBackend(data);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError("Live call feed is slow to respond. Showing local call attempts.");
          setTimedOut(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  // Merge backend calls
  const allCalls = useMemo(() => {
    if (callsFromBackend.length) {
      return callsFromBackend.map((c: any) => ({
        ...c,
        leadName: c.leadName,
        leadPhone: c.leadPhone,
        leadId: c.leadId,
        leadLocation: c.leadLocation,
        service: c.service,
        recordingUrl: c.recordingUrl,
      })) as CallItem[];
    }

    const calls: CallItem[] = [];
    leads.forEach((lead) => {
      lead.callAttempts.forEach((call) => {
        calls.push({
          ...call,
          leadName: lead.name,
          leadPhone: lead.phone,
          leadId: lead.id,
          leadLocation: lead.location,
        });
      });
    });

    return calls.sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
    );
  }, [callsFromBackend, leads]);

  // Filtering
  const filteredCalls = useMemo(() => {
    return allCalls.filter((call) => {
      const matchesFilter =
        filter === 'all' ? true : call.outcome === filter;

      const matchesSearch =
        call.leadName.toLowerCase().includes(search.toLowerCase()) ||
        call.leadPhone.includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [allCalls, filter, search]);

  // Pagination
  const ITEMS_PER_PAGE = 30;
  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / ITEMS_PER_PAGE));

  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredCalls.slice(start, end);
  }, [filteredCalls, currentPage]);

  // Group by date
  const groupedCalls = useMemo(() => {
    const groups: Record<string, CallItem[]> = {};

    paginatedCalls.forEach((call) => {
      const date = new Date(call.ts);
      let key = format(date, 'MMMM d, yyyy');

      if (isToday(date)) key = "Today";
      if (isYesterday(date)) key = "Yesterday";

      if (!groups[key]) groups[key] = [];
      groups[key].push(call);
    });

    return groups;
  }, [paginatedCalls]);

  const getOutcomeIcon = (outcome?: string | null) => {
    switch (outcome) {
      case 'answered':
        return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'booked':
        return <CheckCircle2 className="w-3 h-3 text-purple-600" />;
      case 'voicemail':
        return <Voicemail className="w-3 h-3 text-orange-600" />;
      default:
        return <XCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getOutcomeStyle = (outcome?: string | null) => {
    switch (outcome) {
      case 'answered':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'booked':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'voicemail':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
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
        {loading && <p className="text-xs text-gray-400 mt-1">Loading calls…</p>}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
            <span>{error} {timedOut ? "(timed out)" : ""}</span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-2 py-1 rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 text-[11px] font-bold"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
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
          className="pl-2 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-blue outline-none cursor-pointer font-medium text-gray-600"
          value={filter}
          onChange={(e) => { setFilter(e.target.value as any); setCurrentPage(1); }}
        >
          <option value="all">All</option>
          <option value="answered">Answered</option>
          <option value="voicemail">Voicemail</option>
        </select>
      </div>
    </div>

    {/* ⭐ SCROLLABLE LIST ONLY */}
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-4">

      {Object.entries(groupedCalls).map(([dateLabel, calls]) => (
        <div key={dateLabel} className="mb-6">

          {/* Date Header */}
          <div className="sticky top-0 bg-brand-bg/95 backdrop-blur-sm z-10 py-2 mb-2 flex items-center gap-2 border-b border-gray-200">
            <Calendar className="w-4 h-4 text-brand-blue" />
            <h3 className="text-sm font-bold text-brand-black uppercase tracking-wider">
              {dateLabel}
            </h3>
          </div>

          {/* Call Rows */}
          <div className="space-y-2">
            {calls.map((call) => (
              <div
                key={`${call.leadId}-${call.id}`}
                onClick={() => onSelectLead(call.leadId)}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md hover:border-brand-blue/30 transition flex items-center gap-4 cursor-pointer"
              >

                {/* Avatar */}
                <div className="h-8 w-8 rounded-full bg-brand-black text-brand-blue flex items-center justify-center text-xs font-bold">
                  {call.leadName?.charAt(0)}
                </div>

                {/* Main Layout */}
                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-4">

                  {/* Lead Basic Info */}
                  <div className="md:w-1/4">
                    <div className="font-bold text-brand-black text-sm truncate">
                      {call.leadName}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      {format(new Date(call.ts), "h:mm a")}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {call.leadLocation && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {call.leadLocation}
                        </div>
                      )}
                      {call.service && (
                        <div className="text-[10px] text-gray-500">• {call.service}</div>
                      )}
                    </div>
                  </div>

                  {/* Outcome */}
                  <div className="md:w-1/6">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit flex items-center gap-1 ${getOutcomeStyle(call.outcome)}`}
                    >
                      {getOutcomeIcon(call.outcome)}
                      {(call.outcome ?? "unknown").replace("_", " ")}
                    </div>
                  </div>

                  {/* Summary (Grows Full space + multi-line) */}
                  <div className="flex-1 text-xs text-gray-500 leading-snug whitespace-normal">
                    {call.summary || "No summary available"}
                  </div>

                </div>

                {/* ⭐ ALWAYS VISIBLE RECORDING BUTTON */}
                <div className="shrink-0">
                  {call.callUrl && (
                    <button
                      className="p-1.5 bg-gray-200 hover:bg-brand-black hover:text-white rounded-full text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(call.callUrl!, "_blank");
                      }}
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      ))}

    </div>

    {/* ⭐ FIXED PAGINATION FOOTER */}
    <div className="py-4 flex justify-between items-center bg-brand-bg border-t border-gray-200">
      <div className="text-xs text-gray-500">Page {currentPage} of {totalPages}</div>

      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold text-gray-600 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold text-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>

  </div>
);
}

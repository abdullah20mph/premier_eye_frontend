import React, { useMemo, useState } from 'react';
import { Lead } from '../types';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
  leads: Lead[];
  onSelect: (id: string) => void;
};

const statusStyles: Record<string, string> = {
  "New": "bg-gray-100 text-gray-700",
  "AI Called – No Answer": "bg-orange-50 text-orange-700",
  "AI Spoke to Lead": "bg-blue-50 text-blue-700",
  "Needs VA Follow-Up": "bg-red-50 text-red-700",
  "Appointment Booked": "bg-emerald-50 text-emerald-700",
  "Appointment Completed": "bg-purple-50 text-purple-700",
  "No Show": "bg-gray-200 text-gray-600",
  "Not Interested": "bg-gray-50 text-gray-400 line-through",
};

export default function LeadTable({ leads, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");

  // ✅ 1) Sort by latest created_at / dateCaptured (DESC)
  const sortedLeads = useMemo(() => {
    if (!leads || leads.length === 0) return [];

    return [...leads].sort((a, b) => {
      const aDateStr = (a as any).created_at || (a as any).dateCaptured;
      const bDateStr = (b as any).created_at || (b as any).dateCaptured;

      const aTime = aDateStr ? new Date(aDateStr).getTime() : 0;
      const bTime = bDateStr ? new Date(bDateStr).getTime() : 0;

      // latest first
      return bTime - aTime;
    });
  }, [leads]);

  // ✅ 2) Apply search + filters on top of the sorted list
  const filtered = useMemo(() => {
    return sortedLeads.filter((l) => {
      const matchesQuery =
        l.name.toLowerCase().includes(query.toLowerCase()) ||
        l.phone.includes(query) ||
        (l.email && l.email.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus = statusFilter === "All" ? true : l.status === statusFilter;
      const matchesSource = sourceFilter === "All" ? true : (l.source || "Unknown") === sourceFilter;

      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [sortedLeads, query, statusFilter, sourceFilter]);

  const statusOptions = Array.from(new Set(leads.map((l) => l.status)));
  const sourceOptions = Array.from(
    new Set(leads.map((l) => l.source || "Unknown").filter(Boolean))
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filter Bar */}
      <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
            placeholder="Search name, phone, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <div className="relative min-w-[140px]">
            <select
              className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-black appearance-none cursor-pointer font-medium text-gray-600"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="All">All Sources</option>
              {sourceOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <select
              className="w-full pl-3 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-black appearance-none cursor-pointer font-medium text-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lead Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Appointment
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((l) => {
              const createdAtStr = (l as any).created_at || (l as any).dateCaptured;
              const createdAtFormatted = createdAtStr
                ? format(new Date(createdAtStr), "MMM d, yyyy '·' h:mm a")
                : null;

              return (
                <tr
                  key={l.id}
                  onClick={() => onSelect(l.id)}
                  className="hover:bg-blue-50/30 transition cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-brand-black text-brand-blue flex items-center justify-center font-bold text-sm shadow-sm">
                        {l.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-brand-black">{l.name}</div>
                          {l.location && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded font-medium">
                              {l.location}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{l.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell font-medium">
                    {l.source || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusStyles[l.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                    {l.appointmentDate ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-medium bg-emerald-50/50 px-2 py-1 rounded-md w-fit">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(l.appointmentDate), "MMM d, h:mm a")}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {createdAtFormatted ? (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{createdAtFormatted}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No leads found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

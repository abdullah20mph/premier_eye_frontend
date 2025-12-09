import React, { useState, useEffect, useMemo } from 'react';
import { Lead } from '../types';
import { MessageSquare, Phone, ChevronRight, MapPin, ChevronLeft, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  leads: Lead[];
  onReview: (id: string) => void;
};

export default function ActionCenter({ leads, onReview }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Sort by latest created_at (fallback to dateCaptured)
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

  // Clamp index if list size changes
  useEffect(() => {
    if (currentIndex >= sortedLeads.length && sortedLeads.length > 0) {
      setCurrentIndex(sortedLeads.length - 1);
    }
  }, [sortedLeads.length, currentIndex]);

  if (sortedLeads.length === 0) return null;

  const lead = sortedLeads[currentIndex];
  if (!lead) return null;

  const lastCall = lead.callAttempts[lead.callAttempts.length - 1];
  const lastMsg = lead.messages[lead.messages.length - 1];

  const nextLead = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sortedLeads.length);
  };

  const prevLead = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + sortedLeads.length) % sortedLeads.length);
  };

  return (
    <section className="mb-6 md:mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/30"></div>
          <h2 className="text-lg font-bold text-brand-black tracking-tight">
            Action Required
          </h2>
          <span className="bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
            {sortedLeads.length} pending
          </span>
        </div>

        {/* Pagination Counter */}
        {sortedLeads.length > 1 && (
          <div className="text-xs font-bold text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
            {currentIndex + 1} / {sortedLeads.length}
          </div>
        )}
      </div>

      {/* Main Card Container with Padding for Arrows */}
      <div className="relative group px-4 md:px-8">
        {/* Navigation Arrows */}
        {sortedLeads.length > 1 && (
          <>
            <button
              onClick={prevLead}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-brand-black text-brand-blue border-2 border-white shadow-xl shadow-gray-300/50 rounded-full p-2.5 hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
              title="Previous Lead"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextLead}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-brand-black text-brand-blue border-2 border-white shadow-xl shadow-gray-300/50 rounded-full p-2.5 hover:scale-110 transition-all flex items-center justify-center cursor-pointer"
              title="Next Lead"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div
          onClick={() => onReview(lead.id)}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-7 cursor-pointer hover:border-brand-blue/30 hover:shadow-md transition-all relative overflow-hidden"
        >
          {/* Top Status Line */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-red-50 text-red-600 uppercase tracking-widest border border-red-100">
              {lead.status.replace('Needs ', '')}
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(
                new Date(lead.callAttempts.length ? lastCall.ts : lead.dateCaptured),
                { addSuffix: true }
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Lead Identity */}
            <div className="lg:col-span-4 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
              <h3 className="text-2xl md:text-3xl font-bold text-brand-black mb-2 tracking-tight">{lead.name}</h3>
              <div className="text-sm md:text-base text-gray-600 font-medium mb-4">{lead.phone}</div>

              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-gray-400 font-medium">
                {lead.location && (
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-gray-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{lead.location}</span>
                  </div>
                )}
                <span>{lead.source || 'Unknown Source'}</span>
              </div>
            </div>

            {/* Context / Summary */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Call Context */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Phone className="w-3.5 h-3.5" /> AI Summary
                </div>
                <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-gray-100 pl-3 py-1">
                  {lastCall?.summary || (
                    <span className="text-gray-400 italic">No call summary available.</span>
                  )}
                </p>
              </div>

              {/* Message Context */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                  <MessageSquare className="w-3.5 h-3.5" /> Latest Reply
                </div>
                <div className="text-sm text-brand-black font-medium italic leading-relaxed relative bg-gray-50 p-3 rounded-lg border border-gray-100">
                  "{lastMsg ? lastMsg.text : 'No messages'}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

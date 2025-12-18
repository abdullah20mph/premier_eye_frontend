
import React, { useState, useEffect } from 'react';
import { Lead, InsuranceOption, LeadStatus, LocationOptions, LocationOption } from '../types';
import { X, Calendar as CalendarIcon, DollarSign, Phone, Mail, User, FileText, MessageSquare, PlayCircle, ChevronLeft, ChevronRight, Clock, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, setHours, setMinutes, isToday } from 'date-fns';
import { createAppointmentFromLead } from "../services/appointments";

type Props = {
    lead: Lead;
    onClose: () => void;
    onSave: (patch: Partial<Lead>) => void;
};

export default function LeadDetailModal({ lead, onClose, onSave }: Props) {
    const [draft, setDraft] = useState<Partial<Lead>>({});
    const [customInsurance, setCustomInsurance] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Calendar State
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        setDraft({
            insurance: lead.insurance ?? null,
            dob: lead.dob ?? undefined,
            status: lead.status,
            appointmentDate: lead.appointmentDate ?? null,
            service: lead.service ?? null,
            saleAmount: lead.saleAmount ?? null,
            notes: lead.notes ?? "",
            name: lead.name,
            email: lead.email,
            location: lead.location,
            callSummary: lead.callSummary ?? null,
        });
        if (lead.insurance && !InsuranceOption.includes(lead.insurance as any)) {
            setCustomInsurance(true);
        }
        if (lead.appointmentDate) {
            setViewDate(new Date(lead.appointmentDate));
        }
    }, [lead]);

    const last5Msgs = [...lead.messages].slice(-5);

    const handleSave = async () => {
        // 1) Update local React state (so UI stays in sync immediately)
        onSave(draft);

        // 2) Try to sync with backend (but only for real DB leads)
        try {
            await createAppointmentFromLead(lead, draft);
        } catch (err) {
            console.error("Failed to create/update appointment on backend", err);
            // You can add a toast later if you want, but we don't change the UI now
        }

        // 3) Close modal
        onClose();
    };


    // Calendar Helpers
    const daysInMonth = eachDayOfInterval({
        start: startOfWeek(startOfMonth(viewDate)),
        end: endOfWeek(endOfMonth(viewDate))
    });

    const timeSlots = [];
    for (let i = 8; i <= 18; i++) { // 8 AM to 6 PM
        timeSlots.push({ h: i, m: 0 });
        timeSlots.push({ h: i, m: 30 });
    }

    const handleDateClick = (day: Date) => {
        const current = draft.appointmentDate ? new Date(draft.appointmentDate) : new Date();
        // Keep current time, change date
        const newDate = new Date(day);
        newDate.setHours(current.getHours(), current.getMinutes());
        setDraft(s => ({ ...s, appointmentDate: newDate.toISOString() }));
    };

    const handleTimeClick = (h: number, m: number) => {
        const current = draft.appointmentDate ? new Date(draft.appointmentDate) : new Date();
        const newDate = new Date(current);
        newDate.setHours(h, m);
        setDraft(s => ({ ...s, appointmentDate: newDate.toISOString() }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 p-0 ">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Panel - Full screen on mobile, Card on desktop */}
            <div className={`relative bg-[#F2F5F7] shadow-2xl w-full ${isFullScreen ? "h-[100dvh] max-w-none sm:max-h-none sm:rounded-none" : "max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"} flex flex-col overflow-hidden border border-white/50 transition-all duration-200`}>

                {/* Header */}
                <div className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-white border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-brand-black flex items-center justify-center text-brand-blue text-lg sm:text-2xl font-bold shadow-md shrink-0">
                            {lead.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-2xl font-bold text-brand-black truncate">{lead.name}</h2>

                            {/* Highlighted Contact Badges */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                                <a
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-1.5 bg-blue-400 text-white rounded-lg shadow-sm hover:bg-blue-500 transition no-underline group"
                                    title="Click to call"
                                >
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                                    <span className="font-bold text-xs sm:text-lg tracking-wide">{lead.phone}</span>
                                </a>

                                {lead.email && (
                                    <a
                                        href={`mailto:${lead.email}`}
                                        className="hidden sm:flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-brand-black text-brand-blue rounded-lg shadow-sm hover:bg-gray-900 transition no-underline"
                                        title="Click to email"
                                    >
                                        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="font-medium text-xs sm:text-sm">{lead.email}</span>
                                    </a>
                                )}

                                {lead.location && (
                                    <div className="flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-1.5 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{lead.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullScreen((v) => !v)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition shrink-0"
                            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
                        >
                            {isFullScreen ? <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition shrink-0"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Forms & Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Personal & Insurance */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-5 text-brand-black font-bold text-lg">
                                    <div className="p-1.5 bg-brand-blue/20 rounded-lg"><User className="w-5 h-5 text-brand-black" /></div>
                                    <h3>Personal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                                        <input
                                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black"
                                            value={draft.name || ''}
                                            onChange={e => setDraft(s => ({ ...s, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
                                        <select
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black"
                                            value={draft.location || ''}
                                            onChange={e => setDraft(s => ({ ...s, location: e.target.value as LocationOption }))}
                                        >
                                            <option value="">Select Location</option>
                                            {LocationOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date of Birth</label>
                                        {/* Highlighted DOB Field */}
                                        <input
                                            className="w-full px-3 py-2.5 bg-blue-400 text-white font-bold placeholder-white/70 border-transparent rounded-lg focus:ring-2 focus:ring-brand-black outline-none transition"
                                            placeholder="MM/DD/YYYY"
                                            value={draft.dob || ''}
                                            onChange={e => setDraft(s => ({ ...s, dob: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Insurance</label>
                                        <select
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black"
                                            value={customInsurance ? "Other" : (draft.insurance || '')}
                                            onChange={e => {
                                                if (e.target.value === "Other") {
                                                    setCustomInsurance(true);
                                                    setDraft(s => ({ ...s, insurance: "" }));
                                                } else {
                                                    setCustomInsurance(false);
                                                    setDraft(s => ({ ...s, insurance: e.target.value || null }));
                                                }
                                            }}
                                        >
                                            <option value="">Select Insurance</option>
                                            {InsuranceOption.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {customInsurance && (
                                            <input
                                                className="mt-2 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black animate-in fade-in slide-in-from-top-1"
                                                placeholder="Enter provider name"
                                                value={draft.insurance || ''}
                                                onChange={e => setDraft(s => ({ ...s, insurance: e.target.value }))}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Outcome */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-5 text-brand-black font-bold text-lg">
                                    <div className="p-1.5 bg-brand-blue/20 rounded-lg"><CalendarIcon className="w-5 h-5 text-brand-black" /></div>
                                    <h3>Appointment Scheduling</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
                                    {/* Calendar Widget */}
                                    <div className="md:col-span-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-gray-200 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                                            <div className="font-bold text-brand-black">{format(viewDate, 'MMMM yyyy')}</div>
                                            <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-gray-200 rounded-full"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                                        </div>
                                        <div className="grid grid-cols-7 text-center gap-1">
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                <div key={d} className="text-xs font-bold text-gray-400 mb-2">{d}</div>
                                            ))}
                                            {daysInMonth.map((day) => {
                                                const isSelected = draft.appointmentDate && isSameDay(new Date(draft.appointmentDate), day);
                                                const isCurrentMonth = isSameMonth(day, viewDate);
                                                const isTodayDate = isToday(day);

                                                return (
                                                    <button
                                                        key={day.toString()}
                                                        onClick={() => handleDateClick(day)}
                                                        className={`
                                                    h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-sm font-medium transition relative mx-auto
                                                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-brand-blue/20'}
                                                    ${isSelected ? 'bg-brand-blue text-brand-black font-bold shadow-md' : ''}
                                                    ${isTodayDate && !isSelected ? 'ring-1 ring-brand-blue text-brand-blue' : ''}
                                                `}
                                                    >
                                                        {format(day, 'd')}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Slot Widget */}
                                    <div className="md:col-span-2 flex flex-col">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                            <Clock className="w-4 h-4" /> Available Times
                                        </div>
                                        <div className="flex-1 overflow-y-auto max-h-[200px] sm:max-h-[280px] custom-scrollbar bg-gray-50 rounded-xl border border-gray-200 p-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                {timeSlots.map(({ h, m }) => {
                                                    const timeLabel = format(setMinutes(setHours(new Date(), h), m), 'h:mm a');
                                                    const isSelected = draft.appointmentDate
                                                        ? new Date(draft.appointmentDate).getHours() === h && new Date(draft.appointmentDate).getMinutes() === m
                                                        : false;

                                                    return (
                                                        <button
                                                            key={`${h}-${m}`}
                                                            onClick={() => handleTimeClick(h, m)}
                                                            className={`
                                                        px-2 py-2 text-xs font-bold rounded-lg border transition
                                                        ${isSelected
                                                                    ? 'bg-brand-black text-brand-blue border-brand-black shadow-sm'
                                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-brand-blue hover:text-brand-blue'}
                                                    `}
                                                        >
                                                            {timeLabel}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lower Form Fields */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-100 pt-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Status</label>
                                        <select
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition font-medium text-brand-black"
                                            value={draft.status}
                                            onChange={e => setDraft(s => ({ ...s, status: e.target.value as LeadStatus }))}
                                        >
                                            <option>New</option>
                                            <option>AI Called – No Answer</option>
                                            <option>AI Spoke to Lead</option>
                                            <option>Needs VA Follow-Up</option>
                                            <option>Appointment Booked</option>
                                            <option>Appointment Completed</option>
                                            <option>No Show</option>
                                            <option>Not Interested</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Selected Time</label>
                                        <div className="px-3 py-2.5 bg-blue-50 border border-blue-100 text-brand-black font-bold rounded-lg flex items-center gap-2 text-sm">
                                            <CalendarIcon className="w-4 h-4 text-brand-blue shrink-0" />
                                            {draft.appointmentDate
                                                ? format(new Date(draft.appointmentDate), "MMM d, h:mm a")
                                                : <span className="text-gray-400 font-normal">Select date & time above</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Service Type</label>
                                        <select
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black"
                                            value={draft.service || ''}
                                            onChange={e => setDraft(s => ({ ...s, service: e.target.value || null }))}
                                        >
                                            <option value="">Select Service</option>
                                            <option>Comprehensive Exam</option>
                                            <option>Contact Lens Fitting</option>
                                            <option>Dry Eye Treatment</option>
                                            <option>LASIK Consult</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sale Value ($)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black font-medium"
                                                value={draft.saleAmount ?? ''}
                                                onChange={e => setDraft(s => ({ ...s, saleAmount: e.target.value ? Number(e.target.value) : null }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-brand-black font-bold text-lg">
                                    <div className="p-1.5 bg-brand-blue/20 rounded-lg"><FileText className="w-5 h-5 text-brand-black" /></div>
                                    <h3>Staff Notes</h3>
                                </div>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-brand-black leading-relaxed resize-none"
                                    placeholder="Add internal notes here..."
                                    value={draft.notes || ''}
                                    onChange={e => setDraft(s => ({ ...s, notes: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Right Column: Communication History */}
                        <div className="space-y-6">

                            {/* Call Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-brand-black font-bold">
                                        <Phone className="w-5 h-5" />
                                        <h3>Call Summary</h3>
                                    </div>
                                    
                                </div>
                                {lead.callSummary ? (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 leading-relaxed">
                                        {lead.callSummary}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic text-center py-4">
                                        No call summary recorded.
                                    </div>
                                )}
                            </div>

                            {/* AI Calls */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-brand-black font-bold">
                                        <Phone className="w-5 h-5" />
                                        <h3>AI Calls</h3>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                        {lead.callAttempts.length}/10 attempts
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {lead.callAttempts.length === 0 && (
                                        <div className="text-sm text-gray-400 italic text-center py-4">No calls recorded.</div>
                                    )}
                                    {lead.callAttempts.map(c => {
                                        // ensure we always have some string
                                        const outcome = c.outcome ?? "unknown";

                                        const summaryText = c.summary
                                            ? c.summary
                                            : outcome === "voicemail"
                                                ? "Left voicemail."
                                                : outcome === "no_response"
                                                    ? "No answer from lead."
                                                    : "Call logged.";

                                        return (
                                            <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span
                                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide ${outcome === "answered" || outcome === "booked"
                                                                ? "bg-green-100 text-green-700"
                                                                : outcome === "voicemail"
                                                                    ? "bg-orange-100 text-orange-700"
                                                                    : "bg-gray-200 text-gray-600"
                                                            }`}
                                                    >
                                                        {outcome.replace("_", " ")}
                                                    </span>
                                                    {c.ts && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {format(new Date(c.ts), "MMM d, h:mm a")}
                                                        </span>
                                                    )}
                                                </div>

                                                {c.recordingUrl && (
                                                    <div className="mb-3 bg-white rounded-md border border-gray-200 p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition group shadow-sm">
                                                        <div className="bg-brand-black p-1.5 rounded-full group-hover:scale-110 transition">
                                                            <PlayCircle className="w-4 h-4 text-brand-blue" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs font-bold text-brand-black">Play Recording</div>
                                                            {c.durationSec && (
                                                                <div className="text-[10px] text-gray-400">
                                                                    {Math.floor(c.durationSec / 60)}:
                                                                    {(c.durationSec % 60).toString().padStart(2, "0")} duration
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-600 leading-relaxed">
                                                    <span className="font-bold text-brand-black block mb-0.5">Summary:</span>
                                                    {summaryText}
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col h-[380px]">
                                <div className="flex items-center gap-2 mb-4 text-brand-black font-bold shrink-0">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    <h3>WhatsApp</h3>
                                </div>
                                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 bg-[#f4f7f9] bg-opacity-50 p-3 rounded-lg border border-gray-100">
                                    {lead.messages.length === 0 && (
                                        <div className="text-sm text-gray-400 italic text-center py-4">No messages yet.</div>
                                    )}
                                    {last5Msgs.map(m => (
                                        <div key={m.id} className={`flex ${m.from === 'lead' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${m.from === 'lead' ? 'bg-brand-blue text-brand-black rounded-tr-none font-medium' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                                                <p>{m.text}</p>
                                                <p className="text-[10px] opacity-60 mt-1 text-right">{format(new Date(m.ts), "h:mm a")}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 shrink-0">
                                    <button className="w-full py-2 text-sm font-bold text-brand-black bg-gray-50 hover:bg-gray-100 rounded-lg transition">
                                        View Full Chat
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-brand-black font-bold">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <h3>Last Email</h3>
                                </div>
                                {lead.lastEmail ? (
                                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <div className="text-sm font-bold text-brand-black">{lead.lastEmail.subject}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">{format(new Date(lead.lastEmail.ts), "MMM d")}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${lead.lastEmail.opened ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                                {lead.lastEmail.opened ? 'Opened' : 'Sent'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic text-center">No email history.</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 shrink-0 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <div className="text-xs text-gray-400 hidden sm:block">
                        Changes are auto-saved to local state.
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-full border border-gray-300 text-brand-black font-bold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 sm:flex-none px-6 py-3 sm:py-2.5 rounded-full bg-brand-blue text-brand-black font-bold shadow-sm hover:bg-blue-300 transition transform active:scale-[0.98]"
                        >
                            Save changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

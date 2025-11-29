import React, { useMemo, useEffect, useState } from 'react';
import { Lead, LeadStatus } from './types';
import { leadsSeed } from './services/mockData';
import MetricsHeader from './components/MetricsHeader';
import LeadTable from './components/LeadTable';
import LeadDetailModal from './components/LeadDetailModal';
import ActionCenter from './components/ActionCenter';
import LeadsBoard from './components/LeadsBoard';
import AICallsPage from './components/AICallsPage';
import WhatsAppPage from './components/WhatsAppPage';
import AppointmentsPage from './components/AppointmentsPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';
import { fetchActionRequiredLeads } from "./services/overviewApi";
import { fetchRecentActivityLeads } from './services/dashboard';
import {
  fetchSalesPipeline,
  updateLeadPipelineStage,
  mapStatusToStage,
} from "./services/salesPipeline";

type View = 'dashboard' | 'leads' | 'calls' | 'whatsapp' | 'appointments' | 'reports' | 'settings';

function mergeLeads(existing: Lead[], incoming: Lead[]): Lead[] {
  const map = new Map<string, Lead>();

  for (const l of existing) map.set(l.id, l);
  for (const l of incoming) {
    const prev = map.get(l.id);
    map.set(l.id, prev ? { ...prev, ...l } : l);
  }

  return Array.from(map.values());
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(leadsSeed);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // 🔵 optional: keep track of pipeline load error if you want
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  // Desktop Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Mobile Sidebar State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  const updateLead = (id: string, patch: Partial<Lead>) => {
    // main list used by pipeline, etc.
    setLeads((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

    // list used by ActionCenter (dashboard)
    setAlertLeads((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

    // list used by Recent Activity table
    setRecentLeads((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };


  // 🔵 this is the IMPORTANT one: update status + pipeline_stage (DB)
  const updateLeadStatus = async (id: string, newStatus: LeadStatus) => {
    const stage = mapStatusToStage(newStatus);

    // optimistic UI update across ALL lists
    updateLead(id, {
      status: newStatus,
      pipelineStage: stage ?? undefined,
    });

    if (!stage) return;

    try {
      await updateLeadPipelineStage(id, stage);
    } catch (err) {
      console.error("Failed to update pipeline_stage", err);
      setPipelineError("Failed to sync pipeline stage with server");
    }
  };



  // ---------- ACTION REQUIRED (alert) LEADS ----------
  const [alertLeads, setAlertLeads] = useState<Lead[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      try {
        setAlertsLoading(true);
        setAlertsError(null);

        const data = await fetchActionRequiredLeads();
        if (!cancelled) {
          setAlertLeads(data);
          setLeads((prev) => mergeLeads(prev, data));
        }
      } catch (err: any) {
        console.error("Failed to load action-required leads", err);
        if (!cancelled) setAlertsError("Failed to load action-required leads");
      } finally {
        if (!cancelled) setAlertsLoading(false);
      }
    }

    loadAlerts();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- RECENT ACTIVITY LEADS ----------
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRecent() {
      try {
        setRecentLoading(true);
        const data = await fetchRecentActivityLeads();
        if (!cancelled) {
          setRecentLeads(data);
          setRecentError(null);
          setLeads((prev) => mergeLeads(prev, data));
        }
      } catch (err: any) {
        console.error("Failed to load recent activity", err);
        if (!cancelled) setRecentError("Failed to load recent activity");
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    }

    loadRecent();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- 🔵 SALES PIPELINE (KANBAN) ----------
  useEffect(() => {
    let cancelled = false;

    async function loadPipeline() {
      try {
        setPipelineError(null);
        const pipelineLeads = await fetchSalesPipeline();
        if (!cancelled) {
          // merge into main leads array, so board + modal see the same objects
          setLeads((prev) => mergeLeads(prev, pipelineLeads));
        }
      } catch (err) {
        console.error("Failed to fetch sales pipeline", err);
        if (!cancelled) setPipelineError("Failed to load sales pipeline");
      }
    }

    loadPipeline();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- METRICS ----------
  const metrics = useMemo(() => {
    const total = leads.length;
    const newToday = leads.filter(l => isSameDay(parseISO(l.dateCaptured), new Date())).length;
    const booked = leads.filter((l) => l.status === "Appointment Booked").length;
    const completed = leads.filter((l) => l.status === "Appointment Completed").length;
    const revenue = leads.reduce((s, l) => s + (l.saleAmount || 0), 0);
    const callsMade = leads.reduce((s, l) => s + l.callAttempts.length, 0);
    const callsAnswered = leads.reduce((s, l) => s + l.callAttempts.filter((c) => c.outcome === "answered").length, 0);
    const whatsappTotal = leads.reduce((s, l) => s + l.messages.length, 0);

    return { total, newToday, booked, completed, revenue, callsMade, callsAnswered, whatsappTotal };
  }, [leads]);

  const handleNavClick = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans text-brand-text overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-black text-white z-40 flex items-center justify-between px-4 shadow-md">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavClick('dashboard')}
        >
          <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-brand-black font-bold shadow-lg">A</div>
          <span className="font-bold text-lg tracking-tight">Agentum</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-brand-black text-white flex flex-col border-r border-gray-800 shadow-2xl transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} 
          w-64 transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white text-brand-black border border-gray-200 shadow-lg rounded-full p-1.5 hover:bg-gray-50 transition-all hover:scale-110 z-50 focus:outline-none"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-6 flex flex-col h-full">
          {/* Desktop Header */}
          <div
            className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} mb-8 h-10 transition-all cursor-pointer`}
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 min-w-[2rem] bg-brand-blue rounded-full flex items-center justify-center text-brand-black font-bold shrink-0 shadow-lg shadow-brand-blue/20">
                A
              </div>
              <span
                className={`font-bold text-xl tracking-tight text-white whitespace-nowrap transition-all duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}
              >
                Agentum
              </span>
            </div>
          </div>

          {/* Mobile Sidebar Header */}
          <div className="md:hidden flex items-center justify-between mb-8">
            <span className="font-bold text-xl text-white">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400"><X size={20} /></button>
          </div>

          <nav className="space-y-1 flex-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => handleNavClick('dashboard')} collapsed={isSidebarCollapsed} />
            <NavItem icon={Users} label="Leads Pipeline" active={currentView === 'leads'} onClick={() => handleNavClick('leads')} collapsed={isSidebarCollapsed} />
            <NavItem icon={Phone} label="AI Sales Calls" active={currentView === 'calls'} onClick={() => handleNavClick('calls')} collapsed={isSidebarCollapsed} />
            <NavItem icon={MessageCircle} label="WhatsApp" active={currentView === 'whatsapp'} onClick={() => handleNavClick('whatsapp')} collapsed={isSidebarCollapsed} />
            <NavItem icon={Calendar} label="Appointments" active={currentView === 'appointments'} onClick={() => handleNavClick('appointments')} collapsed={isSidebarCollapsed} />
            <NavItem icon={BarChart3} label="Reports" active={currentView === 'reports'} onClick={() => handleNavClick('reports')} collapsed={isSidebarCollapsed} />
            <NavItem icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => handleNavClick('settings')} collapsed={isSidebarCollapsed} />
          </nav>

          {/* User Profile Footer */}
          <div className={`mt-auto pt-6 border-t border-gray-800`}>
            <div className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
              <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" alt="User" className="w-8 h-8" />
              </div>
              <div className={`overflow-hidden animate-in fade-in duration-300 ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                <div className="text-sm font-semibold text-white truncate">Dr. Smith</div>
                <div className="text-xs text-gray-400 truncate">Optometrist</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          flex-1 h-[100dvh] overflow-hidden flex flex-col transition-all duration-300 ease-in-out
          pt-16 md:pt-0
          ml-0 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          p-4 md:p-8 
        `}
      >
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar pb-20">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl font-bold text-brand-black">Overview</h1>
              <div className="text-xs md:text-sm text-gray-500">Last updated: Just now</div>
            </div>

            <ActionCenter leads={alertLeads} onReview={setSelectedLeadId} />

            <MetricsHeader metrics={metrics} />

            <div className="mt-8 md:mt-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                <h2 className="text-lg md:text-xl font-bold text-brand-black">Recent Activity</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="w-full sm:w-auto text-center text-sm font-semibold text-brand-black bg-white px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition shadow-sm">
                    Export CSV
                  </button>
                </div>
              </div>
              <LeadTable
                leads={recentLeads.length ? recentLeads : leads}
                onSelect={(id) => setSelectedLeadId(id)}
              />
            </div>
          </div>
        )}

        {/* LEADS PIPELINE VIEW */}
        {currentView === 'leads' && (
          <LeadsBoard
            leads={leads}
            onUpdateStatus={updateLeadStatus}   // 🔵 now updates DB too
            onSelectLead={setSelectedLeadId}   // clicking card opens modal
          />
        )}

        {/* AI CALLS VIEW */}
        {currentView === 'calls' && (
          <AICallsPage
            leads={leads}
            onSelectLead={setSelectedLeadId}
          />
        )}

        {/* WHATSAPP VIEW */}
        {currentView === 'whatsapp' && (
          <WhatsAppPage
            leads={leads}
            onUpdateLead={updateLead}
            onLeadInfo={setSelectedLeadId}
          />
        )}

        {/* APPOINTMENTS VIEW */}
        {currentView === 'appointments' && (
          <AppointmentsPage
            leads={leads}
            onSelectLead={setSelectedLeadId}
          />
        )}

        {/* REPORTS VIEW */}
        {currentView === 'reports' && (
          <ReportsPage
            leads={leads}
          />
        )}

        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
          <SettingsPage />
        )}

      </main>

      {/* Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onSave={(patch) => updateLead(selectedLead.id, patch)}
        />
      )}

    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  collapsed,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-left ${active ? 'bg-gray-800 text-brand-blue' : 'text-gray-400 hover:text-white hover:bg-gray-900'
        } ${collapsed ? 'md:justify-center' : ''}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className={`whitespace-nowrap overflow-hidden text-ellipsis animate-in fade-in duration-200 ${collapsed ? 'md:hidden' : 'block'}`}>
        {label}
      </span>
    </button>
  );
}

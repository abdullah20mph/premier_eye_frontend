import React, { useState, useMemo, useEffect } from "react";
import { Lead } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
  startOfDay,
  addDays,
  subDays,
  setHours,
  getHours,
  getMinutes,
  isWithinInterval,
  endOfDay,
} from "date-fns";
import { fetchAllAppointments } from "../services/appointmentsFeed";

type Props = {
  leads: Lead[];
  onSelectLead: (id: string) => void;
};

type CalendarView = "month" | "week";

type AppointmentUI = {
  appointmentId: string;   // row id from appointments table
  leadId: string;          // linked premier.id
  name: string;
  phone: string;
  location: string;
  status: string;          // SCHEDULED / PENDING_CONFIRMATION / ...
  date: Date;              // JS Date of scheduled_at
};

export default function AppointmentsPage({ leads, onSelectLead }: Props) {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // ---- Load appointments from backend ----
  const [appointments, setAppointments] = useState<AppointmentUI[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const apps = await fetchAllAppointments();

        setAppointments(
          (apps || []).map((a: any) => ({
            appointmentId: String(a.id),
            leadId: String(a.lead_id),
            name: a.lead?.lead_name ?? "Unknown",
            phone: a.lead?.lead_number ?? "",
            location: a.lead?.location_preference ?? "",
            status: a.status ?? "",
            date: parseISO(a.scheduled_at),
          }))
        );
      } catch (err) {
        console.error("Failed to load appointments feed", err);
      }
    })();
  }, []);

  // ---- Metrics (based on appointments, not leads) ----
  const metrics = useMemo(() => {
    const scheduled = appointments.filter((a) => a.status === "SCHEDULED").length;
    const pending = appointments.filter(
      (a) => a.status === "PENDING_CONFIRMATION"
    ).length;
    const noShows = appointments.filter((a) => a.status === "NO_SHOW").length;
    const completed = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;
    return { scheduled, pending, noShows, completed };
  }, [appointments]);

  // ---- Upcoming 7 Days (from appointments feed) ----
  const upcomingAppointments = useMemo(() => {
    const start = startOfDay(new Date());
    const end = endOfDay(addDays(new Date(), 7));

    return appointments
      .filter((app) => isWithinInterval(app.date, { start, end }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [appointments]);

  // ---- Navigation ----
  const nextPeriod = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 7));
  };

  const prevPeriod = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 7));
  };

  const today = () => setCurrentDate(new Date());

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar pb-20">
      {/* Top Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <MetricCard
          label="Scheduled Upcoming"
          value={metrics.scheduled}
          icon={CalendarIcon}
          color="bg-brand-blue text-brand-black"
        />
        <MetricCard
          label="Pending Confirmation"
          value={metrics.pending}
          icon={Clock}
          color="bg-orange-100 text-orange-700"
        />
        <MetricCard
          label="No Shows (All Time)"
          value={metrics.noShows}
          icon={XCircle}
          color="bg-red-100 text-red-700"
        />
        <MetricCard
          label="Completed (All Time)"
          value={metrics.completed}
          icon={CheckCircle2}
          color="bg-green-100 text-green-700"
        />
      </div>

      {/* Upcoming 7 Days Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon className="w-5 h-5 text-brand-black" />
          <h3 className="text-lg font-bold text-brand-black">Upcoming 7 Days</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-2">
            {upcomingAppointments.length} appointments
          </span>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="text-sm text-gray-400 italic py-4">
            No appointments scheduled for the next week.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {upcomingAppointments.map((app) => (
              <div
                key={app.appointmentId}
                onClick={() => onSelectLead(app.leadId)}
                className="min-w-[240px] p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-brand-blue hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isToday(app.date)
                        ? "bg-brand-blue text-brand-black"
                        : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    {isToday(app.date)
                      ? "Today"
                      : format(app.date, "EEE, MMM d")}
                  </span>
                  <span className="text-xs font-bold text-brand-black group-hover:text-brand-blue transition">
                    {format(app.date, "h:mm a")}
                  </span>
                </div>
                <div className="font-bold text-sm text-brand-black truncate mb-1">
                  {app.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{app.location || "No Location"}</span>
                </div>
              </div>
            ))}
            <div className="min-w-[40px] flex items-center justify-center opacity-20">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-200 shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-brand-black w-48">
            {view === "month"
              ? format(currentDate, "MMMM yyyy")
              : `Week of ${format(startOfWeek(currentDate), "MMM d")}`}
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                view === "month"
                  ? "bg-white shadow-sm text-brand-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                view === "week"
                  ? "bg-white shadow-sm text-brand-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Week
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 mr-2"
          >
            Today
          </button>
          <button
            onClick={prevPeriod}
            className="p-1.5 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPeriod}
            className="p-1.5 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 min-h-[500px] overflow-y-auto custom-scrollbar">
        {view === "month" ? (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            onSelectLead={onSelectLead}
          />
        ) : (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onSelectLead={onSelectLead}
          />
        )}
      </div>
    </div>
  );
}

/* --- Sub Components --- */

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className={`p-4 rounded-xl flex items-center justify-between ${color}`}>
      <div>
        <div className="text-[10px] font-bold uppercase opacity-70 mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function MonthView({
  currentDate,
  appointments,
  onSelectLead,
}: {
  currentDate: Date;
  appointments: AppointmentUI[];
  onSelectLead: (id: string) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col">
      {/* Week Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weeks.map((w) => (
          <div
            key={w}
            className="py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows">
        {days.map((day) => {
          const dayApps = appointments.filter((a) => isSameDay(a.date, day));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`
                min-h-[80px] border-b border-r border-gray-100 p-1 transition hover:bg-gray-50
                ${!isCurrentMonth ? "bg-gray-50/30" : ""}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`
                  text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full
                  ${
                    isTodayDate
                      ? "bg-brand-blue text-brand-black font-bold"
                      : isCurrentMonth
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                `}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {dayApps.map((app) => (
                  <button
                    key={app.appointmentId}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(app.leadId);
                    }}
                    className={`
                      w-full text-left text-[9px] p-1 rounded font-medium truncate border-l-2 transition-all hover:scale-[1.02] hover:shadow-md flex flex-col gap-0.5
                      ${
                        app.status === "NO_SHOW"
                          ? "bg-red-50 border-red-500 text-red-700 hover:bg-red-100"
                          : app.status === "COMPLETED"
                          ? "bg-gray-100 border-gray-500 text-gray-600 hover:bg-gray-200"
                          : "bg-brand-blue text-brand-black border-brand-black hover:bg-blue-300"
                      }
                    `}
                    title={`${format(app.date, "h:mm a")} - ${app.name} (${
                      app.location || "No Location"
                    })`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="opacity-75 font-mono text-[8px] shrink-0">
                        {format(app.date, "h:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                       <span className="opacity-75 font-mono text-[8px] shrink-0">{format(app.date, 'h:mm a')}</span>
                    </div>
                    <span className="truncate font-bold">{app.name}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  currentDate,
  appointments,
  onSelectLead,
}: {
  currentDate: Date;
  appointments: AppointmentUI[];
  onSelectLead: (id: string) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM

  return (
    <div className="h-full flex flex-col overflow-auto custom-scrollbar">
      {/* Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 min-w-[800px]">
        <div className="py-2 text-center text-xs text-gray-400 border-r border-gray-100 sticky left-0 bg-white z-10">
          Time
        </div>
        {days.map((day) => (
          <div
            key={day.toString()}
            className={`py-2 text-center border-r border-gray-100 ${
              isToday(day) ? "bg-blue-50/30" : ""
            }`}
          >
            <div className="text-[10px] font-bold text-gray-500 uppercase">
              {format(day, "EEE")}
            </div>
            <div
              className={`text-sm font-bold ${
                isToday(day) ? "text-brand-blue" : "text-brand-black"
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 min-w-[800px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 min-h-[60px]">
            {/* Time Label */}
            <div className="border-r border-b border-gray-100 p-2 text-[10px] text-gray-400 text-right sticky left-0 bg-white">
              {format(setHours(new Date(), hour), "h a")}
            </div>

            {/* Columns */}
            {days.map((day) => {
              const cellApps = appointments.filter(
                (a) => isSameDay(a.date, day) && getHours(a.date) === hour
              );

              return (
                <div
                  key={day.toString()}
                  className="border-r border-b border-gray-100 relative p-1 hover:bg-gray-50 transition"
                >
                  {cellApps.map((app) => (
                    <button
                      key={app.appointmentId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(app.leadId);
                      }}
                      className={`
                           absolute inset-x-1 rounded-md p-1 text-left cursor-pointer border-l-4 shadow-sm z-10 hover:z-20 hover:shadow-lg transition-all
                           flex flex-col justify-center
                           ${
                             app.status === "NO_SHOW"
                               ? "bg-red-100 border-red-500 text-red-800"
                               : "bg-brand-blue text-brand-black border-brand-black"
                           }
                        `}
                      style={{
                        top: `${(getMinutes(app.date) / 60) * 100}%`,
                        height: "50px",
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 opacity-70" />
                        <span className="truncate font-extrabold text-[10px]">
                          {app.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {app.location && (
                          <span className="text-[8px] opacity-80 truncate">
                            {app.location}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

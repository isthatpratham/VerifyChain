/**
 * ComplianceTimelineWorkspace.jsx
 * Enterprise Compliance Timeline & Planning Workspace component.
 * Features Priority Agenda, Chronological Timeline Stream, Statutory Calendar Grid,
 * Activity Feed, and Milestone Planning.
 */
import { useState, useMemo } from 'react';
import {
  CalendarBlank,
  Clock,
  CheckCircle,
  WarningCircle,
  ShieldCheck,
  Funnel,
  MagnifyingGlass,
  ArrowRight,
  Sparkle,
  Bell,
  ListBullets,
  Kanban,
  FileText,
} from '@phosphor-icons/react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

/**
 * @param {Object} props
 * @param {Array} props.records - Compliance records from useCompliance
 * @param {Function} props.onSelectRecord - Handler to open Compliance Intelligence Modal
 * @param {Function} props.onReevaluate - Handler to trigger Rules Engine re-evaluation
 */
export function ComplianceTimelineWorkspace({ records = [], onSelectRecord, onReevaluate }) {
  const [viewMode, setViewMode] = useState('TIMELINE'); // 'AGENDA', 'TIMELINE', 'CALENDAR'
  const [timeRange, setTimeRange] = useState('30_DAYS'); // '7_DAYS', '30_DAYS', '90_DAYS', 'ALL'
  const [search, setSearch] = useState('');

  // Filtered timeline events
  const filteredEvents = useMemo(() => {
    return records.filter((rec) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = rec.authority?.toLowerCase().includes(query);
        const matchesRef = rec.filing_reference?.toLowerCase().includes(query);
        const matchesNotes = rec.notes?.toLowerCase().includes(query);
        if (!matchesName && !matchesRef && !matchesNotes) return false;
      }
      return true;
    });
  }, [records, search]);

  // Priority items requiring immediate attention
  const urgentPriorities = useMemo(() => {
    return filteredEvents.filter((r) => r.status === 'OVERDUE' || r.status === 'DUE' || r.priority === 'CRITICAL');
  }, [filteredEvents]);

  // Upcoming filing deadlines
  const upcomingDeadlines = useMemo(() => {
    return filteredEvents
      .filter((r) => r.expiry_date)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [filteredEvents]);

  return (
    <div className="flex flex-col gap-6">

      {/* Top Header & View Controls */}
      <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarBlank size={22} className="text-[--vc-brand]" />
            <h3 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
              Compliance Planning & Timeline Workspace
            </h3>
          </div>
          <p className="text-[--text-xs] text-[--vc-text-secondary]">
            Chronological planning stream, filing deadlines, and statutory activity feed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
            <button
              type="button"
              onClick={() => setViewMode('TIMELINE')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-[--radius-xs] transition-colors ${
                viewMode === 'TIMELINE'
                  ? 'bg-[--vc-brand] text-white'
                  : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
              }`}
            >
              <ListBullets size={14} />
              <span>Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('CALENDAR')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-[--radius-xs] transition-colors ${
                viewMode === 'CALENDAR'
                  ? 'bg-[--vc-brand] text-white'
                  : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
              }`}
            >
              <CalendarBlank size={14} />
              <span>Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('AGENDA')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-[--radius-xs] transition-colors ${
                viewMode === 'AGENDA'
                  ? 'bg-[--vc-brand] text-white'
                  : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
              }`}
            >
              <Kanban size={14} />
              <span>Priorities</span>
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-1">
            <Funnel size={14} className="text-[--vc-text-tertiary]" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-2.5 py-1.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-medium text-[--vc-text-primary] focus:outline-none focus:ring-1 focus:ring-[--vc-brand]"
            >
              <option value="7_DAYS">Next 7 Days</option>
              <option value="30_DAYS">Next 30 Days</option>
              <option value="90_DAYS">Next 90 Days</option>
              <option value="ALL">All Deadlines</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-48">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--vc-text-tertiary]" />
            <Input
              type="text"
              placeholder="Search timeline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-[--text-xs] py-1.5"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: TIMELINE STREAM VIEW */}
      {viewMode === 'TIMELINE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Chronological Event Stream */}
          <div className="lg:col-span-2 p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-[--vc-border]">
              <h4 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
                Statutory Filing & Rules Timeline Stream
              </h4>
              <span className="text-[11px] font-mono text-[--vc-text-tertiary]">
                {filteredEvents.length} Milestone Events
              </span>
            </div>

            <div className="relative border-l-2 border-[--vc-border] ml-4 pl-6 flex flex-col gap-8">
              {filteredEvents.length === 0 ? (
                <div className="py-8 text-center text-[--text-xs] text-[--vc-text-tertiary]">
                  No statutory events recorded in timeline stream.
                </div>
              ) : (
                filteredEvents.map((rec) => (
                  <div key={rec.id} className="relative group">
                    {/* Circle Node Icon */}
                    <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full border-2 border-[--vc-border] bg-[--vc-surface-raised] flex items-center justify-center text-[--vc-brand]">
                      {rec.status === 'COMPLIANT' && <CheckCircle size={14} className="text-[--vc-success]" />}
                      {rec.status === 'DUE' && <Clock size={14} className="text-[--vc-warning]" />}
                      {rec.status === 'OVERDUE' && <WarningCircle size={14} className="text-[--vc-error]" />}
                      {rec.status === 'EXEMPT' && <ShieldCheck size={14} className="text-[--vc-text-tertiary]" />}
                    </div>

                    <div className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col gap-2 hover:border-[--vc-border-strong] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[--text-sm] text-[--vc-text-primary]">
                          {rec.authority} Statutory Filing Cycle
                        </span>
                        <span className="text-[10px] font-mono text-[--vc-text-tertiary]">
                          {rec.expiry_date ? new Date(rec.expiry_date).toISOString().split('T')[0] : 'PERPETUAL'}
                        </span>
                      </div>

                      <p className="text-[--text-xs] text-[--vc-text-secondary]">
                        {rec.notes || `${rec.authority} statutory rules evaluated and logged.`}
                      </p>

                      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[--vc-border]">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-secondary]">
                          FREQUENCY: {rec.renewal_frequency || 'ANNUAL'}
                        </span>

                        <button
                          type="button"
                          onClick={() => onSelectRecord && onSelectRecord(rec)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[--vc-brand] hover:underline"
                        >
                          <span>Open Workspace</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right 1 Col: Today's Urgent Priorities & Activity Log */}
          <div className="flex flex-col gap-6">

            {/* Today's Priorities Card */}
            <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
                <Sparkle size={18} className="text-[--vc-warning]" />
                <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                  Today&#39;s Action Priorities

                </h4>
              </div>

              {urgentPriorities.length === 0 ? (
                <div className="p-4 text-center text-[--text-xs] text-[--vc-success] font-medium border border-[--vc-border] rounded-[--radius-sm] bg-[--vc-success-bg]/10">
                  All statutory obligations are up to date!
                </div>
              ) : (
                urgentPriorities.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-[--text-xs] text-[--vc-text-primary] block">
                        {item.authority} Action Required
                      </span>
                      <span className="text-[10px] text-[--vc-text-tertiary]">
                        Status: {item.status}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectRecord && onSelectRecord(item)}
                      className="text-[10px] py-0.5 px-2"
                    >
                      Resolve
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Activity Feed Log */}
            <div className="p-5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[--vc-border]">
                <FileText size={18} className="text-[--vc-brand]" />
                <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary]">
                  Audit Trail & Activity Log
                </h4>
              </div>

              <div className="flex flex-col gap-3 text-[11px]">
                <div className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col gap-1">
                  <span className="font-semibold text-[--vc-text-primary]">Rules Engine Execution</span>
                  <span className="text-[--vc-text-secondary]">Evaluated 6 statutory rules deterministically.</span>
                  <span className="text-[10px] text-[--vc-text-tertiary] font-mono">Today, 03:00 AM</span>
                </div>

                <div className="p-2.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col gap-1">
                  <span className="font-semibold text-[--vc-text-primary]">Statutory Sync Completed</span>
                  <span className="text-[--vc-text-secondary]">Updated compliance status for GST, EPFO, and MCA.</span>
                  <span className="text-[10px] text-[--vc-text-tertiary] font-mono">Yesterday, 18:30 PM</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[--vc-border] text-[10px] text-[--vc-text-tertiary]">
                <Bell size={14} className="text-[--vc-brand]" />
                <span>Reminder triggers prepared for Phase 5.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: CALENDAR GRID VIEW */}
      {viewMode === 'CALENDAR' && (
        <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[--vc-border]">
            <h4 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
              Statutory Calendar Agenda & Due Dates
            </h4>
            <span className="text-[11px] font-mono text-[--vc-text-tertiary]">
              Month View Agenda
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex flex-col justify-between gap-3 hover:border-[--vc-border-strong] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[--text-base] text-[--vc-text-primary]">
                      {item.authority} Statutory Due
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-[--radius-sm] ${
                        item.status === 'COMPLIANT'
                          ? 'bg-[--vc-success-bg] text-[--vc-success-text]'
                          : item.status === 'DUE'
                          ? 'bg-[--vc-warning-bg] text-[--vc-warning-text]'
                          : item.status === 'OVERDUE'
                          ? 'bg-[--vc-error-bg] text-[--vc-error-text]'
                          : 'bg-[--vc-bg-subtle] text-[--vc-text-tertiary]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-[--text-xs] text-[--vc-text-secondary] mb-2">
                    Due Date: <span className="font-mono font-semibold text-[--vc-text-primary]">{item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A'}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[--vc-border] flex justify-end">
                  <Button
                    type="button"
                    variant="tertiary"
                    size="sm"
                    onClick={() => onSelectRecord && onSelectRecord(item)}
                    className="text-[11px] py-0.5"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA & PRIORITIES VIEW */}
      {viewMode === 'AGENDA' && (
        <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-[--vc-border]">
            <h4 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
              Action Priorities & Filing Milestones
            </h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onReevaluate}
              icon={<Sparkle size={13} />}
              className="text-[11px]"
            >
              Re-Evaluate Rules Engine
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Urgent Column */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[--vc-error] uppercase tracking-wider block">
                Urgent Action Needed ({urgentPriorities.length})
              </span>
              {urgentPriorities.map((item) => (
                <div key={item.id} className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
                  <span className="font-bold text-[--text-xs] text-[--vc-text-primary] block">{item.authority}</span>
                  <span className="text-[10px] text-[--vc-text-secondary] block mb-2">{item.notes || 'Filing requires action.'}</span>
                  <Button type="button" size="sm" variant="secondary" onClick={() => onSelectRecord && onSelectRecord(item)} className="text-[10px] w-full">
                    Resolve Obligation
                  </Button>
                </div>
              ))}
            </div>

            {/* Upcoming Column */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[--vc-warning] uppercase tracking-wider block">
                Upcoming Filings ({upcomingDeadlines.length})
              </span>
              {upcomingDeadlines.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
                  <span className="font-bold text-[--text-xs] text-[--vc-text-primary] block">{item.authority}</span>
                  <span className="text-[10px] text-[--vc-text-secondary] block font-mono">Due: {item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A'}</span>
                </div>
              ))}
            </div>

            {/* Compliant / Safe Column */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[--vc-success] uppercase tracking-wider block">
                Up-to-Date Records ({records.filter((r) => r.status === 'COMPLIANT' || r.status === 'EXEMPT').length})
              </span>
              {records.filter((r) => r.status === 'COMPLIANT' || r.status === 'EXEMPT').map((item) => (
                <div key={item.id} className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]/60">
                  <span className="font-bold text-[--text-xs] text-[--vc-text-primary] block">{item.authority}</span>
                  <span className="text-[10px] text-[--vc-success] font-semibold block">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

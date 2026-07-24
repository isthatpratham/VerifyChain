/**
 * ComplianceWorkspace.jsx
 * Enterprise Compliance Workspace component.
 * Central workspace for monitoring compliance health intelligence, status, explanations, search, filtering,
 * Compliance Intelligence Workspace integration, Timeline & Planning Workspace,
 * and executing Rules Engine evaluations.
 */
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MagnifyingGlass,
  Funnel,
  ArrowClockwise,
  Info,
  CalendarCheck,
  CheckCircle,
  Clock,
  WarningCircle,
  Prohibit,
  Article,
  CalendarBlank,
  Table as TableIcon,
  Heartbeat,
} from '@phosphor-icons/react';
import { useCompliance } from '../../hooks/useCompliance';
import { useMsmeProfile } from '../../hooks/useMsmeProfile';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../ui/Table';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { RuleExplanationModal } from './RuleExplanationModal';
import { ComplianceIntelligenceModal } from './ComplianceIntelligenceModal';
import { ComplianceTimelineWorkspace } from './ComplianceTimelineWorkspace';
import { ComplianceHealthWorkspace } from './ComplianceHealthWorkspace';

export function ComplianceWorkspace() {
  const {
    records,
    metrics,
    loading,
    evaluating,
    error,
    fetchRecords,
    evaluateRules,
    getExplanation,
  } = useCompliance();

  const { profile } = useMsmeProfile();

  const [activeTab, setActiveTab] = useState('HEALTH'); // 'HEALTH', 'RECORDS', or 'TIMELINE'

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [authorityFilter, setAuthorityFilter] = useState('ALL');

  // Decision Explanation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState(null);
  const [explanationData, setExplanationData] = useState([]);

  // Compliance Intelligence Workspace Modal State
  const [intelModalOpen, setIntelModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'ALL') params.status = statusFilter;
    if (authorityFilter !== 'ALL') params.authority = authorityFilter;
    if (search.trim()) params.search = search.trim();
    fetchRecords(params);
  }, [fetchRecords, statusFilter, authorityFilter, search]);

  const handleOpenExplanation = async (authority) => {
    setSelectedAuthority(authority);
    const data = await getExplanation(authority);
    setExplanationData(data);
    setModalOpen(true);
  };

  const handleOpenIntelligence = async (record) => {
    setSelectedRecord(record);
    const data = await getExplanation(record.authority);
    setExplanationData(data);
    setIntelModalOpen(true);
  };

  const handleReevaluate = async () => {
    try {
      await evaluateRules();
    } catch (err) {
      console.error('Re-evaluation error:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[10px] font-semibold">
            <CheckCircle size={12} />
            <span>COMPLIANT</span>
          </span>
        );
      case 'DUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[--radius-sm] bg-[--vc-warning-bg] text-[--vc-warning-text] text-[10px] font-semibold">
            <Clock size={12} />
            <span>DUE SOON</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[--radius-sm] bg-[--vc-error-bg] text-[--vc-error-text] text-[10px] font-semibold">
            <WarningCircle size={12} />
            <span>OVERDUE</span>
          </span>
        );
      case 'EXEMPT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-tertiary] text-[10px] font-semibold">
            <Prohibit size={12} />
            <span>EXEMPT</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Main Workspace Navigation Switcher */}
      <div className="flex items-center justify-between p-1.5 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('HEALTH')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[--radius-sm] text-[--text-xs] font-bold transition-colors ${
              activeTab === 'HEALTH'
                ? 'bg-[--vc-brand] text-white shadow-sm'
                : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
            }`}
          >
            <Heartbeat size={16} />
            <span>Compliance Health Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECORDS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[--radius-sm] text-[--text-xs] font-bold transition-colors ${
              activeTab === 'RECORDS'
                ? 'bg-[--vc-brand] text-white shadow-sm'
                : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
            }`}
          >
            <TableIcon size={16} />
            <span>Statutory Records Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TIMELINE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-[--radius-sm] text-[--text-xs] font-bold transition-colors ${
              activeTab === 'TIMELINE'
                ? 'bg-[--vc-brand] text-white shadow-sm'
                : 'text-[--vc-text-secondary] hover:text-[--vc-text-primary]'
            }`}
          >
            <CalendarBlank size={16} />
            <span>Timeline & Planning Workspace</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 text-[11px] font-mono text-[--vc-text-tertiary]">
          <span>VerifyChain v1.0.0</span>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Compliance Workspace Error">
          {error}
        </Alert>
      )}

      {/* TAB 1: COMPLIANCE HEALTH INTELLIGENCE WORKSPACE */}
      {activeTab === 'HEALTH' && <ComplianceHealthWorkspace />}

      {/* TAB 2: STATUTORY RECORDS WORKSPACE */}
      {activeTab === 'RECORDS' && (
        <>
          {/* Overview Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
              <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider block">Total Obligations</span>
              <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-primary] mt-1 block">{metrics.total}</span>
            </div>

            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
              <span className="text-[10px] font-bold text-[--vc-success] uppercase tracking-wider block">Compliant</span>
              <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-success] mt-1 block">{metrics.compliant}</span>
            </div>

            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
              <span className="text-[10px] font-bold text-[--vc-warning] uppercase tracking-wider block">Due Soon</span>
              <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-warning] mt-1 block">{metrics.due}</span>
            </div>

            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
              <span className="text-[10px] font-bold text-[--vc-error] uppercase tracking-wider block">Overdue</span>
              <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-error] mt-1 block">{metrics.overdue}</span>
            </div>

            <div className="p-4 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
              <span className="text-[10px] font-bold text-[--vc-text-tertiary] uppercase tracking-wider block">Exempt</span>
              <span className="font-[--font-heading] text-[--text-2xl] font-bold text-[--vc-text-tertiary] mt-1 block">{metrics.exempt}</span>
            </div>
          </div>

          {/* Main Table Container */}
          <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">

            {/* Toolbar & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--vc-border]">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <ShieldCheck size={20} className="text-[--vc-brand]" />
                  <h3 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
                    Compliance Workspace Records
                  </h3>
                </div>
                <p className="text-[--text-xs] text-[--vc-text-secondary]">
                  Active statutory filing status across six regulatory frameworks
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-56">
                  <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--vc-text-tertiary]" />
                  <Input
                    type="text"
                    placeholder="Search filings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-[--text-xs] py-1.5"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  <Funnel size={14} className="text-[--vc-text-tertiary]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-medium text-[--vc-text-primary] focus:outline-none focus:ring-1 focus:ring-[--vc-brand]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="COMPLIANT">Compliant</option>
                    <option value="DUE">Due Soon</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>

                {/* Authority Filter */}
                <select
                  value={authorityFilter}
                  onChange={(e) => setAuthorityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-medium text-[--vc-text-primary] focus:outline-none focus:ring-1 focus:ring-[--vc-brand]"
                >
                  <option value="ALL">All Authorities</option>
                  <option value="GST">GST</option>
                  <option value="EPFO">EPFO</option>
                  <option value="ESIC">ESIC</option>
                  <option value="MCA">MCA</option>
                  <option value="UDYAM">Udyam</option>
                  <option value="FSSAI">FSSAI</option>
                </select>

                {/* Re-evaluate Trigger */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={evaluating}
                  onClick={handleReevaluate}
                  icon={<ArrowClockwise size={13} />}
                  className="text-[11px]"
                >
                  Re-Evaluate Rules
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Authority</Th>
                    <Th>Status</Th>
                    <Th>Priority</Th>
                    <Th>Next Expiry / Due</Th>
                    <Th>Filing Reference</Th>
                    <Th align="right">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {loading ? (
                    <Tr>
                      <Td colSpan={6} className="py-8 text-center text-[--text-xs] text-[--vc-text-tertiary]">
                        Loading compliance workspace records...
                      </Td>
                    </Tr>
                  ) : records.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} className="py-8 text-center text-[--text-xs] text-[--vc-text-tertiary]">
                        No compliance records match your current filters.
                      </Td>
                    </Tr>
                  ) : (
                    records.map((rec) => (
                      <Tr key={rec.id}>
                        <Td className="font-bold text-[--vc-text-primary]">{rec.authority}</Td>
                        <Td>{getStatusBadge(rec.status)}</Td>
                        <Td>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-secondary]">
                            {rec.priority || 'MEDIUM'}
                          </span>
                        </Td>
                        <Td className="font-mono text-[--vc-text-primary]">
                          {rec.expiry_date ? (
                            <span className="flex items-center gap-1.5">
                              <CalendarCheck size={13} className="text-[--vc-brand]" />
                              <span>{new Date(rec.expiry_date).toISOString().split('T')[0]}</span>
                            </span>
                          ) : (
                            <span className="text-[--vc-text-tertiary]">N/A</span>
                          )}
                        </Td>
                        <Td className="font-mono text-[--vc-text-tertiary] text-[11px]">
                          {rec.filing_reference || 'REF-STD-SYNC'}
                        </Td>
                        <Td align="right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              icon={<Article size={13} />}
                              onClick={() => handleOpenIntelligence(rec)}
                              className="text-[11px] py-1"
                            >
                              Intelligence Workspace
                            </Button>
                            <Button
                              type="button"
                              variant="tertiary"
                              size="sm"
                              icon={<Info size={13} />}
                              onClick={() => handleOpenExplanation(rec.authority)}
                              className="text-[11px] py-1"
                            >
                              Explain
                            </Button>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>

          </div>
        </>
      )}

      {/* TAB 3: TIMELINE & PLANNING WORKSPACE */}
      {activeTab === 'TIMELINE' && (
        <ComplianceTimelineWorkspace
          records={records}
          onSelectRecord={handleOpenIntelligence}
          onReevaluate={handleReevaluate}
        />
      )}

      {/* Decision Explanation Modal */}
      <RuleExplanationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        authority={selectedAuthority}
        explanations={explanationData}
      />

      {/* Compliance Intelligence Workspace Modal */}
      <ComplianceIntelligenceModal
        open={intelModalOpen}
        onClose={() => setIntelModalOpen(false)}
        record={selectedRecord}
        profile={profile}
        explanations={explanationData}
      />
    </div>
  );
}

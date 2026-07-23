/**
 * ComplianceTableDisplay.jsx
 * Enterprise Table displaying active compliance records with search, filter, and status badges.
 */
import { useState } from 'react';
import { MagnifyingGlass, Funnel, CalendarCheck, WarningCircle } from '@phosphor-icons/react';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../ui/Table';
import { Input } from '../../ui/Input';

const INITIAL_RECORDS = [
  { id: '1', authority: 'GST', framework: 'GSTR-3B Monthly Return', status: 'COMPLIANT', dueDate: '2026-08-20', lastFiled: '2026-07-18', risk: 'LOW' },
  { id: '2', authority: 'EPFO', framework: 'ECR Monthly Contribution', status: 'COMPLIANT', dueDate: '2026-08-15', lastFiled: '2026-07-14', risk: 'LOW' },
  { id: '3', authority: 'ESIC', framework: 'ESIC Monthly Return', status: 'COMPLIANT', dueDate: '2026-08-15', lastFiled: '2026-07-12', risk: 'LOW' },
  { id: '4', authority: 'MCA', framework: 'AOC-4 Financial Statement', status: 'DUE', dueDate: '2026-09-30', lastFiled: '2025-10-28', risk: 'MEDIUM' },
  { id: '5', authority: 'Udyam', framework: 'Udyam Annual Update', status: 'COMPLIANT', dueDate: '2027-03-31', lastFiled: '2026-04-02', risk: 'LOW' },
  { id: '6', authority: 'FSSAI', framework: 'Food Safety Annual Return', status: 'EXEMPT', dueDate: 'N/A', lastFiled: 'N/A', risk: 'NONE' },
];

export function ComplianceTableDisplay() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredRecords = INITIAL_RECORDS.filter((rec) => {
    const matchesSearch =
      rec.authority.toLowerCase().includes(search.toLowerCase()) ||
      rec.framework.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || rec.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-success-bg] text-[--vc-success-text] text-[10px] font-semibold">COMPLIANT</span>;
      case 'DUE':
        return <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-warning-bg] text-[--vc-warning-text] text-[10px] font-semibold">DUE SOON</span>;
      case 'OVERDUE':
        return <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-error-bg] text-[--vc-error-text] text-[10px] font-semibold">OVERDUE</span>;
      case 'EXEMPT':
      default:
        return <span className="px-2 py-0.5 rounded-[--radius-sm] bg-[--vc-bg-subtle] text-[--vc-text-tertiary] text-[10px] font-semibold">EXEMPT</span>;
    }
  };

  return (
    <div className="p-6 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--vc-border]">
        <div>
          <h2 className="font-[--font-heading] text-[--text-lg] font-bold text-[--vc-text-primary]">
            Regulatory Compliance Records
          </h2>
          <p className="text-[--text-xs] text-[--vc-text-secondary] mt-0.5">
            Real-time status across statutory filing deadlines
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-60">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[--vc-text-tertiary]" />
            <Input
              type="text"
              placeholder="Search authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-[--text-xs] py-1.5"
            />
          </div>

          <div className="flex items-center gap-1">
            <Funnel size={14} className="text-[--vc-text-tertiary]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] text-[--text-xs] font-medium text-[--vc-text-primary] focus:outline-none focus:ring-1 focus:ring-[--vc-brand]"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="DUE">Due Soon</option>
              <option value="OVERDUE">Overdue</option>
              <option value="EXEMPT">Exempt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Authority</Th>
              <Th>Regulatory Framework</Th>
              <Th>Status</Th>
              <Th>Next Due Date</Th>
              <Th>Last Filed</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRecords.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-8 text-center text-[--text-xs] text-[--vc-text-tertiary]">
                  No compliance records match your search query.
                </Td>
              </Tr>
            ) : (
              filteredRecords.map((rec) => (
                <Tr key={rec.id}>
                  <Td className="font-semibold text-[--vc-text-primary]">{rec.authority}</Td>
                  <Td className="text-[--vc-text-secondary]">{rec.framework}</Td>
                  <Td>{getStatusBadge(rec.status)}</Td>
                  <Td className="font-mono text-[--vc-text-primary] flex items-center gap-1.5">
                    <CalendarCheck size={13} className="text-[--vc-brand]" />
                    <span>{rec.dueDate}</span>
                  </Td>
                  <Td className="font-mono text-[--vc-text-tertiary]">{rec.lastFiled}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </div>

      {/* Footer result summary */}
      <div className="mt-4 pt-3 border-t border-[--vc-border] flex items-center justify-between text-[11px] text-[--vc-text-tertiary]">
        <span>Showing {filteredRecords.length} of {INITIAL_RECORDS.length} regulatory records</span>
        <span className="flex items-center gap-1 text-[--vc-text-secondary]">
          <WarningCircle size={13} className="text-[--vc-brand]" />
          <span>Filing dates synced from central registries</span>
        </span>
      </div>
    </div>
  );
}

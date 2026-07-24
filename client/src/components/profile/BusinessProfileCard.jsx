/**
 * BusinessProfileCard.jsx
 * Enterprise MSME Profile Overview Card.
 */
import { Buildings, PencilSimple, MapPin, Users } from '@phosphor-icons/react';

import { Button } from '../../ui/Button';

export function BusinessProfileCard({ profile, onEdit }) {
  if (!profile) return null;

  return (
    <div className="p-6 sm:p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] mb-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[--vc-border] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base] flex items-center justify-center text-[--vc-brand]">
            <Buildings size={22} />
          </div>
          <div>
            <h2 className="font-[--font-heading] text-[--text-xl] font-bold text-[--vc-text-primary]">
              {profile.businessName}
            </h2>
            <p className="text-[--text-xs] text-[--vc-text-secondary] mt-0.5">
              {profile.businessType} • {profile.sector}
            </p>
          </div>
        </div>

        {onEdit && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onEdit}
            icon={<PencilSimple size={14} />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Identifiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider block">
            GSTIN Identifier
          </span>
          <span className="font-mono text-[--text-sm] font-bold text-[--vc-text-primary] block mt-1">
            {profile.gstin}
          </span>
        </div>

        <div className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <span className="text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider block">
            Udyam Reg. Number
          </span>
          <span className="font-mono text-[--text-sm] font-bold text-[--vc-text-primary] block mt-1">
            {profile.udyamNumber}
          </span>
        </div>

        <div className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            <MapPin size={12} className="text-[--vc-brand]" />
            <span>Jurisdiction</span>
          </div>
          <span className="text-[--text-sm] font-semibold text-[--vc-text-primary] block mt-1">
            {profile.district}, {profile.state}
          </span>
        </div>

        <div className="p-3.5 rounded-[--radius-sm] border border-[--vc-border] bg-[--vc-bg-base]">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[--vc-text-tertiary] uppercase tracking-wider">
            <Users size={12} className="text-[--vc-brand]" />
            <span>Workforce</span>
          </div>
          <span className="text-[--text-sm] font-semibold text-[--vc-text-primary] block mt-1">
            {profile.employeeCount} Members
          </span>
        </div>
      </div>

      {/* Address Details */}
      {profile.address && (
        <div className="mt-4 pt-4 border-t border-[--vc-border] text-[--text-xs] text-[--vc-text-secondary]">
          <span className="font-semibold text-[--vc-text-primary]">Registered Operating Address: </span>
          <span>{profile.address}, {profile.pincode}</span>
        </div>
      )}
    </div>
  );
}

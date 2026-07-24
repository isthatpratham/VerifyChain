/**
 * CategoryHealthGrid.jsx
 * Grid display of scoring categories (TAX, LABOUR, CORPORATE, LICENSING)
 * Redesigned with unified enterprise cards, soft borders, and clean status indicators.
 */
import { Stack, Article, Users, Buildings, Certificate } from '@phosphor-icons/react';

const CATEGORY_META = {
  TAX: { name: 'Tax Compliance', icon: Article, desc: 'GST returns & tax settlements' },
  LABOUR: { name: 'Labour & Social Security', icon: Users, desc: 'EPFO & ESIC statutory compliance' },
  CORPORATE: { name: 'Corporate Compliance', icon: Buildings, desc: 'MCA filings & statutory returns' },
  LICENSING: { name: 'Licensing & Registrations', icon: Certificate, desc: 'Udyam & FSSAI licenses' },
};

export function CategoryHealthGrid({ categories = {} }) {
  const categoryKeys = Object.keys(categories).length > 0 ? Object.keys(categories) : ['TAX', 'LABOUR', 'CORPORATE', 'LICENSING'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Stack size={20} className="text-[--vc-brand]" />
        <h3 className="font-[--font-heading] text-[--text-base] font-bold text-[--vc-text-primary]">
          Category Score Breakdown
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryKeys.map((code) => {
          const catData = categories[code] || { score: 100, totalItems: 0, compliantCount: 0, dueCount: 0, overdueCount: 0 };
          const meta = CATEGORY_META[code] || { name: code, icon: Stack, desc: 'Statutory compliance' };
          const IconComp = meta.icon;

          const scoreColor = catData.score < 70 ? 'text-[--vc-error]' : catData.score < 90 ? 'text-[--vc-warning]' : 'text-[--vc-success]';
          const barColor = catData.score < 70 ? 'bg-[--vc-error]' : catData.score < 90 ? 'bg-[--vc-warning]' : 'bg-[--vc-success]';

          return (
            <div key={code} className="rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised] p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-[--radius-sm] bg-[--vc-bg-base] text-[--vc-brand] border border-[--vc-border]">
                    <IconComp size={18} />
                  </div>
                  <span className={`text-xl font-bold font-mono ${scoreColor}`}>{catData.score} / 100</span>
                </div>

                <h4 className="font-[--font-heading] text-[--text-sm] font-bold text-[--vc-text-primary] mt-3">{meta.name}</h4>
                <p className="text-[--text-xs] text-[--vc-text-secondary] mt-0.5 truncate">{meta.desc}</p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[--vc-bg-base] border border-[--vc-border] overflow-hidden mb-3">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${catData.score}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[--vc-border] text-[10px] text-center font-mono font-bold">
                  <div className="bg-[--vc-success-bg] text-[--vc-success-text] py-1 rounded-[--radius-sm] border border-[--color-success-100]">
                    {catData.compliantCount || 0} OK
                  </div>
                  <div className="bg-[--vc-warning-bg] text-[--vc-warning-text] py-1 rounded-[--radius-sm] border border-[--color-warning-100]">
                    {catData.dueCount || 0} Due
                  </div>
                  <div className="bg-[--vc-error-bg] text-[--vc-error-text] py-1 rounded-[--radius-sm] border border-[--color-error-100]">
                    {catData.overdueCount || 0} Late
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

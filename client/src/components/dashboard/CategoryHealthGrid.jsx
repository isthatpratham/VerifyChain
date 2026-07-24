/**
 * CategoryHealthGrid.jsx
 * Grid display of scoring categories (TAX, LABOUR, CORPORATE, LICENSING)
 * with individual score breakdowns and filing status counts.
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
        <Stack size={20} className="text-emerald-400" />
        <h3 className="text-base font-semibold text-neutral-100">Category Score Breakdown</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryKeys.map((code) => {
          const catData = categories[code] || { score: 100, totalItems: 0, compliantCount: 0, dueCount: 0, overdueCount: 0 };
          const meta = CATEGORY_META[code] || { name: code, icon: Stack, desc: 'Statutory compliance' };
          const IconComp = meta.icon;

          const scoreColor = catData.score < 70 ? 'text-red-400' : catData.score < 90 ? 'text-amber-400' : 'text-emerald-400';
          const barColor = catData.score < 70 ? 'bg-red-500' : catData.score < 90 ? 'bg-amber-500' : 'bg-emerald-500';

          return (
            <div key={code} className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                    <IconComp size={16} className="text-emerald-400" />
                  </div>
                  <span className={`text-xl font-bold font-mono ${scoreColor}`}>{catData.score} / 100</span>
                </div>

                <h4 className="text-sm font-semibold text-neutral-200 mt-3">{meta.name}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{meta.desc}</p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden mb-3">
                  <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${catData.score}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-neutral-800/60 text-[10px] text-center">
                  <div className="bg-emerald-500/10 text-emerald-400 py-1 rounded border border-emerald-500/20 font-mono">
                    {catData.compliantCount || 0} OK
                  </div>
                  <div className="bg-amber-500/10 text-amber-400 py-1 rounded border border-amber-500/20 font-mono">
                    {catData.dueCount || 0} Due
                  </div>
                  <div className="bg-red-500/10 text-red-400 py-1 rounded border border-red-500/20 font-mono">
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

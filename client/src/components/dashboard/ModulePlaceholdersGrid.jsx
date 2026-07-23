export function ModulePlaceholdersGrid() {
  const modules = [
    {
      title: 'Compliance Status & Health Score',
      description: 'Authority breakdown (GST, EPFO, ESIC, MCA, Udyam, FSSAI) and 0-100 Compliance Health Score.',
      status: 'Coming Soon in Phase 4',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      title: 'Verified Supplier Card & QR Code',
      description: 'Public shareable supplier verification card with QR code for buyers and procurement teams.',
      status: 'Coming Soon in Phase 5',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      title: 'Compliance Alert Engine',
      description: 'Automated 30/15/7-day email and in-app renewal warning notifications.',
      status: 'Coming Soon in Phase 6',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      title: 'Government Scheme Matcher',
      description: 'AI-assisted matching of your MSME profile against active government schemes.',
      status: 'Coming Soon in Phase 7',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      title: 'Document Vault',
      description: 'Secure storage for compliance certificates, licenses, and official documents.',
      status: 'Coming Soon in Phase 8',
      badgeColor: 'bg-slate-100 text-slate-800',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Modules & Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between opacity-90"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-bold text-gray-900">{mod.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${mod.badgeColor}`}>
                  {mod.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{mod.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                disabled
                className="text-xs font-semibold text-gray-400 cursor-not-allowed"
              >
                Module In Development
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

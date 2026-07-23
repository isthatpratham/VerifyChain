export function BusinessProfileCard({ profile, onEdit }) {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{profile.businessName}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active Profile
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {profile.sector} · {profile.district}, {profile.state}
          </p>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-brand border border-brand rounded-lg hover:bg-brand/5 focus:outline-none transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            GSTIN
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1 font-mono">
            {profile.gstin}
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Udyam Number
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1 font-mono">
            {profile.udyamNumber}
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Business Type
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1">
            {profile.businessType}
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Employees
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1">
            {profile.employeeCount} Members
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Annual Turnover
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1">
            {profile.annualTurnoverLakh !== null ? `₹ ${profile.annualTurnoverLakh} Lakhs` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Food Business
          </span>
          <span className="block text-sm font-medium text-gray-900 mt-1">
            {profile.isFoodBusiness ? 'Yes (FSSAI Applicable)' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}

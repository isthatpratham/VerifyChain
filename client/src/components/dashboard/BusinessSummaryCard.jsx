import { Link } from 'react-router-dom';

export function BusinessSummaryCard({ profile, verificationStatus }) {
  if (!profile) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Complete Your MSME Business Profile</h2>
          <p className="text-sm text-gray-600 mt-1">
            Register your business parameters, GSTIN, and Udyam details to unlock compliance intelligence.
          </p>
        </div>
        <Link
          to="/profile"
          className="px-6 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-light rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          Setup Profile Now →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{profile.businessName}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {profile.sector} · {profile.district}, {profile.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Verification Status:</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            {verificationStatus || 'VERIFIED'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase">GSTIN</span>
          <span className="block text-sm font-semibold text-gray-900 mt-1 font-mono">{profile.gstin}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase">Udyam No</span>
          <span className="block text-sm font-semibold text-gray-900 mt-1 font-mono">{profile.udyamNumber}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase">Business Type</span>
          <span className="block text-sm font-semibold text-gray-900 mt-1">{profile.businessType}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold text-gray-400 uppercase">Employees</span>
          <span className="block text-sm font-semibold text-gray-900 mt-1">{profile.employeeCount} Members</span>
        </div>
      </div>
    </div>
  );
}

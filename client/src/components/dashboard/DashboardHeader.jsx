import { Link } from 'react-router-dom';

export function DashboardHeader({ userName, businessName, lastSync }) {
  const formattedSync = lastSync
    ? new Date(lastSync).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Not synced yet';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good day, {userName || 'Business Owner'}
        </h1>
        {businessName && (
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Managing <span className="text-brand font-semibold">{businessName}</span>
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          Last sync: {formattedSync}
        </span>
        <Link
          to="/profile"
          className="px-4 py-2 text-xs font-semibold text-brand border border-brand rounded-lg hover:bg-brand/5 transition-colors"
        >
          Manage Profile
        </Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold text-brand">VerifyChain</Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-brand">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-brand">Dashboard</Link>
              <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-brand">Business Profile</Link>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-red-600 hover:underline focus:outline-none"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-brand">Login</Link>
              <Link to="/register" className="text-sm font-medium text-brand hover:underline">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

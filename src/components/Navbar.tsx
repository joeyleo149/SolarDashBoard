import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, loading, loginWithGoogle, logout } = useAuth()

  return (
    <nav className="w-full border-b border-slate-200 bg-white px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="text-lg font-semibold text-slate-900">Solar Dashboard</div>

        <div>
          {loading ? (
            <div className="text-sm text-slate-600">Checking auth...</div>
          ) : user ? (
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || 'avatar'} className="h-8 w-8 rounded-full" />
              )}
              <span className="text-sm text-slate-700">{user.displayName || user.email}</span>
              <button
                className="ml-2 rounded-md bg-rose-500 px-3 py-1 text-sm font-medium text-white"
                onClick={() => void logout()}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-slate-900"
              onClick={() => void loginWithGoogle()}
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-float delay-500" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl text-center">
          <div className="relative neo-card-glass p-8 sm:p-12 neo-shadow-lg">
            <h1 className="neo-heading text-6xl text-white mb-4">404</h1>
            <p className="text-lg text-white/80 mb-2">Page Not Found</p>
            <p className="text-sm text-white/60 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="neo-btn-primary px-6 py-3.5 inline-flex items-center justify-center gap-2">
                Go Home
              </Link>
              <Link href="/search" className="neo-btn-secondary px-6 py-3.5 inline-flex items-center justify-center gap-2">
                Browse Trucks
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6">
        <p className="text-center text-sm text-white/30" suppressHydrationWarning>
          &copy; {new Date().getFullYear()} FleetFeast. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

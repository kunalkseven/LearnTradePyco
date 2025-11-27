import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  title: string
  description?: string
  highlight?: string
  children: ReactNode
  footer?: ReactNode
  sideTitle?: string
  sideDescription?: string
  sideHint?: string
  showBackToHome?: boolean
}

export default function AuthLayout({
  title,
  description,
  highlight,
  children,
  footer,
  sideTitle = 'Welcome Back!',
  sideDescription = 'Stay disciplined, review your trades, and keep growing as a trader.',
  sideHint = 'Build consistent habits with your trading journal.',
  showBackToHome = false,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 overflow-hidden flex items-center justify-center px-4 py-10">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/20 rounded-full blur-3xl" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.4),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.4),_transparent_50%)]" />

      <div className="relative w-full max-w-5xl">
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 via-fuchsia-500/40 to-blue-500/40 blur-3xl rounded-[3rem] scale-105" />

        {/* Main Card Container with Enhanced Shadow */}
        <div className="relative flex flex-col lg:flex-row bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_80px_rgba(168,85,247,0.5),0_0_40px_rgba(59,130,246,0.3)] overflow-hidden border border-white/50">

          {/* Right Side - Info/Branding Section - Shows First on Mobile */}
          <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-blue-600 text-white p-10 flex flex-col justify-center shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] order-1 lg:order-2">
            {/* Floating Orb Effects */}
            <div className="absolute -left-20 top-1/4 w-48 h-48 bg-white/20 blur-3xl rounded-full hidden lg:block animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute -right-24 top-1/2 w-64 h-64 bg-white/25 blur-3xl rounded-full animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute left-1/2 bottom-0 w-56 h-56 bg-blue-400/30 blur-3xl rounded-full" />

            <div className="relative z-10">
              <p className="uppercase tracking-[0.2em] text-xs font-bold text-white/80 drop-shadow-md">Welcome</p>
              <h3 className="text-4xl font-extrabold mt-2 drop-shadow-lg">{sideTitle}</h3>
              <p className="mt-4 text-white/90 leading-relaxed drop-shadow-md">{sideDescription}</p>

              {/* Info Card with Strong Shadow */}
              <div className="mt-8 bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_0_30px_rgba(255,255,255,0.1)] border border-white/20">
                <p className="text-sm text-white/80 font-medium">{sideHint}</p>
                <div className="mt-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-xl font-semibold shadow-lg shadow-black/20 backdrop-blur-sm border border-white/30">
                    ✦
                  </div>
                  <div>
                    <p className="text-sm font-bold drop-shadow-md">Track emotions & insights</p>
                    <p className="text-xs text-white/70">Transform habits with data-driven reflections.</p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="mt-8 flex gap-2">
                <div className="h-1.5 w-12 bg-white/40 rounded-full shadow-lg"></div>
                <div className="h-1.5 w-8 bg-white/30 rounded-full shadow-lg"></div>
                <div className="h-1.5 w-6 bg-white/20 rounded-full shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Left Side - Form Section - Shows Second on Mobile */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-white to-purple-50/30 py-10 px-8 sm:px-12 shadow-[inset_0_0_60px_rgba(168,85,247,0.05)] order-2 lg:order-1">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
                Trading Journal
              </Link>
              {showBackToHome && (
                <Link to="/" className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors duration-200">
                  ← Back home
                </Link>
              )}
            </div>
            {highlight && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-700 bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full shadow-md shadow-purple-200/50">
                {highlight}
              </span>
            )}
            <h2 className="mt-4 text-3xl font-bold text-slate-900 drop-shadow-sm">{title}</h2>
            {description && <p className="mt-2 text-base text-slate-600">{description}</p>}

            <div className="mt-8 space-y-6">{children}</div>
            {footer && <div className="mt-6 text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

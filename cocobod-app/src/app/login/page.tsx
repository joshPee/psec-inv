'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 800)
      }
    } catch {
      const errorMessage = 'An error occurred. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center login-bg login-dots p-4 font-sans">
      <div className="relative w-full max-w-[440px] animate-scale-in">
        {/* Floating circular logo badge with glow */}
        <div className="flex justify-center -mb-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 p-2"
               style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
            <img src="/pcc.png" alt="PCC Logo" className="w-11 h-11 object-contain dark:brightness-0 dark:invert" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] pt-14 pb-8 px-8 sm:px-10 border border-white/20 dark:border-slate-700/50">
          {/* Title Section */}
          <div className="mb-7 text-center">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Sign in to <span className="font-semibold text-emerald-600 dark:text-emerald-400">PSEC INV</span> to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your username or email"
                className="login-input w-full px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                className="login-input w-full px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  Remember Me
                </label>
              </div>
              <a href="#" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2 animate-fade-in-up">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="login-btn w-full text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Pentecost Convention Center · Security Equipment Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { useLoginMutation } from '../../api/apiSlice'
import { useAppDispatch } from '../../app/hooks'
import { setCredentials } from '../../features/auth/authSlice'

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname || '/'
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)

    // Check for static super admin credentials
    if (values.email === 'admin007@gmail.com' && values.password === 'Open@3777') {
      // Create a mock admin user object
      const adminCredentials = {
        user: {
          id: 'admin-super-001',
          email: 'admin007@gmail.com',
          name: 'Super Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        token: 'static-admin-token-' + Date.now(),
      }

      // Set credentials and navigate
      dispatch(setCredentials(adminCredentials))
      navigate(from, { replace: true })
      return
    }

    // Normal API authentication for other users
    try {
      const result = await login(values).unwrap()
      dispatch(setCredentials(result))
      navigate(from, { replace: true })
    } catch (error: any) {
      setServerError(error?.data?.error || 'Unable to log in. Please try again.')
    }
  }

  const getInputClass = (hasError: boolean, isFocused: boolean) => {
    const baseClass =
      'w-full rounded-2xl bg-white/80 backdrop-blur-sm border-2 py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-300 ease-in-out'

    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 shadow-[0_4px_20px_rgba(239,68,68,0.15)]`
    }

    if (isFocused) {
      return `${baseClass} border-purple-400 ring-4 ring-purple-100 shadow-[0_8px_30px_rgba(168,85,247,0.3),0_2px_10px_rgba(168,85,247,0.2)]`
    }

    return `${baseClass} border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 shadow-[0_2px_15px_rgba(148,163,184,0.1)] hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)]`
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      description="Sign in to continue your trading journey"
      highlight="🔐 Secure Login"
      sideTitle="Start Your Day Right"
      sideDescription="Track your trades, analyze your performance, and build winning habits with data-driven insights."
      footer={
        <p className="text-center">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold transition-all duration-200 hover:scale-105 inline-block"
          >
            Create Account →
          </Link>
        </p>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="space-y-2 group">
          <label
            htmlFor="email"
            className={`text-sm font-semibold transition-colors duration-200 ${emailFocused || emailValue ? 'text-purple-600' : 'text-slate-700'
              }`}
          >
            Email Address
          </label>
          <div className="relative">
            <span className={`absolute inset-y-0 left-4 flex items-center transition-all duration-300 ${emailFocused || emailValue ? 'text-purple-500 scale-110' : 'text-slate-400'
              }`}>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-6.75 4.05a2.25 2.25 0 01-2.31 0l-6.75-4.05a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className={getInputClass(!!errors.email, emailFocused)}
              placeholder="you@example.com"
            />
            {emailValue && !errors.email && (
              <span className="absolute inset-y-0 right-4 flex items-center text-green-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1 animate-shake">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2 group">
          <label
            htmlFor="password"
            className={`text-sm font-semibold transition-colors duration-200 ${passwordFocused || passwordValue ? 'text-purple-600' : 'text-slate-700'
              }`}
          >
            Password
          </label>
          <div className="relative">
            <span className={`absolute inset-y-0 left-4 flex items-center transition-all duration-300 ${passwordFocused || passwordValue ? 'text-purple-500 scale-110' : 'text-slate-400'
              }`}>
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0V10.5M5.25 10.5h13.5a1.5 1.5 0 011.5 1.5v6.75A1.5 1.5 0 0118.75 20.25H5.25a1.5 1.5 0 01-1.5-1.5V12A1.5 1.5 0 015.25 10.5z"
                />
              </svg>
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className={getInputClass(!!errors.password, passwordFocused)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-purple-600 transition-colors duration-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1 animate-shake">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm pt-1">
          <label className="inline-flex items-center gap-2.5 text-slate-600 cursor-pointer group">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer transition-all"
            />
            <span className="group-hover:text-slate-800 transition-colors">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-purple-600 hover:text-purple-700 transition-all duration-200 hover:underline decoration-2 underline-offset-4"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error Message */}
        {serverError && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 px-4 py-3 shadow-[0_4px_20px_rgba(239,68,68,0.15)] animate-slideDown">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{serverError}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(168,85,247,0.4),0_4px_15px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_50px_rgba(168,85,247,0.5),0_6px_20px_rgba(168,85,247,0.4)] focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </button>

      </form>
    </AuthLayout>
  )
}

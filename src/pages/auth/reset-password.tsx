import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { useResetPasswordMutation } from '../../api/apiSlice'

interface ResetFormValues {
  email: string
  token: string
  password: string
}

const inputClass =
  'w-full rounded-2xl bg-slate-50/80 border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const defaultEmail = searchParams.get('email') || ''
  const defaultToken = searchParams.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetFormValues>({
    defaultValues: {
      email: defaultEmail,
      token: defaultToken,
      password: '',
    },
  })

  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail)
    }
    if (defaultToken) {
      setValue('token', defaultToken)
    }
  }, [defaultEmail, defaultToken, setValue])

  const onSubmit = async (values: ResetFormValues) => {
    setServerError(null)
    setSuccessMessage(null)
    try {
      const response = await resetPassword(values).unwrap()
      setSuccessMessage(response.message || 'Password reset successfully. Redirecting to login…')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (error: any) {
      setServerError(error?.data?.error || 'Unable to reset password. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      description="Choose a new password for your account"
      highlight="Secure reset"
      sideTitle="Back on track"
      sideDescription="Create a fresh password to continue capturing your trading performance and insights."
      footer={
        <p>
          Remembered it?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to login
          </Link>
        </p>
      }
      showBackToHome
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center">
              <svg
                className="h-5 w-5 text-primary-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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
              {...register('email', { required: 'Email is required' })}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium text-slate-700">
            Reset token
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center">
              <svg
                className="h-5 w-5 text-primary-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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
              id="token"
              type="text"
              {...register('token', { required: 'Reset token is required' })}
              className={inputClass}
              placeholder="Paste token from email"
            />
          </div>
          {errors.token && <p className="text-sm text-red-500">{errors.token.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            New password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center">
              <svg
                className="h-5 w-5 text-primary-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
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
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600">{serverError}</p>
        )}
        {successMessage && (
          <p className="rounded-2xl bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-600">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-400 disabled:opacity-70"
        >
          {isLoading ? 'Updating password…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  )
}



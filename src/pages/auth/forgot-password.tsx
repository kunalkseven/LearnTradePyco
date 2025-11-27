import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { useForgotPasswordMutation } from '../../api/apiSlice'

interface ForgotFormValues {
  email: string
}

const inputClass =
  'w-full rounded-2xl bg-slate-50/80 border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm'

export default function ForgotPasswordPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotFormValues) => {
    setServerError(null)
    setStatusMessage(null)
    try {
      const response = await forgotPassword(values).unwrap()
      setStatusMessage(response.message || 'If that email exists, we sent you reset instructions.')
    } catch (error: any) {
      setServerError(error?.data?.error || 'Unable to process your request. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email and we’ll send reset instructions"
      highlight="Need help?"
      sideTitle="No worries!"
      sideDescription="We’ll send a secure link so you can reset your password and get back to journaling."
      footer={
        <p>
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to login
          </Link>
        </p>
      }
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

        {serverError && (
          <p className="rounded-2xl bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600">{serverError}</p>
        )}
        {statusMessage && (
          <p className="rounded-2xl bg-green-50 border border-green-100 px-4 py-2 text-sm text-green-600">
            {statusMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-400 disabled:opacity-70"
        >
          {isLoading ? 'Sending instructions…' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}



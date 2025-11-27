import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import { useRegisterMutation } from '../../api/apiSlice'
import { useAppDispatch } from '../../app/hooks'
import { setCredentials } from '../../features/auth/authSlice'

interface RegisterFormValues {
  name: string
  email: string
  password: string
}

const inputClass =
  'w-full rounded-2xl bg-slate-50/80 border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [registerUser, { isLoading }] = useRegisterMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const result = await registerUser(values).unwrap()
      dispatch(setCredentials(result))
      navigate('/', { replace: true })
    } catch (error: any) {
      setServerError(error?.data?.error || 'Unable to create account. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Create account"
      description="Start logging your trades in minutes"
      highlight="New here?"
      sideTitle="Join disciplined traders"
      sideDescription="Capture every setup, emotion, and lesson so improvement becomes inevitable."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Full name
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
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                />
              </svg>
            </span>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name', { required: 'Name is required' })}
              className={inputClass}
              placeholder="Samantha Trader"
            />
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

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
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-400 disabled:opacity-70"
        >
          {isLoading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}



import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            flipadonga
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Sovereign RAG Stack
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{' '}
          <Link 
            href="/login"
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
      <div className="w-full">
        <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
        <p className="mb-6 text-slate-600">
          New here? <Link className="font-semibold text-ink" href="/register">Create an account</Link>.
        </p>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}

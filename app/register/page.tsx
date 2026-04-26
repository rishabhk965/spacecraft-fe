import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

export default function RegisterPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-165px)] max-w-md place-items-center px-6 py-10">
      <div className="w-full">
        <h1 className="mb-2 text-3xl font-bold">Create your studio</h1>
        <p className="mb-6 text-slate-600">
          Already have an account? <Link className="font-semibold text-ink" href="/login">Log in</Link>.
        </p>
        <AuthForm mode="register" />
      </div>
    </section>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, storeTokens } from '@/lib/api';
import { AuthTokens } from '@/lib/types';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get('email')),
      password: String(form.get('password')),
      ...(mode === 'register' ? { name: String(form.get('name')) } : {}),
    };

    try {
      const result = await apiRequest<{ tokens: AuthTokens }>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      storeTokens(result.tokens);
      router.push('/spaces');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-8 shadow-sm">
      {mode === 'register' ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-600">Name</span>
          <input name="name" required className="mt-1 w-full rounded-xl border p-3" />
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-slate-600">Email</span>
        <input name="email" type="email" required className="mt-1 w-full rounded-xl border p-3" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-600">Password</span>
        <input name="password" type="password" required className="mt-1 w-full rounded-xl border p-3" />
      </label>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-xl bg-ink px-4 py-3 font-semibold text-white">
        {mode === 'register' ? 'Create account' : 'Log in'}
      </button>
    </form>
  );
}

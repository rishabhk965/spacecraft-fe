'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ProtectedPage } from '@/components/protected-page';
import { apiRequest } from '@/lib/api';
import { PasswordVerificationResponse, Profile } from '@/lib/types';

type PasswordStep = 'form' | 'otp';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('form');
  const [verification, setVerification] = useState<PasswordVerificationResponse | null>(null);

  useEffect(() => {
    void apiRequest<Profile>('/profile').then(setProfile).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Unable to load profile');
    });
  }, []);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const nextProfile = await apiRequest<Profile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: String(form.get('firstName')),
        lastName: String(form.get('lastName')),
        email: String(form.get('email')),
      }),
    });
    setProfile(nextProfile);
    setMessage('Profile updated');
  }

  async function requestPasswordVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const result = await apiRequest<PasswordVerificationResponse>('/profile/password/verify-request', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: String(form.get('currentPassword')),
        newPassword: String(form.get('newPassword')),
        confirmNewPassword: String(form.get('confirmNewPassword')),
      }),
    });
    setVerification(result);
    setPasswordStep('otp');
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verification) return;
    setError(null);

    try {
      const form = new FormData(event.currentTarget);
      await apiRequest<{ updated: true }>('/profile/password/confirm-otp', {
        method: 'POST',
        body: JSON.stringify({
          verificationId: verification.verificationId,
          otp: String(form.get('otp')),
        }),
      });
      setMessage('Password updated');
      closePasswordModal();
    } catch {
      setError('Failed to authenticate. Please try again.');
    }
  }

  function closePasswordModal() {
    setIsPasswordOpen(false);
    setPasswordStep('form');
    setVerification(null);
  }

  return (
    <ProtectedPage>
      <section className="space-doodle-bg min-h-[calc(100vh-165px)] text-ink">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white/70 p-8 shadow-2xl shadow-slate-900/15 backdrop-blur">
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-indigo-200/80 to-transparent" />
            <div className="relative mx-auto mt-14 h-64 w-64 rounded-full border-4 border-slate-900 bg-cyan-100 shadow-2xl shadow-cyan-900/10">
              <div className="absolute left-1/2 top-12 h-24 w-24 -translate-x-1/2 rounded-full border-4 border-slate-900 bg-amber-100" />
              <div className="absolute bottom-[-44px] left-1/2 h-44 w-52 -translate-x-1/2 rounded-t-full border-4 border-slate-900 bg-indigo-200" />
            </div>
            <div className="relative mt-20 rounded-3xl bg-white/80 p-5 text-center shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-indigo-700">Human profile</p>
              <h1 className="mt-2 text-4xl font-black">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading profile'}</h1>
              <p className="mt-2 text-slate-600">{profile?.email}</p>
            </div>
          </div>

          <section className="space-y-5">
            {message ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}

            <form key={profile?.id ?? 'profile-loading'} onSubmit={updateProfile} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/10 backdrop-blur">
              <h2 className="text-2xl font-black">Profile details</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">First Name</span>
                  <input name="firstName" required defaultValue={profile?.firstName ?? ''} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-600">Last Name</span>
                  <input name="lastName" required defaultValue={profile?.lastName ?? ''} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-bold text-slate-600">Email</span>
                  <input name="email" type="email" required defaultValue={profile?.email ?? ''} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                </label>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-ink px-6 py-3 font-bold text-white">Save Profile</button>
                <button type="button" onClick={() => setIsPasswordOpen(true)} className="rounded-full border border-ink/15 bg-white px-6 py-3 font-bold">
                  Password Management
                </button>
              </div>
            </form>

            <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/10 backdrop-blur">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">My Subscription</p>
              <h2 className="mt-2 text-2xl font-black">{profile?.subscription.label ?? 'Free Explorer Plan'}</h2>
              <p className="mt-2 text-slate-600">
                Display-only for now. This section is structured for future plan upgrades, usage limits, invoices, and AI expansion features.
              </p>
            </section>
          </section>
        </div>

        {isPasswordOpen ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-6 backdrop-blur-md">
            <section className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-950/30">
              {passwordStep === 'form' ? (
                <form onSubmit={requestPasswordVerification}>
                  <h2 className="text-2xl font-black">Password Management</h2>
                  <div className="mt-5 space-y-4">
                    <PasswordInput name="currentPassword" label="Current Password" />
                    <PasswordInput name="newPassword" label="New Password" />
                    <PasswordInput name="confirmNewPassword" label="Confirm New Password" />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={closePasswordModal} className="rounded-full border px-5 py-3 font-bold">Cancel</button>
                    <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Verify</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={verifyOtp}>
                  <h2 className="text-2xl font-black">Verify OTP</h2>
                  <p className="mt-3 rounded-2xl bg-cyan-50 p-4 text-sm font-semibold text-cyan-800">
                    An OTP email has been sent to your linked email. Please check for verification.
                  </p>
                  {verification ? <p className="mt-3 text-sm text-slate-500">Sent to {verification.maskedEmail}</p> : null}
                  <label className="mt-5 block">
                    <span className="text-sm font-bold text-slate-600">OTP</span>
                    <input name="otp" required maxLength={6} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.4em]" />
                  </label>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={closePasswordModal} className="rounded-full border px-5 py-3 font-bold">Cancel</button>
                    <button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Verify OTP</button>
                  </div>
                </form>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </ProtectedPage>
  );
}

function PasswordInput({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <input name={name} type="password" required className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
    </label>
  );
}


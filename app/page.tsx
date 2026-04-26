import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        SpaceCraft.ai
      </p>
      <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-ink">
        Turn room photos into editable, theme-based 3D redesigns.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-600">
        Upload room images, describe your furniture, pick a theme, and explore a lightweight
        3D scene with actionable recommendations.
      </p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-full bg-ink px-5 py-3 font-semibold text-white" href="/register">
          Start designing
        </Link>
        <Link className="rounded-full border border-slate-300 px-5 py-3 font-semibold" href="/login">
          Log in
        </Link>
      </div>
    </main>
  );
}

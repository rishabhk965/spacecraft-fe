export default function ContactPage() {
  return (
    <section className="space-doodle-bg min-h-[calc(100vh-165px)] text-ink">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white/80 p-8 shadow-2xl shadow-slate-900/15 backdrop-blur">
          <p className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-black uppercase tracking-[0.25em] text-indigo-700">
            Contact Us
          </p>
          <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
            SpaceCraft turns imagination into explorable space.
          </h1>
          <div className="mt-6 space-y-5 text-lg leading-8 text-slate-700">
            <p>
              SpaceCraft exists to help people describe, shape, and explore virtual environments before they commit to a design. It blends spatial planning, 3D visualization, and AI assistance into one playful studio.
            </p>
            <p>
              Users can create rooms, concept spaces, or dream interiors, then move from words to an interactive model. The goal is simple: make space creation feel intuitive, visual, and alive.
            </p>
            <p>
              This is where design thinking, AI recommendations, and immersive 3D tools start to feel less like software and more like a creative co-pilot.
            </p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border-4 border-slate-900 bg-cyan-100 p-6 shadow-2xl shadow-cyan-900/10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-800">Designed by</p>
            <h2 className="mt-3 text-3xl font-black">Rishabh Kumar with love</h2>
          </div>
          <div className="rounded-[2rem] border-4 border-slate-900 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <h2 className="text-2xl font-black">Contact details</h2>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Email</dt>
                <dd className="mt-1 font-semibold">kumar.rishabh2408@gmail.com</dd>
              </div>
              <div>
                <dt className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Phone</dt>
                <dd className="mt-1 font-semibold">(+91) 7763829752</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

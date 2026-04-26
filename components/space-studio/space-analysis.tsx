import { Recommendation } from '@/lib/types';
import { SpaceRecommendation } from '@/features/space-design';

interface SpaceAnalysisProps {
  good: string[];
  needsImprovement: string[];
}

interface RecommendationsPanelProps {
  themeName?: string;
  recommendations: Array<Recommendation | SpaceRecommendation>;
  onAction?: (id: string, action: 'accept' | 'reject') => void;
}

export function SpaceAnalysis({ good, needsImprovement }: SpaceAnalysisProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <AnalysisCard title="Already Good in Place" tone="good" items={good} />
      <AnalysisCard title="Need Improvements" tone="improve" items={needsImprovement} />
    </section>
  );
}

export function RecommendationsPanel({ themeName, recommendations, onAction }: RecommendationsPanelProps) {
  return (
    <section className="rounded-[2rem] border border-fuchsia-200/30 bg-gradient-to-br from-fuchsia-500/20 via-indigo-500/15 to-cyan-500/20 p-6 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-fuchsia-100">
            Recommendations
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">AI-powered layout guidance</h2>
        </div>
        {themeName ? (
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">
            {themeName}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        {recommendations.length ? (
          recommendations.map((recommendation) => (
            <article key={recommendation.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 text-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{titleForRecommendation(recommendation)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{recommendation.reasoning}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  {recommendation.impact}
                </span>
              </div>
              {onAction ? (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onAction(recommendation.id, 'accept')} className="rounded-lg bg-cyan-200 px-3 py-2 text-sm font-semibold text-slate-950">
                    Accept
                  </button>
                  <button onClick={() => onAction(recommendation.id, 'reject')} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white">
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
            Generate a 3D scene to receive layout recommendations.
          </p>
        )}
      </div>
    </section>
  );
}

function AnalysisCard({ title, tone, items }: { title: string; tone: 'good' | 'improve'; items: string[] }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-200/30 bg-emerald-300/10 text-emerald-100'
      : 'border-amber-200/30 bg-amber-300/10 text-amber-100';

  return (
    <article className={`rounded-[2rem] border p-5 backdrop-blur ${toneClass}`}>
      <h2 className="text-xl font-black text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-100">
              {item}
            </li>
          ))
        ) : (
          <li className="rounded-2xl bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-100">
            Generate the space to see analysis.
          </li>
        )}
      </ul>
    </article>
  );
}

function titleForRecommendation(recommendation: Recommendation | SpaceRecommendation): string {
  if ('title' in recommendation) return recommendation.title;
  return recommendation.instruction;
}

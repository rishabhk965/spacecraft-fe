'use client';

import { Button, List, ListItem, Paper } from '@mui/material';
import { AiDesignInsight } from '@/lib/types';

interface DesignInsightPanelProps {
  insight: AiDesignInsight | null;
  isLoading: boolean;
  onGenerate: () => Promise<void> | void;
  onApply: () => Promise<void> | void;
}

export function DesignInsightPanel({ insight, isLoading, onGenerate, onApply }: DesignInsightPanelProps) {
  return (
    <Paper elevation={0} className="rounded-3xl bg-white/85 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-500">Design Insight</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Theme-aware AI placement</h2>
        </div>
        <Button variant="outlined" size="small" onClick={() => void onGenerate()} disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Analyze'}
        </Button>
      </div>

      {insight ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-indigo-500">Design Verdict</p>
              {typeof insight.score === 'number' ? (
                <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-indigo-700">{insight.score}/100</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6">{insight.verdict}</p>
          </div>

          {insight.strengths?.length ? (
            <div>
              <p className="text-sm font-bold text-slate-900">Strengths</p>
              <List dense disablePadding>
                {insight.strengths.map((strength) => (
                  <ListItem key={strength} disableGutters>
                    <p className="text-sm leading-6 text-emerald-700">{strength}</p>
                  </ListItem>
                ))}
              </List>
            </div>
          ) : null}

          {insight.issues?.length ? (
            <div>
              <p className="text-sm font-bold text-slate-900">Issues</p>
              <List dense disablePadding>
                {insight.issues.map((issue) => (
                  <ListItem key={issue} disableGutters>
                    <p className="text-sm leading-6 text-amber-700">{issue}</p>
                  </ListItem>
                ))}
              </List>
            </div>
          ) : null}

          <List dense disablePadding>
            {insight.improvements.map((improvement) => (
              <ListItem key={improvement} disableGutters>
                <p className="text-sm leading-6 text-slate-700">{improvement}</p>
              </ListItem>
            ))}
          </List>

          <div>
            <p className="text-sm font-bold text-slate-900">Recommended additions</p>
            <List dense disablePadding>
              {insight.recommendations.length ? (
                insight.recommendations.map((recommendation) => (
                  <ListItem key={recommendation.name} disableGutters>
                    <div>
                      <p className="font-extrabold text-slate-950">{recommendation.name}</p>
                      <p className="text-sm leading-6 text-slate-600">{recommendation.reason}</p>
                    </div>
                  </ListItem>
                ))
              ) : (
                <ListItem disableGutters>
                  <p className="text-sm text-slate-600">No missing items. The current list already fits this theme.</p>
                </ListItem>
              )}
            </List>
          </div>

          <Button fullWidth variant="contained" onClick={() => void onApply()} disabled={!insight.layout.length}>
            Apply AI Suggestions
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Add items, choose a theme, then ask the AI to place them in the 3D space.
        </p>
      )}
    </Paper>
  );
}

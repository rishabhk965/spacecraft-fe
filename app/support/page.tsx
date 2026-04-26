'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { SupportChatResponse, SupportFaq } from '@/lib/types';

interface ChatMessage {
  id: string;
  author: 'user' | 'bot';
  message: string;
}

export default function SupportPage() {
  const [faqs, setFaqs] = useState<SupportFaq[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      author: 'bot',
      message: 'Hi, I am SpaceCraft Support Bot. Ask me about profiles, spaces, themes, or 3D generation.',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<SupportFaq[]>('/support/faqs').then(setFaqs).catch(() => setFaqs([]));
  }, []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const message = String(form.get('message')).trim();
    if (!message) return;

    setMessages((items) => [...items, { id: `user-${Date.now()}`, author: 'user', message }]);
    formElement.reset();

    try {
      const response = await apiRequest<SupportChatResponse>('/support/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      setMessages((items) => [...items, { id: response.id, author: 'bot', message: response.message }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Support bot is unavailable');
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-165px)] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.22),transparent_24rem),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.18),transparent_22rem),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.2),transparent_28rem)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-200">Help & Support</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">Mission control for your spaces.</h1>
          <p className="mt-4 text-slate-300">Backend-driven support answers, FAQs, and guidance for your SpaceCraft workflow.</p>
        </header>

        <section className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="h-96 space-y-3 overflow-y-auto rounded-3xl bg-slate-950/60 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.author === 'user' ? 'bg-cyan-200 text-slate-950' : 'bg-white/10 text-slate-100'}`}>
                  <span className="mb-1 block text-xs font-black uppercase tracking-[0.18em] opacity-70">
                    {message.author === 'user' ? 'You' : 'SpaceCraft Support Bot'}
                  </span>
                  {message.message}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="mt-4 flex gap-3">
            <input name="message" placeholder="Ask about spaces, themes, profile, or 3D generation..." className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950/70 px-5 py-3 text-white outline-none placeholder:text-slate-500" />
            <button className="rounded-full bg-cyan-200 px-6 py-3 font-black text-slate-950">Send</button>
          </form>
          {error ? <p className="mt-3 rounded-2xl bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <h2 className="font-black">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{faq.answer}</p>
            </article>
          ))}
        </section>
      </div>
    </section>
  );
}

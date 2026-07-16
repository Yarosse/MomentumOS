"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type MomentumState } from "@/lib/momentum";

const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));

export default function SkillsPage() {
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(storageKey); if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState)); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state)); }, [hydrated, state]);
  const updateSkill = (id: string, patch: { level?: number; evidence?: string }) => setState((current) => ({ ...current, skills: current.skills.map((skill) => skill.id === id ? { ...skill, ...patch } : skill) }));
  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую навички…</main>;
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · SKILLS</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Карта навичок.</h1><p className="mt-3 text-slate-600">Рівень — не рейтинг і не самооцінка за настроєм. Це робоча карта: що вже є, де потрібен доказ, навчання або делегування.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{state.skills.map((skill) => <article key={skill.id} className="rounded-2xl border p-5"><div className="flex items-center justify-between gap-4"><h2 className="font-semibold text-slate-900">{skill.name}</h2><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">{skill.level}/10</span></div><input type="range" min="0" max="10" value={skill.level} onChange={(event) => updateSkill(skill.id, { level: Number(event.target.value) })} className="mt-5 w-full accent-cyan-500" /><textarea value={skill.evidence ?? ""} onChange={(event) => updateSkill(skill.id, { evidence: event.target.value })} placeholder="Який факт підтверджує цей рівень або що треба прокачати?" className="mt-4 min-h-20 w-full rounded-xl border p-3 text-sm text-slate-800" /></article>)}</div></div></main>;
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type Engine, type MomentumState } from "@/lib/momentum";

type Update = { id: string; engine: string; amount: number; note: string; date: string; kind?: "cashflow" | "build" | "reputation" | "validation" };
const updateKey = "momentum-engine-updates-v1";
const engineAliases: Record<string, string[]> = {
  scalping: ["Скальпінг", "Scalping"],
  community: ["Арбітражне ком'юніті", "Arbitrage community"],
  telegram: ["Telegram-гра", "Telegram game"],
  doors: ["Двері", "Doors"],
};

const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));
const statusLabel: Record<Engine["status"], string> = { active: "Активна", experiment: "Експеримент", paused: "Призупинена", retired: "Закрита" };

export default function EnginePage() {
  const params = useParams<{ engineId: string }>();
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState));
    setUpdates(JSON.parse(localStorage.getItem(updateKey) ?? "[]") as Update[]);
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state)); }, [hydrated, state]);

  const engine = state.engines.find((item) => item.id === params.engineId);
  const completed = useMemo(() => state.missions.filter((mission) => mission.engineId === params.engineId && mission.status === "completed"), [params.engineId, state.missions]);
  const engineUpdates = useMemo(() => updates.filter((item) => engineAliases[params.engineId]?.includes(item.engine)), [params.engineId, updates]);
  const earned = engineUpdates.reduce((sum, item) => sum + item.amount, 0);
  const signalCount = (kind: NonNullable<Update["kind"]>) => engineUpdates.filter((item) => (item.kind ?? (item.amount ? "cashflow" : "build")) === kind).length;

  const updateEngine = (patch: Partial<Engine>) => setState((current) => ({ ...current, engines: current.engines.map((item) => item.id === params.engineId ? { ...item, ...patch } : item) }));

  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую машину…</main>;
  if (!engine) return <main className="min-h-screen px-5 py-10"><Link href="/" className="text-cyan-700 underline">← Сьогодні</Link><p className="mt-8">Такої машини немає.</p></main>;

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link>
    <p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · ENGINE</p>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold text-slate-900">{engine.name}</h1><p className="mt-2 text-slate-600">Одна машина. Одна поточна стадія. Одне вузьке місце.</p></div><span className="rounded-full border px-3 py-1.5 text-sm text-slate-700">{statusLabel[engine.status]}</span></div>

    <section className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Ціль на місяць</p><p className="mt-1 text-3xl font-semibold text-slate-900">{engine.targetMonthly ? `$${engine.targetMonthly.toLocaleString()}` : "Не задано"}</p><p className="mt-3 text-sm text-slate-600">Зафіксовано Cashflow: ${earned.toFixed(2)}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Доказів виконаних місій</p><p className="mt-1 text-3xl font-semibold text-slate-900">{completed.length}</p><p className="mt-3 text-sm text-slate-600">Останній: {engine.lastProof ?? "ще немає"}</p></div></section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">Build</p><p className="mt-1 text-xl font-semibold text-slate-900">{signalCount("build")}</p></div><div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">Reputation</p><p className="mt-1 text-xl font-semibold text-slate-900">{signalCount("reputation")}</p></div><div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">Validation</p><p className="mt-1 text-xl font-semibold text-slate-900">{signalCount("validation")}</p></div></section>

    <section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Поточний стан</h2><div className="mt-5 grid gap-4"><label className="text-sm font-medium text-slate-700">Статус<select value={engine.status} onChange={(event) => updateEngine({ status: event.target.value as Engine["status"] })} className="mt-2 w-full rounded-xl border p-3 text-slate-800">{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-medium text-slate-700">Ціль доходу на місяць, $<input type="number" min="0" value={engine.targetMonthly ?? ""} onChange={(event) => updateEngine({ targetMonthly: event.target.value === "" ? undefined : Number(event.target.value) })} className="mt-2 w-full rounded-xl border p-3 text-slate-800" /></label><label className="text-sm font-medium text-slate-700">Стадія<textarea value={engine.stage} onChange={(event) => updateEngine({ stage: event.target.value })} className="mt-2 min-h-20 w-full rounded-xl border p-3 text-slate-800" /></label><label className="text-sm font-medium text-slate-700">Одне вузьке місце<textarea value={engine.bottleneck} onChange={(event) => updateEngine({ bottleneck: event.target.value })} className="mt-2 min-h-20 w-full rounded-xl border p-3 text-slate-800" /></label><label className="text-sm font-medium text-slate-700">Критерій переходу далі<textarea value={engine.objective} onChange={(event) => updateEngine({ objective: event.target.value })} className="mt-2 min-h-20 w-full rounded-xl border p-3 text-slate-800" /></label></div></section>

    <section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Історія доказів</h2>{completed.length === 0 ? <p className="mt-3 text-sm text-slate-600">Ще немає завершених місій для цієї машини.</p> : <div className="mt-4 space-y-3">{completed.slice().reverse().map((mission) => <article key={mission.id} className="rounded-xl border p-4"><p className="font-medium text-slate-800">{mission.title}</p><p className="mt-2 text-sm text-slate-600">{mission.proof}</p></article>)}</div>}</section>
    <section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Останні факти</h2>{engineUpdates.length === 0 ? <p className="mt-3 text-sm text-slate-600">Додай факт або дохід у розділі «Оновлення машин».</p> : <div className="mt-4 space-y-3">{engineUpdates.slice(0, 5).map((item) => <article key={item.id} className="rounded-xl border p-4"><div className="flex justify-between gap-3"><p className="text-sm text-slate-500">{item.date}</p>{item.amount !== 0 && <p className="text-sm font-medium text-emerald-700">${item.amount}</p>}</div><p className="mt-2 text-slate-700">{item.note}</p></article>)}</div>}</section>
  </div></main>;
}

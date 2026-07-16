"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type BossId, type MomentumState } from "@/lib/momentum";

const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));
const bosses: Record<BossId, { name: string; description: string }> = {
  boredom: { name: "Нудьга", description: "Хочеться відкрити угоду або перемкнутися лише тому, що зараз нудно." },
  tilt: { name: "Тільт", description: "Емоція після помилки або втрати штовхає на імпульсивне рішення." },
  perfectionism: { name: "Перфекціонізм", description: "Хочеться ще думати, полірувати або не показувати результат." },
  new_project: { name: "Новий проєкт", description: "Нова ідея здається важливішою за поточне вузьке місце." },
  analysis: { name: "Аналіз без дії", description: "Розбір замінює маленьку перевірку або запуск." },
};

export default function StatePage() {
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(storageKey); if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState)); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state)); }, [hydrated, state]);
  const todayEvents = useMemo(() => state.player.behaviorEvents.filter((event) => event.date === state.player.trackedDate), [state.player.behaviorEvents, state.player.trackedDate]);
  const recordBoss = (outcome: "win" | "lost") => {
    const boss = state.player.currentBoss;
    if (!boss) return;
    setState((current) => ({ ...current, player: { ...current.player, currentBoss: undefined, momentum: Math.max(0, Math.min(100, current.player.momentum + (outcome === "win" ? 8 : -6))), behaviorEvents: [{ id: crypto.randomUUID(), date: current.player.trackedDate, boss, outcome }, ...current.player.behaviorEvents].slice(0, 100) } }));
  };
  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую стан…</main>;
  const remaining = Math.max(0, state.player.capacityMinutes - state.player.focusMinutes);
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · PLAYER STATE</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Берегти ресурс, а не вичавлювати себе.</h1><p className="mt-3 text-slate-600">Це не оцінка тебе. Це панель стану, щоб не приймати погані рішення через втому, тільт або нудьгу.</p><section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Momentum</p><p className="mt-1 text-3xl font-semibold text-slate-900">{state.player.momentum}</p><p className="text-sm text-slate-500">із 100</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Залишок фокусу</p><p className="mt-1 text-3xl font-semibold text-slate-900">{remaining}</p><p className="text-sm text-slate-500">хвилин</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Енергія</p><p className="mt-1 text-3xl font-semibold text-slate-900">{state.player.energy ?? "—"}</p><p className="text-sm text-slate-500">із 5</p></div></section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Ліміт глибокої роботи</h2><p className="mt-2 text-sm text-slate-600">Твоя реальна база — 4–5 годин. Коли ліміт вичерпано, Decision Engine перестає пропонувати нові місії.</p><label className="mt-4 block text-sm font-medium text-slate-700">Хвилин на день<input type="number" min="60" max="600" step="15" value={state.player.capacityMinutes} onChange={(event) => setState((current) => ({ ...current, player: { ...current.player, capacityMinutes: Number(event.target.value) || 270 } }))} className="mt-2 w-full rounded-xl border p-3 text-slate-800" /></label></section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Поточний бос</h2><p className="mt-2 text-sm text-slate-600">Не караємо себе. Просто називаємо стан — і вибираємо правильну поведінку.</p><select value={state.player.currentBoss ?? ""} onChange={(event) => setState((current) => ({ ...current, player: { ...current.player, currentBoss: event.target.value ? event.target.value as BossId : undefined } }))} className="mt-4 w-full rounded-xl border p-3 text-slate-800"><option value="">Зараз боса немає</option>{Object.entries(bosses).map(([id, boss]) => <option key={id} value={id}>{boss.name}</option>)}</select>{state.player.currentBoss && <div className="mt-4 rounded-xl border p-4"><p className="font-medium text-slate-800">{bosses[state.player.currentBoss].name}</p><p className="mt-1 text-sm text-slate-600">{bosses[state.player.currentBoss].description}</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => recordBoss("win")} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Я не піддався (+8 Momentum)</button><button onClick={() => recordBoss("lost")} className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700">Піддався (зафіксувати)</button></div></div>}</section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Сьогоднішні поведінкові події</h2>{todayEvents.length === 0 ? <p className="mt-3 text-sm text-slate-600">Ще нічого. Тут будуть не «галочки», а моменти, коли ти зберіг капітал або фокус.</p> : <ul className="mt-3 space-y-2 text-sm text-slate-700">{todayEvents.map((event) => <li key={event.id}>— {bosses[event.boss].name}: {event.outcome === "win" ? "перемога" : "піддався"}</li>)}</ul>}</section></div></main>;
}

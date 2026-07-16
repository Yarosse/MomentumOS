"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type BossId, type MomentumState } from "@/lib/momentum";

type Log = { date: string; done: string; blocker: string; insight: string; energy: number };
type Update = { id: string; engine: string; amount: number; note: string; date: string };
const logsKey = "momentum-daily-logs-v1";
const updatesKey = "momentum-engine-updates-v1";
const bossNames: Record<BossId, string> = { boredom: "Нудьга", tilt: "Тільт", perfectionism: "Перфекціонізм", new_project: "Новий проєкт", analysis: "Аналіз без дії" };
const aliases: Record<string, string[]> = { scalping: ["Скальпінг", "Scalping"], community: ["Арбітражне ком'юніті", "Arbitrage community"], telegram: ["Telegram-гра", "Telegram game"], doors: ["Двері", "Doors"] };

export default function MemoryPage() {
  const [state, setState] = useState<MomentumState>(initialState);
  const [logs, setLogs] = useState<Log[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(storageKey); if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState)); setLogs(JSON.parse(localStorage.getItem(logsKey) ?? "[]") as Log[]); setUpdates(JSON.parse(localStorage.getItem(updatesKey) ?? "[]") as Update[]); setHydrated(true); }, []);
  const completed = useMemo(() => state.missions.filter((mission) => mission.status === "completed"), [state.missions]);
  const totalIncome = useMemo(() => updates.reduce((sum, item) => sum + item.amount, 0), [updates]);
  const averageEnergy = logs.length ? (logs.reduce((sum, log) => sum + log.energy, 0) / logs.length).toFixed(1) : null;
  const bossCounts = useMemo(() => state.player.behaviorEvents.reduce<Record<BossId, number>>((acc, event) => ({ ...acc, [event.boss]: (acc[event.boss] ?? 0) + 1 }), {} as Record<BossId, number>), [state.player.behaviorEvents]);
  const mostFrequentBoss = Object.entries(bossCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as BossId | undefined;
  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую пам&apos;ять…</main>;
  const achievements = [
    { title: "Перший доказ", ready: completed.length >= 1, detail: "Завершити місію з фактом." },
    { title: "Захистив фокус", ready: state.player.behaviorEvents.some((event) => event.outcome === "win"), detail: "Не піддатися одному з босів." },
    { title: "Перші $100 фактами", ready: totalIncome >= 100, detail: "Зафіксувати сумарно $100 доходу." },
    { title: "Стабільний тиждень", ready: logs.length >= 5, detail: "Заповнити 5 коротких денних логів." },
    { title: "Перший review", ready: state.reviews.length >= 1, detail: "Завершити щотижневий огляд." },
  ];
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · MEMORY</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Факти, які система пам&apos;ятає.</h1><p className="mt-3 text-slate-600">Це сигнали, а не діагнози. Вони допоможуть помічати повтори, а майбутньому COO — давати рекомендації на твоїх даних.</p><section className="mt-8 grid gap-4 sm:grid-cols-4"><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Доказів</p><p className="mt-1 text-3xl font-semibold text-slate-900">{completed.length}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Зафіксований дохід</p><p className="mt-1 text-3xl font-semibold text-slate-900">${totalIncome.toFixed(0)}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Середня енергія</p><p className="mt-1 text-3xl font-semibold text-slate-900">{averageEnergy ?? "—"}</p></div><div className="rounded-2xl border p-5"><p className="text-sm text-slate-500">Оглядів</p><p className="mt-1 text-3xl font-semibold text-slate-900">{state.reviews.length}</p></div></section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Машини: лише перевірювані сигнали</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{state.engines.map((engine) => { const engineMissions = completed.filter((mission) => mission.engineId === engine.id); const engineIncome = updates.filter((item) => aliases[engine.id].includes(item.engine)).reduce((sum, item) => sum + item.amount, 0); return <article key={engine.id} className="rounded-xl border p-4"><p className="font-medium text-slate-900">{engine.name}</p><p className="mt-2 text-sm text-slate-600">Доказів: {engineMissions.length} · Фактів доходу: ${engineIncome.toFixed(0)}</p><p className="mt-2 text-sm text-slate-600">Останній доказ: {engine.lastProof ?? "ще немає"}</p></article>; })}</div></section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Патерни поведінки</h2>{state.player.behaviorEvents.length === 0 ? <p className="mt-3 text-sm text-slate-600">Ще немає даних. Коли фіксуватимеш босів у «Стані», тут з&apos;являться лише реальні повтори.</p> : <><p className="mt-3 text-sm text-slate-600">Подій зафіксовано: {state.player.behaviorEvents.length}. Перемог: {state.player.behaviorEvents.filter((event) => event.outcome === "win").length}.</p>{mostFrequentBoss && <p className="mt-2 text-sm text-slate-700">Найчастіше фіксується: <strong>{bossNames[mostFrequentBoss]}</strong> ({bossCounts[mostFrequentBoss]} разів).</p>}</>}</section><section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Досягнення</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{achievements.map((achievement) => <div key={achievement.title} className="rounded-xl border p-4"><p className={achievement.ready ? "font-medium text-emerald-700" : "font-medium text-slate-700"}>{achievement.ready ? "✓" : "○"} {achievement.title}</p><p className="mt-1 text-sm text-slate-600">{achievement.ready ? "Відкрито" : achievement.detail}</p></div>)}</div></section></div></main>;
}

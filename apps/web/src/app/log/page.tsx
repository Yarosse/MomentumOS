"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Log = { date: string; done: string; blocker: string; insight: string; energy: number };
const key = "momentum-daily-logs-v1";

export default function LogPage() {
  const [done, setDone] = useState("");
  const [blocker, setBlocker] = useState("");
  const [insight, setInsight] = useState("");
  const [energy, setEnergy] = useState(3);
  const [saved, setSaved] = useState(false);

  useEffect(() => { const latest = (JSON.parse(localStorage.getItem(key) ?? "[]") as Log[]).at(-1); if (latest?.date === new Date().toDateString()) { setDone(latest.done); setBlocker(latest.blocker); setInsight(latest.insight); setEnergy(latest.energy); } }, []);
  const save = () => { const logs = JSON.parse(localStorage.getItem(key) ?? "[]") as Log[]; const entry = { date: new Date().toDateString(), done, blocker, insight, energy }; const next = logs.filter((item) => item.date !== entry.date).concat(entry); localStorage.setItem(key, JSON.stringify(next)); setSaved(true); };

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · ЩОДЕННИЙ ЛОГ</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Три факти за день.</h1><p className="mt-3 text-slate-600">До 90 секунд. Це пам’ять для тебе й майбутнього COO.</p><section className="mt-8 rounded-3xl border p-6 sm:p-8"><label className="block text-sm font-semibold text-slate-800">Що реально зробив?<textarea value={done} onChange={(e) => setDone(e.target.value)} className="mt-2 min-h-24 w-full rounded-xl border p-3 font-normal" placeholder="Факт або завершений результат." /></label><label className="mt-5 block text-sm font-semibold text-slate-800">Що завадило?<textarea value={blocker} onChange={(e) => setBlocker(e.target.value)} className="mt-2 min-h-20 w-full rounded-xl border p-3 font-normal" placeholder="Або: нічого критичного." /></label><label className="mt-5 block text-sm font-semibold text-slate-800">Що зрозумів?<textarea value={insight} onChange={(e) => setInsight(e.target.value)} className="mt-2 min-h-20 w-full rounded-xl border p-3 font-normal" placeholder="Один висновок, який змінить наступне рішення." /></label><div className="mt-5"><p className="text-sm font-semibold text-slate-800">Енергія: {energy}/5</p><input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="mt-2 w-full accent-cyan-500" /></div><button onClick={save} className="mt-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white">Зберегти день</button>{saved && <p className="mt-4 text-sm text-emerald-700">Збережено. На сьогодні досить.</p>}</section></div></main>;
}

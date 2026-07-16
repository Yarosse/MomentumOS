"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Update = { id: string; engine: string; amount: number; note: string; date: string };
const key = "momentum-engine-updates-v1";
const engines = ["Скальпінг", "Арбітражне ком'юніті", "Telegram-гра", "Двері"];

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]); const [engine, setEngine] = useState(engines[0]); const [amount, setAmount] = useState(""); const [note, setNote] = useState("");
  useEffect(() => setUpdates(JSON.parse(localStorage.getItem(key) ?? "[]") as Update[]), []);
  const save = () => { if (!note.trim()) return; const next = [{ id: crypto.randomUUID(), engine, amount: Number(amount || 0), note: note.trim(), date: new Date().toLocaleDateString("uk-UA") }, ...updates]; setUpdates(next); localStorage.setItem(key, JSON.stringify(next)); setAmount(""); setNote(""); };
  const total = updates.reduce((sum, item) => sum + item.amount, 0);
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · ENGINE UPDATE</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Факти по машинах.</h1><p className="mt-3 text-slate-600">Не бухгалтерія. Один дохід або результат, який допоможе зрозуміти, що реально працює.</p><section className="mt-8 rounded-3xl border p-6"><div className="grid gap-3 sm:grid-cols-2"><select value={engine} onChange={(e) => setEngine(e.target.value)} className="rounded-xl border p-3 text-slate-800">{engines.map((item) => <option key={item}>{item}</option>)}</select><input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Дохід, $ (необов’язково)" className="rounded-xl border p-3 text-slate-800" /></div><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Що сталося? Наприклад: новий учасник пройшов онбординг самостійно." className="mt-3 min-h-28 w-full rounded-xl border p-3 text-slate-800" /><button onClick={save} className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white">Зберегти оновлення</button></section><div className="mt-8 rounded-2xl border p-5"><p className="text-sm text-slate-500">Зафіксований дохід</p><p className="mt-1 text-3xl font-semibold text-slate-900">${total.toFixed(2)}</p></div><div className="mt-5 space-y-3">{updates.map((item) => <article key={item.id} className="rounded-2xl border p-4"><div className="flex justify-between gap-3"><p className="font-medium text-slate-800">{item.engine}</p><p className="text-sm text-emerald-700">{item.amount ? `+$${item.amount}` : "Результат"}</p></div><p className="mt-2 text-slate-600">{item.note}</p><p className="mt-2 text-xs text-slate-400">{item.date}</p></article>)}</div></div></main>;
}

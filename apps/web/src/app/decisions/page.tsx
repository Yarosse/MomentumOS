"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Decision = { id: string; title: string; engine: string; facts: string; choice: string; createdAt: string };
const storageKey = "momentum-decisions-v1";
const engines = ["Загальне", "Скальпінг", "Арбітражне ком'юніті", "Telegram-гра", "Двері"];

export default function DecisionsPage() {
  const [items, setItems] = useState<Decision[]>([]);
  const [title, setTitle] = useState("");
  const [engine, setEngine] = useState(engines[0]);
  const [facts, setFacts] = useState("");
  const [choice, setChoice] = useState("");

  useEffect(() => setItems(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Decision[]), []);

  const addDecision = () => {
    if (!title.trim() || !facts.trim() || !choice.trim()) return;
    const next = [{ id: crypto.randomUUID(), title: title.trim(), engine, facts: facts.trim(), choice: choice.trim(), createdAt: new Date().toLocaleDateString("uk-UA") }, ...items];
    setItems(next); localStorage.setItem(storageKey, JSON.stringify(next)); setTitle(""); setFacts(""); setChoice("");
  };

  const remove = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next); localStorage.setItem(storageKey, JSON.stringify(next));
  };

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl">
    <Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link>
    <p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · DECISIONS</p>
    <h1 className="mt-3 text-3xl font-semibold text-slate-900">Важливі рішення.</h1>
    <p className="mt-3 text-slate-600">Не потрібно записувати все. Лише те, що може змінити напрямок однієї з машин або твої правила гри.</p>

    <section className="mt-8 rounded-3xl border p-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Що потрібно вирішити?" className="rounded-xl border p-3 text-slate-800" /><select value={engine} onChange={(event) => setEngine(event.target.value)} className="rounded-xl border p-3 text-slate-800">{engines.map((item) => <option key={item}>{item}</option>)}</select></div>
      <textarea value={facts} onChange={(event) => setFacts(event.target.value)} placeholder="Які факти це підтверджують? Не відчуття." className="mt-3 min-h-24 w-full rounded-xl border p-3 text-slate-800" />
      <textarea value={choice} onChange={(event) => setChoice(event.target.value)} placeholder="Яке рішення або наступна перевірка?" className="mt-3 min-h-24 w-full rounded-xl border p-3 text-slate-800" />
      <button onClick={addDecision} className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white">Зберегти рішення</button>
    </section>

    <div className="mt-8 space-y-4">{items.length === 0 ? <p className="text-sm text-slate-500">Ще немає рішень. Тут не має бути багато записів — тільки ті, які справді важливі.</p> : items.map((item) => <article key={item.id} className="rounded-2xl border p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold text-cyan-700">{item.engine} · {item.createdAt}</p><h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2></div><button onClick={() => remove(item.id)} className="text-sm text-rose-600">Видалити</button></div><p className="mt-4 text-sm font-medium text-slate-700">Факти</p><p className="mt-1 whitespace-pre-wrap text-slate-600">{item.facts}</p><p className="mt-4 text-sm font-medium text-slate-700">Рішення</p><p className="mt-1 whitespace-pre-wrap text-slate-600">{item.choice}</p></article>)}</div>
  </div></main>;
}

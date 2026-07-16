"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Idea = { id: string; text: string; createdAt: string };
const key = "momentum-backlog-v1";

export default function BacklogPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [text, setText] = useState("");
  useEffect(() => { setIdeas(JSON.parse(localStorage.getItem(key) ?? "[]") as Idea[]); }, []);
  const add = () => { if (!text.trim()) return; const next = [{ id: crypto.randomUUID(), text: text.trim(), createdAt: new Date().toLocaleDateString("uk-UA") }, ...ideas]; setIdeas(next); localStorage.setItem(key, JSON.stringify(next)); setText(""); };
  const remove = (id: string) => { const next = ideas.filter((idea) => idea.id !== id); setIdeas(next); localStorage.setItem(key, JSON.stringify(next)); };
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · BACKLOG</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Ідеї не зникають. Але не відволікають.</h1><p className="mt-3 text-slate-600">Запиши думку, закрий сторінку й повернись до головної місії. Перегляд — лише на щотижневому огляді.</p><section className="mt-8 rounded-3xl border p-6"><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Нова ідея, можливість або питання…" className="min-h-28 w-full rounded-2xl border p-4 text-slate-800" /><button onClick={add} className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white">Зберегти в Backlog</button></section><div className="mt-8 space-y-3">{ideas.length ? ideas.map((idea) => <article key={idea.id} className="flex items-start justify-between gap-4 rounded-2xl border p-4"><div><p className="font-medium text-slate-800">{idea.text}</p><p className="mt-1 text-xs text-slate-500">{idea.createdAt}</p></div><button onClick={() => remove(idea.id)} className="text-sm text-slate-400 hover:text-rose-600">Видалити</button></article>) : <p className="text-sm text-slate-500">Backlog порожній. Це добре — якщо ти зараз у фокусі.</p>}</div></div></main>;
}

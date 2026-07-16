"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { initialState, storageKey, type MomentumState } from "@/lib/momentum";

const questions = [
  "Які місії завершені й який у кожної доказ?",
  "Яка машина стала сильнішою та чому?",
  "Яке вузьке місце не зрушилось?",
  "Де був самообман або зайве перемикання?",
  "Яка одна машина має найбільший важіль наступного тижня?",
];

export default function ReviewPage() {
  const [state, setState] = useState<MomentumState | null>(null);
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    const loaded = raw ? (JSON.parse(raw) as MomentumState) : initialState;
    setState({ ...loaded, reviews: loaded.reviews ?? [] });
  }, []);

  const save = () => {
    if (!state || answers.some((answer) => !answer.trim())) return;
    const next = { ...state, reviews: [...state.reviews, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), answers }] };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setState(next);
    setSaved(true);
  };

  return <main className="min-h-screen bg-[#0b1020] px-5 py-8 text-slate-100 sm:px-8"><div className="mx-auto max-w-3xl"><Link href="/" className="text-sm text-cyan-200 underline underline-offset-4">← Today</Link><p className="mt-8 text-xs font-bold tracking-[0.24em] text-cyan-300">MOMENTUM OS · WEEKLY REVIEW</p><h1 className="mt-2 text-3xl font-semibold">Факти. Не настрій.</h1><p className="mt-3 text-slate-400">До 10 хвилин. Відповіді мають змінити наступний тиждень.</p><div className="mt-8 space-y-6">{questions.map((question, index) => <label key={question} className="block rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><span className="font-medium">{index + 1}. {question}</span><textarea value={answers[index]} onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer))} className="mt-3 min-h-24 w-full rounded-xl border border-slate-600 bg-slate-950/70 p-3 outline-none focus:border-cyan-300" /></label>)}</div><button onClick={save} disabled={answers.some((answer) => !answer.trim())} className="mt-6 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 disabled:opacity-40">Зберегти review</button>{saved && <p className="mt-3 text-sm text-cyan-200">Review збережено. Повернись у Today та обери одну місію за новим пріоритетом.</p>}</div></main>;
}

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
  const [step, setStep] = useState(0);
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

  const isLast = step === questions.length - 1;

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[0.22em] text-cyan-700">MOMENTUM OS · ЩОТИЖНЕВИЙ ОГЛЯД</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Факти. Не настрій.</h1><p className="mt-3 text-slate-600">До 10 хвилин. Відповідай лише на одне питання за раз.</p><section className="mt-8 rounded-3xl border p-6 sm:p-8"><div className="flex items-center justify-between text-sm text-slate-500"><span>Крок {step + 1} з {questions.length}</span><span>{Math.round(((step + 1) / questions.length) * 100)}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div><h2 className="mt-8 text-xl font-semibold leading-8 text-slate-900">{questions[step]}</h2><textarea value={answers[step]} onChange={(event) => setAnswers((current) => current.map((answer, index) => index === step ? event.target.value : answer))} placeholder="Коротко і конкретно: факт, результат або висновок." className="mt-5 min-h-40 w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-slate-800 outline-none placeholder:text-slate-400" /><div className="mt-6 flex items-center justify-between gap-3"><button onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 disabled:opacity-30">← Назад</button>{isLast ? <button onClick={save} disabled={answers.some((answer) => !answer.trim())} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-40">Зберегти огляд</button> : <button onClick={() => setStep((current) => Math.min(questions.length - 1, current + 1))} disabled={!answers[step].trim()} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-40">Далі →</button>}</div>{saved && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">Огляд збережено. Повернись у «Сьогодні» та обери місію за новим пріоритетом.</p>}</section></div></main>;
}

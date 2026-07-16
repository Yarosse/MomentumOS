"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const storageKey = "momentum-rules-v1";

const defaultRules = [
  "Нова ідея спочатку йде в Backlog, а не в роботу.",
  "Перед кодом або автоматизацією перевіряю: хто цим скористається чи заплатить.",
  "Нудьга не є причиною відкривати угоду.",
  "День виграно, коли завершено одну головну місію з доказом.",
  "Факти важливіші за настрій: фіксую результат, а не оцінюю себе.",
  "Ризик-менеджмент важливіший за бажання заробити швидко.",
];

export default function RulesPage() {
  const [rules, setRules] = useState(defaultRules);
  const [newRule, setNewRule] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setRules(JSON.parse(saved) as string[]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(storageKey, JSON.stringify(rules));
  }, [hydrated, rules]);

  const addRule = () => {
    const value = newRule.trim();
    if (!value) return;
    setRules((current) => [...current, value]);
    setNewRule("");
  };

  const moveRule = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rules.length) return;
    setRules((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const editRule = (index: number) => {
    const value = window.prompt("Зміни правило", rules[index]);
    if (!value?.trim()) return;
    setRules((current) => current.map((rule, ruleIndex) => ruleIndex === index ? value.trim() : rule));
  };

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl">
    <Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link>
    <p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · GUARDRAILS</p>
    <h1 className="mt-3 text-3xl font-semibold text-slate-900">Правила, що бережуть Momentum.</h1>
    <p className="mt-3 text-slate-600">Це не список обов&apos;язків. Це короткі правила для моментів, коли емоції або нова ідея хочуть забрати фокус.</p>

    <section className="mt-8 rounded-3xl border p-6">
      <label className="text-sm font-medium text-slate-700" htmlFor="new-rule">Додати своє правило</label>
      <div className="mt-2 flex gap-2"><input id="new-rule" value={newRule} onChange={(event) => setNewRule(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addRule()} placeholder="Наприклад: не приймаю рішення в тільті" className="min-w-0 flex-1 rounded-xl border p-3 text-slate-800" /><button onClick={addRule} className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white">Додати</button></div>
    </section>

    <ol className="mt-6 space-y-3">{rules.map((rule, index) => <li key={`${rule}-${index}`} className="flex items-center gap-3 rounded-2xl border p-4"><span className="w-6 text-center text-sm font-semibold text-cyan-700">{index + 1}</span><button onClick={() => editRule(index)} className="flex-1 text-left leading-6 text-slate-800">{rule}</button><div className="flex flex-col text-sm"><button onClick={() => moveRule(index, -1)} aria-label="Підняти правило" className="px-2 text-slate-500 hover:text-cyan-700">↑</button><button onClick={() => moveRule(index, 1)} aria-label="Опустити правило" className="px-2 text-slate-500 hover:text-cyan-700">↓</button></div><button onClick={() => setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index))} aria-label="Видалити правило" className="text-sm text-rose-600 hover:text-rose-800">×</button></li>)}</ol>
  </div></main>;
}

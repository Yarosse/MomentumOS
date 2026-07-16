"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";

const keys = [
  "momentum-os-v1",
  "momentum-daily-logs-v1",
  "momentum-backlog-v1",
  "momentum-engine-updates-v1",
  "momentum-rules-v1",
  "momentum-decisions-v1",
];

type Backup = { version: 1; createdAt: string; data: Record<string, string> };

export default function BackupPage() {
  const [message, setMessage] = useState("");

  const exportBackup = () => {
    const data = Object.fromEntries(keys.flatMap((key) => {
      const value = localStorage.getItem(key);
      return value === null ? [] : [[key, value]];
    }));
    const backup: Backup = { version: 1, createdAt: new Date().toISOString(), data };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `momentum-os-backup-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
    setMessage("Резервну копію завантажено. Збережи файл у надійному місці.");
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as Backup;
      if (parsed.version !== 1 || !parsed.data || typeof parsed.data !== "object") throw new Error("invalid");
      if (!window.confirm("Відновити дані з цього файлу? Поточні дані Momentum OS у цьому браузері буде замінено.")) return;
      keys.forEach((key) => localStorage.removeItem(key));
      Object.entries(parsed.data).forEach(([key, value]) => { if (keys.includes(key) && typeof value === "string") localStorage.setItem(key, value); });
      setMessage("Дані відновлено. Повернись на головний екран.");
    } catch {
      setMessage("Не вдалося прочитати файл. Обери резервну копію Momentum OS у форматі JSON.");
    } finally { event.target.value = ""; }
  };

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl">
    <Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link>
    <p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · BACKUP</p>
    <h1 className="mt-3 text-3xl font-semibold text-slate-900">Твої дані — під контролем.</h1>
    <p className="mt-3 text-slate-600">Зараз Momentum OS зберігає дані у цьому браузері. Раз на тиждень або перед зміною комп&apos;ютера завантажуй резервну копію.</p>
    <section className="mt-8 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Зберегти копію</h2><p className="mt-2 text-sm leading-6 text-slate-600">Файл містить місії, машини, щоденний лог, Backlog, факти, правила та рішення.</p><button onClick={exportBackup} className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white">Завантажити копію</button></section>
    <section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Відновити копію</h2><p className="mt-2 text-sm leading-6 text-slate-600">Використовуй це на новому браузері або після втрати локальних даних.</p><label className="mt-4 inline-block cursor-pointer rounded-xl border border-cyan-500 px-5 py-3 text-sm font-semibold text-cyan-700"><span>Обрати файл копії</span><input type="file" accept="application/json,.json" onChange={importBackup} className="sr-only" /></label></section>
    {message && <p className="mt-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">{message}</p>}
  </div></main>;
}

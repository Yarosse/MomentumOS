"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryItems = [
  { href: "/", label: "Сьогодні" },
  { href: "/coo", label: "COO" },
  { href: "/missions", label: "Черга" },
  { href: "/#machines", label: "Машини" },
  { href: "/log", label: "Прогрес" },
];

const moreItems = [
  { href: "/state", label: "Мій профіль", hint: "Енергія, фокус і боси" },
  { href: "/skills", label: "Навички", hint: "Карта сильних сторін" },
  { href: "/memory", label: "Пам'ять", hint: "Факти та патерни" },
  { href: "/rules", label: "Правила", hint: "Межі й захист фокусу" },
  { href: "/decisions", label: "Рішення", hint: "Історія важливих виборів" },
  { href: "/backlog", label: "Ідеї", hint: "Backlog без відволікань" },
  { href: "/review", label: "Щотижневий огляд", hint: "Коротке коригування курсу" },
  { href: "/backup", label: "Дані", hint: "Резервна копія та імпорт" },
  { href: "/operator", label: "Логіка COO", hint: "Чому система так радить" },
];

export function AppNavigation() {
  const pathname = usePathname();
  const primaryActive = (href: string) => href === "/" ? pathname === "/" : pathname === href;
  const moreActive = moreItems.some((item) => pathname === item.href);

  return <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 px-4 py-3 shadow-[0_8px_30px_rgba(34,55,75,.08)] backdrop-blur-xl sm:px-8">
    <div className="mx-auto flex max-w-6xl items-center gap-3">
      <Link href="/" className="shrink-0 text-xs font-bold tracking-[.18em] text-slate-800">MOMENTUM</Link>
      <nav aria-label="Головна навігація" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {primaryItems.map((item) => <Link key={item.href} href={item.href} className={`shrink-0 rounded-lg px-3 py-2 text-sm transition ${primaryActive(item.href) ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>{item.label}</Link>)}
      </nav>
      <Link href="/updates" className="hidden shrink-0 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-cyan-600 sm:block">+ Факт</Link>
      <details className="relative shrink-0">
        <summary className={`cursor-pointer list-none rounded-lg px-3 py-2 text-sm transition ${moreActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100"}`}>Ще <span aria-hidden="true">⌄</span></summary>
        <div className="absolute right-0 mt-2 grid w-72 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          {moreItems.map((item) => <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-2.5 transition hover:bg-slate-50 ${pathname === item.href ? "bg-cyan-50" : ""}`}><span className="block text-sm font-medium text-slate-800">{item.label}</span><span className="mt-0.5 block text-xs text-slate-500">{item.hint}</span></Link>)}
          <Link href="/updates" className="rounded-xl px-3 py-2.5 sm:hidden"><span className="block text-sm font-medium text-cyan-700">+ Додати факт</span></Link>
        </div>
      </details>
    </div>
  </header>;
}

---
title: MVP Technical Architecture
version: 0.1
status: Draft
owner: Founder
last_updated: 2026-07-16
---

# Decision

Sprint 1 використовує локальний вебзастосунок на **Next.js + TypeScript + Tailwind CSS** у `apps/web`.

Дані MVP зберігаються у браузері через `localStorage`. Це достатньо для одного першого користувача, дозволяє почати без акаунта, бази даних і платних сервісів. Після 7-денного тесту схему можна перенести в PostgreSQL/Supabase без зміни доменних понять Engine, Mission і Review.

# Why This Stack

- Поточний Node.js 24.18.0 перевищує мінімальну вимогу Next.js 20.9.
- Next.js дає TypeScript, App Router і зручний шлях до майбутнього веб/PWA інтерфейсу.
- `localStorage` переживає перезапуск браузера на тому самому origin, тому підходить для персонального локального MVP.
- Без бекенду немає потреби в ключах, оплаті, авторизації чи хмарній інфраструктурі до перевірки щоденного використання.

# Boundaries

## In MVP

- `apps/web`: один Next.js застосунок.
- Client-side state і `localStorage`.
- Стартові дані для чотирьох Engine.
- Today, Engines, Mission completion і Weekly Review.

## Not Yet

- Supabase, PostgreSQL, авторизація.
- OpenAI API, Telegram Bot API, фонові задачі.
- Хмарна синхронізація та мобільний застосунок.

# Folder Structure

```text
apps/web/
  app/              # сторінки та layout
  components/       # UI-компоненти
  lib/              # доменні типи, стартові дані, локальне сховище
```

# Migration Trigger

Переходимо до Supabase/PostgreSQL лише якщо після 7 днів MVP реально використовується й потрібна хоча б одна з можливостей:

1. доступ із кількох пристроїв;
2. резервне копіювання;
3. авторизація;
4. AI COO або Telegram-бот.

# Sources

- Next.js requires Node.js 20.9 or later and its default setup supports TypeScript, Tailwind and App Router: https://nextjs.org/docs/app/getting-started/installation
- Web Storage API provides `localStorage`, persistent per origin: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API

# Changelog

## v0.1 — 2026-07-16

- Selected a proof-first local architecture.

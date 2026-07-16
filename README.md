# Momentum OS

> Build systems, not task lists.

Momentum OS — персональна система прийняття рішень для людини, яка будує кілька джерел доходу. Вона не показує весь список справ: вона допомагає обрати одну дію з найбільшим важелем на наступні 30–90 хвилин.

## MVP principle

За 10 секунд після відкриття користувач має зрозуміти:

1. Що робити зараз.
2. Чому саме це.
3. Яке вузьке місце це прибирає.

## Status

🚧 Sprint 0 — Foundation

First artifact: [First User Profile](docs/product/USER.md)

Product direction: [Vision](docs/Vision.md)

MVP screen specification: [Today](spec/Today.md)

Core domain specification: [Income Engines](spec/Engine.md)

Roadmap: [Roadmap](docs/Roadmap.md) · Principles: [Momentum Bible](docs/Bible.md)

Technical foundation: [Architecture](docs/Architecture.md)

## Run locally

```powershell
cd apps/web
npm.cmd run dev
```

Потім відкрий `http://localhost:3000`.

Дані MVP зберігаються лише у браузері на цьому комп'ютері. Кнопка «Скинути демо-дані» очищає їх і повертає стартовий стан.

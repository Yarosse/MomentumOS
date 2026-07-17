---
title: Momentum OS Roadmap
version: 0.2
status: Active
owner: Founder
last_updated: 2026-07-17
---

# Product Compass

Momentum OS helps a person build income systems without drowning in tasks. The product must reduce decisions, show the next valuable move, and keep the user in control.

## Current state — Personal MVP

- [x] Four editable income engines
- [x] Mission queue, priorities, reordering, proof and completion
- [x] Local decision engine, capacity, behavior rules and weekly review
- [x] Local memory, decisions, rules, facts and backup
- [x] AI COO with compact context, cost controls and mission validation
- [x] API key stays server-side in `.env.local`

## Next now — Personal validation

**Goal:** use the personal COO on real decisions and learn where it helps or misses context.

- [ ] Use COO for real daily decisions
- [ ] Record only useful feedback: missing fact, wrong priority, unclear mission, or good result
- [ ] Improve friction and clarity before adding more functionality

No new large feature is added until there is a concrete problem from usage.

# Future Product Modules

## 1. COO Guided Onboarding

**Goal:** turn a first conversation into a useful operating profile without overwhelming a new user.

### Experience

- COO asks one short question at a time, never a long questionnaire.
- The user can choose **Simple** or **Detailed** mode and switch later.
- Simple mode: roughly 5–7 essential steps.
- Detailed mode: roughly 12–16 adaptive steps.
- Every step supports: `Answer later`, `I do not know`, and an example.
- The progress bar represents **profile setup**, not life success.
- Early progress moves quickly; later stages become more precise as the profile gains depth.

### Result of onboarding

COO creates a draft of:

- operator profile and available capacity;
- engines / goals;
- priorities and bottlenecks;
- behavioral risks and boundaries;
- initial rules;
- first mission queue.

### Control rule

COO may prepare and prefill the draft, but the user sees a short review screen and can edit or approve it before it becomes the operating state. No silent changes to engines, rules, or priorities.

## 2. Multi-user access and cost protection

**Goal:** allow real users without allowing unlimited free AI usage or exposing the owner’s API budget.

- Authentication and a per-user account
- Cloud database for each user’s state, archive, memory digest and COO runs
- Server-only OpenAI key; never shipped to a browser or Telegram client
- Per-user rate limits, call quota and token accounting before each COO request
- Free onboarding with a strict limited number of COO turns
- Ongoing COO access through credits, subscription, or a user-owned API key
- Usage dashboard, hard monthly spend cap, and abuse protection

## 3. Conversational COO → structured system

**Goal:** COO extracts useful facts from conversation and keeps the system current.

- COO asks about engines, priorities, constraints, and desired outcomes
- COO proposes missions in priority order instead of asking the user to build a task list
- Relevant facts become structured drafts: engine, rule, decision, evidence, or backlog idea
- User can quickly edit missions, engines and priorities at any time
- COO uses confirmation for meaningful state changes and never invents facts

## 4. Telegram bot

**Goal:** make Momentum faster to open than a planner.

- Morning: one strongest next action
- Quick log: done / blocker / insight
- COO conversation and mission approval
- Same account, rules, memory and quotas as the web app

## 5. Design and product polish

**Goal:** calm, minimal, readable interface after the workflow proves itself.

- Ukrainian-first language
- Apple-like light glass visual direction
- Accessible contrast and readable typography
- No decorative feature that increases cognitive load

# Sequencing rule

1. Validate the current personal MVP.
2. Build guided onboarding and conversational drafting.
3. Add authentication, cloud storage, and access limits before inviting external users.
4. Build Telegram only after web COO and shared state are stable.
5. Finish visual polish after the core workflow is proven.

# Changelog

## v0.2 — 2026-07-17

- Added guided onboarding, simple/detailed modes, progressive setup bar, multi-user cost protection, conversational COO drafting, and Telegram direction.
- Corrected roadmap: AI COO is implemented in the personal MVP.

## v0.1 — 2026-07-16

- Initial proof-first roadmap.

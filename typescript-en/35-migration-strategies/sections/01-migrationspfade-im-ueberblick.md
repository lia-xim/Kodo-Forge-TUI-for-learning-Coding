# Section 1: Migration Paths Overview

> Estimated reading time: **10 minutes**
>
> Previous section: -- (Start)
> Next section: [02 - allowJs and checkJs Strategy](./02-allowjs-und-checkjs.md)

---

## What you'll learn here

- Why **JS-to-TS migration** is not a one-time event but a process
- The three main strategies: **Big Bang**, **gradual**, and **hybrid**
- When each strategy fits and what **risks** each carries
- How to choose the migration path for your specific project

---

## Background: Why migrate?

> **Origin Story: How Airbnb migrated 6 million lines of JavaScript**
>
> In 2019, Airbnb started migrating their entire frontend codebase
> from JavaScript to TypeScript. The project spanned over 6 million
> lines of code, 2,000+ files, and a team of 200+ developers. The
> migration took 18 months — not because TypeScript was hard, but
> because the planning was complex.
>
> The key to success: they did NOT migrate everything at once (Big Bang).
> Instead, they used a gradual strategy with `allowJs: true` as a
> bridge. Each week, 50–100 files were migrated, accompanied by
> automated codemod scripts. After 18 months the codebase was
> fully in TypeScript — and the bug rate dropped by 38%.
>
> What went wrong? Airbnb reports that the biggest challenge was not
> the technology, but the people: developers under time pressure tended
> to add `any` instead of working out real types. By the end of the
> migration they had 11,000 explicit `any` annotations — a "type debt"
> mountain they systematically paid down in the years that followed. The
> lesson learned: plan explicitly from the start how you'll deal with `any`.

Almost every professional developer will at some point perform or be
involved in a JS-to-TS migration. The question is not IF, but HOW.

**Why migrate at all?** TypeScript offers concrete benefits that
pay off especially in large codebases: better IDE support with
precise autocomplete, early error detection before testing, safe
refactoring (renaming a property finds all usages), and easier
onboarding for new developers who can read the code without tracing
every call. Airbnb's figure of 38% fewer bugs is no outlier —
Microsoft's own studies show similar values for large TypeScript
projects.

---

## The three strategies

### Strategy 1: Big Bang

```
  Day 1:   Rename all .js → .ts
  Day 2-N: Fix all type errors
  Day N+1: Enable strict mode
```

**Advantages:**
- Clean cut — no mixed state
- All files have types immediately
- No coexistence of JS and TS

**Disadvantages:**
- Massive PR that can't be reviewed meaningfully
- Blocks other work for days/weeks
- High risk of regressions

**Fits for:** Small projects (< 50 files), side projects, prototypes

**Analogy:** Big Bang is like renovating a room completely in one day.
You empty it, haul everything out, renovate, and haul everything back.
For a small guest room — no problem. For an open-plan office with
50 workstations it means two weeks without desks. Not practical.

### Strategy 2: Gradual (recommended)

```
  Phase 1: Enable allowJs + checkJs in the project
  Phase 2: Always write new files in .ts
  Phase 3: Migrate existing .js files step by step
  Phase 4: Enable strict mode incrementally
```

**Advantages:**
- No standstill — normal feature work continues
- Every PR is small and reviewable
- Risk is minimal (errors only affect migrated files)

**Disadvantages:**
- Mixed state of JS and TS for weeks/months
- Discipline required ("New files ALWAYS in .ts!")
- Temporarily more complexity (two worlds)

**Fits for:** Large projects, teams, production-critical code

**Analogy:** Gradual migration is like renovating an office
room by room while work continues. You finish room 1, move the
employees, renovate it, and move on to the next. The office
always stays functional.

### Strategy 3: Hybrid (codemod-assisted)

```
  Step 1: Automatically rename .js → .ts with codemod
  Step 2: Automatically add : any wherever needed
  Step 3: Manually improve types over time
```

**Advantages:**
- Fast start — codemods handle the mechanical work
- Immediately in "TypeScript mode" (IDE support, autocomplete)
- `any` spots are marked and can be tackled by priority

**Disadvantages:**
- False sense of security — `: any` is not real typing
- Codemods can introduce subtle bugs
- Requires downstream manual work

**Fits for:** Medium to large projects under time pressure

> 💭 **Think about it:** Airbnb had 200+ developers and chose the gradual
> strategy. A startup with 3 developers and 20 files should probably
> choose which strategy?
>
> **Answer:** Big Bang. With 20 files the migration is done in an
> afternoon. The overhead of a gradual strategy (tooling,
> coexistence, discipline) only pays off at ~100+ files.

---

## The decision matrix

```typescript annotated
// Decision based on project size and team size:
//
// Files    | 1-3 Devs        | 4-10 Devs       | 10+ Devs
// ---------|-----------------|-----------------|------------------
// < 50     | Big Bang        | Big Bang        | Big Bang
// 50-200   | Gradual/Hybrid  | Gradual         | Gradual
// 200-1000 | Hybrid          | Gradual         | Gradual + Codemod
// > 1000   | Gradual         | Gradual         | Gradual + Codemod
//
// ^ With large teams, coordination is the bottleneck, not technology
// ^ Gradual migration allows parallel feature work
```

> 🧠 **Explain to yourself:** Why is Big Bang risky with > 50 files, even if the project has only 1–3 developers? What could go wrong?
> **Key points:** A massive PR can't be reviewed meaningfully | All errors arrive at once | Merge conflicts with ongoing feature work | Rollback is difficult | Gradual migration allows learning along the way

---

## The migration plan

Regardless of strategy, you need a plan:

```typescript annotated
// migration-plan.md (example)
//
// ## 1. Preparation (Week 1)
// - [ ] Create tsconfig.json with allowJs: true
// - [ ] Install TypeScript as devDependency
// - [ ] Extend CI with tsc --noEmit
// - [ ] Team meeting: "New files in .ts from now on"
//
// ## 2. Infrastructure files (Weeks 2-3)
// - [ ] Define shared types (models/, interfaces/)
// - [ ] Define API response types
// - [ ] Migrate configuration files
// ^ Infrastructure first, because everything imports it
//
// ## 3. Core modules (Weeks 4-8)
// - [ ] Migrate services (dependency order!)
// - [ ] Migrate utilities
// - [ ] Migrate stores/state
// ^ Order: leaves first, then inward
//
// ## 4. UI layer (Weeks 9-12)
// - [ ] Migrate components
// - [ ] Migrate pages
// ^ UI last, because it has the most dependencies
//
// ## 5. Strict mode (Week 13+)
// - [ ] Enable strictNullChecks
// - [ ] Enable strict
// - [ ] Remove allowJs
```

> ⚡ **Framework reference (Angular):** Angular projects have an advantage:
> the CLI has generated everything in TypeScript since Angular 2 (2016). "Migration"
> here usually means: enabling strict mode and typing existing `any` spots.
> If you're migrating a legacy AngularJS project (Angular 1.x),
> that's a different story — there you need the full JS→TS migration.
>
> Concretely for your Angular project: first check whether `strict: true` and
> `strictTemplates: true` are active in your `tsconfig.json`. If not,
> that is your "migration" — and Section 3 of this lesson shows exactly how.

---

## Order: leaves first

The most important rule in gradual migration:

```
  shared/types.ts      ← FIRST (no dependencies)
  utils/helpers.ts     ← THEN  (depends only on types)
  services/api.ts      ← THEN  (depends on types + helpers)
  components/User.tsx  ← LAST  (depends on everything)
```

```typescript annotated
// Dependency graph:
//
//   types.ts  ←── helpers.ts  ←── api.ts  ←── User.tsx
//    (leaf)                                    (root)
//
// Migrate left to right:
// 1. types.ts → .ts with full types
// 2. helpers.ts → .ts, imports typed types
// 3. api.ts → .ts, imports typed helpers + types
// 4. User.tsx → .tsx, everything typed
//
// ^ Each step builds on already-typed modules
// ^ Never migrate a file whose dependencies are still .js
```

> 🧪 **Experiment:** Visualize the dependencies in a project:
>
> ```bash
> # With madge (Dependency Graph Tool):
> npx madge --image graph.png src/
>
> # Or simpler — find files without imports:
> grep -rL "^import" src/ --include="*.js" | head -10
> # These files have no dependencies → ideal starting points
>
> # Count JS vs TS files (current migration baseline):
> find src -name "*.ts" -o -name "*.tsx" | wc -l  # TypeScript
> find src -name "*.js" -o -name "*.jsx" | wc -l  # JavaScript
> ```
>
> The files without imports are your "leaves" — migrate them first.
> The count shows your starting point for migration metrics.

**Why does order matter so much?** If you migrate a "root" file
(e.g. a main component) before its dependencies are typed, you'll
have to use `any` everywhere — because the imported modules don't
yet provide type information. Leaves first ensures that every
migrated file gets real types from its dependencies, not `any`.

---

## What you've learned

- **Big Bang** fits small projects (< 50 files)
- **Gradual migration** is the safe path for large projects and teams
- **Hybrid/Codemod** speeds up the start but requires follow-up work
- Always migrate **leaves first** (files without dependencies)
- A **migration plan** with clear phases prevents chaos
- **`any` debt** — plan for it from the start: mark it explicitly and pay it down systematically
- **Metrics help:** TS share, `any` count, and strict error count measure real progress

**Core concept to remember:** Migration is not a technical problem — it's an organizational one. The best strategy is the one your team can sustain without feature work grinding to a halt. Gradual migration is almost always the right choice. And: treat `any` as a temporary tool, not a solution — the difference between a clean migration and a "TypeScript in name only" project lies in consistently paying down that technical debt.

---

> **Pause point** — Good moment for a break. You've understood the big picture
> of migration strategies.
>
> Continue with: [Section 02: allowJs and checkJs Strategy](./02-allowjs-und-checkjs.md)
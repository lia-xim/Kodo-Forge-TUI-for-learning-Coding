# Section 6: Practice — Angular and React Migration

> Estimated reading time: **10 minutes**
>
> Previous section: [05 - Typical Migration Problems and Solutions](./05-typische-migrationsprobleme.md)
> Next section: -- (End of lesson)

---

## What you'll learn here

- How to migrate an **Angular project** from loose to strict TypeScript
- How to convert a **React codebase** from JavaScript to TypeScript
- What **framework-specific pitfalls** to watch out for
- A concrete **migration playbook** you can apply directly

---

## Angular: From loose to strict

> **Background: Angular's strict journey**
>
> Angular was a TypeScript project from the very beginning (2016). But "TypeScript"
> doesn't automatically mean "strict". Many Angular projects from the
> Angular 2–8 era (2016–2019) use neither `strict: true` nor
> `strictTemplates: true`. The Angular CLI has only enabled strict by default
> since Angular 12 (2021) when running `ng new`.
>
> This means: if you're working on an older Angular project, the
> "migration" isn't JS→TS, but TS→Strict TS. And that can be
> just as much work.

### Step 1: Strict mode in Angular

```typescript annotated
// angular.json — Angular-specific strict options
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "strictTemplates": true,
            // ^ Template Type Checking — validates property bindings and events
            "strictInjectionParameters": true
            // ^ Validates DI parameters for correct types
          }
        }
      }
    }
  }
}

// tsconfig.json — TypeScript Strict
{
  "compilerOptions": {
    "strict": true,
    // ^ Enables all TypeScript strict flags
    "noPropertyAccessFromIndexSignature": true
    // ^ Angular recommendation: obj.key → ERROR, obj["key"] → OK
    // ^ Makes it clear when dynamic access is happening
  },
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
    // ^ Angular-specific compiler options
  }
}
```

### Step 2: Angular-specific problems

```typescript annotated
// Problem 1: Untyped services
@Injectable({ providedIn: 'root' })
export class DataService {
  private data: any;  // ← "any" everywhere in old services
  // Fix: Type incrementally
  private data: User[] = [];

  getData() {
    return this.data;  // Return type is now inferred
  }
}

// Problem 2: Template errors with strictTemplates
// <input [value]="user.name">
// ^ ERROR if user can be undefined
// Fix:
// <input *ngIf="user" [value]="user.name">
// Or: Definite assignment in the component
// user!: User; (temporary, mark with TODO)

// Problem 3: ViewChild without type
// @ViewChild('myRef') ref;  // ERROR: implicitly any
// Fix:
// @ViewChild('myRef') ref!: ElementRef<HTMLInputElement>;

// Problem 4: Event handlers in templates
// (click)="onClick($event)"
// onClick(event) { ... }  // ERROR: implicit any
// Fix:
// onClick(event: MouseEvent) { ... }
```

> 🧠 **Explain it to yourself:** Why is `strictTemplates: true` in Angular so valuable? What does it check that wouldn't be checked without this option?
> **Key points:** Validates property bindings for correct types | Validates event handler signatures | Detects null/undefined in templates | Validates pipe return types | Without strictTemplates, templates are a "type-free zone"

---

## React: From JavaScript to TypeScript

Migrating React projects from JavaScript follows the standard workflow,
but has its own quirks:

### Step 1: Setup

```typescript annotated
// tsconfig.json for React migration
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    // ^ For React 17+ (automatic JSX transform)
    "allowJs": true,
    // ^ Allows mixed .js/.jsx and .ts/.tsx files
    "strict": false,
    // ^ Enable later!
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}

// Step: rename .jsx → .tsx (file by file)
// NOTE: .js → .ts (without JSX) and .jsx → .tsx (with JSX)!
```

### Step 2: React-specific patterns

```typescript annotated
// Typing props — the most important step
// BEFORE (.jsx):
function UserCard({ name, age, onSave }) {
  return <div onClick={() => onSave(name)}>{name}, {age}</div>;
}

// AFTER (.tsx):
interface UserCardProps {
  name: string;
  age: number;
  onSave: (name: string) => void;
}

function UserCard({ name, age, onSave }: UserCardProps) {
  // ^ Full types for all props
  return <div onClick={() => onSave(name)}>{name}, {age}</div>;
}

// Typing hooks:
// BEFORE:
const [user, setUser] = useState(null);

// AFTER:
const [user, setUser] = useState<User | null>(null);
// ^ Without explicit type: useState(null) → type is 'null' (not User | null!)
// ^ This is a VERY common mistake in React migrations

// Event handlers:
// BEFORE:
function handleChange(e) { setValue(e.target.value); }

// AFTER:
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}
```

> 💭 **Think about it:** Why does `useState(null)` infer the type `null` and not
> `null | undefined`? And why do you have to explicitly write `useState<User | null>(null)`?
>
> **Answer:** TypeScript infers the narrowest possible type. `null` is
> a literal type — TypeScript infers `useState<null>`, not
> `useState<User | null>`. You must specify the generic type explicitly
> when the initial value doesn't represent the full range of values.

---

## The Migration Playbook

A concrete, actionable plan for both frameworks:

```typescript annotated
// WEEK 1: Infrastructure
// - [ ] Set up TypeScript + tsconfig
// - [ ] allowJs: true, strict: false
// - [ ] Extend CI: tsc --noEmit
// - [ ] Establish rule: "New files in .ts/.tsx"

// WEEK 2-3: Shared code
// - [ ] Define types/interfaces (models/, types/)
// - [ ] Create API response types
// - [ ] Migrate utility functions

// WEEK 4-6: Services/Hooks (Core)
// - [ ] Angular: Migrate services
// - [ ] React: Migrate custom hooks
// - [ ] Type state management (NgRx/Redux/Zustand)

// WEEK 7-10: Components
// - [ ] Work from leaf components inward
// - [ ] Type props/inputs
// - [ ] Type event handlers

// WEEK 11-12: Strict mode
// - [ ] Enable phase 1 strict flags (alwaysStrict, etc.)
// - [ ] Phase 2: noImplicitAny
// - [ ] Phase 3: strictNullChecks (the big one)

// WEEK 13+: Refinement
// - [ ] Remove remaining ! (non-null assertions)
// - [ ] Type remaining any spots
// - [ ] Enable strict: true
// - [ ] allowJs: false (migration complete!)
```

> ⚡ **Framework connection (Angular + React):** The difference in practice:
>
> **Angular:** Most of the work lies in `strictTemplates` — templates
> are the biggest "type-free zone". Services and component classes
> are often already partially typed.
>
> **React:** Most of the work lies in props types and hooks. JSX is
> less problematic than Angular templates because JSX is closer to
> regular TypeScript. However, React has more untyped patterns
> (Context, Render Props, HOCs).

---

## Metrics: Measuring progress

```typescript annotated
// Quantifying migration progress:

// 1. Files: How many .ts vs .js?
// find src -name "*.ts" -o -name "*.tsx" | wc -l  → 120
// find src -name "*.js" -o -name "*.jsx" | wc -l  → 80
// → 60% migrated

// 2. Any count: How many explicit 'any'?
// grep -r ": any" src/ --include="*.ts" | wc -l → 45
// → 45 spots that still need typing

// 3. @ts-ignore count:
// grep -r "@ts-ignore\|@ts-expect-error" src/ | wc -l → 12
// → 12 suppressed errors

// 4. Strict compliance: Does it compile with strict: true?
// npx tsc --noEmit --strict 2>&1 | grep "error TS" | wc -l → 230
// → 230 errors until strict: true is possible

// Goal: All 4 metrics at 0/100%
```

> 🧪 **Experiment:** Run the metrics above in a real project:
>
> ```bash
> # In your Angular/React project:
> echo "=== Migration Status ==="
> echo "TypeScript files: $(find src -name '*.ts' -o -name '*.tsx' | wc -l)"
> echo "JavaScript files: $(find src -name '*.js' -o -name '*.jsx' | wc -l)"
> echo "Explicit any: $(grep -r ': any' src/ --include='*.ts*' | wc -l)"
> echo "Suppressed errors: $(grep -r '@ts-ignore\|@ts-expect-error' src/ | wc -l)"
> ```
>
> These 4 numbers instantly give you a picture of the migration status.

---

## What you've learned

- **Angular migration** focuses on `strictTemplates` and service typing
- **React migration** focuses on props types, hooks, and event handlers
- `useState(null)` infers `null`, not `User | null` — explicit generic required
- A **12-week playbook** provides structure: Infrastructure → Shared → Core → Components → Strict
- **4 metrics** measure progress: TS ratio, any count, ts-ignore count, strict errors

**Key concept to remember:** Framework migration is framework-specific. Angular has templates as its biggest type-free zone, React has props and hooks. But the path is the same: gradual, from the inside out, with measurable metrics. And the last step — `strict: true` and `allowJs: false` — is the most satisfying.

---

> **End of lesson.** You now have the knowledge and tools to safely migrate
> any JavaScript project to TypeScript.
>
> Next up: **L36 — Library Authoring**
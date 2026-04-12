# Section 2: Dangerous TypeScript Patterns

> Estimated reading time: **10 minutes**
>
> Previous section: [01 - The Security Paradox](./01-das-sicherheits-paradox.md)
> Next section: [03 - JavaScript Pitfalls in TypeScript](./03-javascript-fallen-in-typescript.md)

---

## What you'll learn here

- The four most dangerous TypeScript patterns that cause real security problems
- How `as`, `!`, `any` and `Object.assign` bypass the type system
- What each pattern might look like in a real Angular project
- What the safe alternatives are

---

## Background: The Origin of "Escape Hatches"

When Anders Hejlsberg and the TypeScript team designed TypeScript in 2012,
they faced a dilemma: JavaScript code is often **dynamic** —
types are computed at runtime, objects are merged together,
external data arrives without guarantees.

To enable migration of existing JavaScript projects,
they built in so-called **escape hatches** — ways to bypass the type system
when it "gets in the way". `as`, `!`, `any` — all of these are deliberate
design decisions for migration scenarios and edge cases.

The problem: these escape hatches are so convenient that they get used in everyday code.
Instead of fixing the type system (by writing real validation),
you just say: "Trust me, compiler."

> **The golden rule:** Every `as`, every `!`, every `any` in the code is
> a place where **you take over responsibility from the compiler**.
> You're making a promise that won't be verified.

---

## Pattern 1: `as` Type Assertion — the silent lie

Type assertions with `as` tell the compiler: "I know better."
The compiler believes you. Blindly.

```typescript annotated
// SCENARIO: Processing an Angular form
interface UserForm {
  email: string;
  password: string;
  age: number;  // must be >= 18
}

// DANGEROUS: as without validation
@Component({ /* ... */ })
export class RegistrationComponent {
  form = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    age: new FormControl(''),
  });

  onSubmit(): void {
    const data = this.form.value as UserForm;
    // ^ TypeScript: "All good, it's a UserForm!"
    // Reality 1: age is a string (FormControl returns strings),
    //            not a number — TypeScript doesn't check after the as-cast
    // Reality 2: email could be empty (FormControl default is '')
    // Reality 3: age could be "15" — age validation is completely missing
    this.userService.register(data);
    // The service expects age: number, receives "15" (string)
    // Can lead to incorrect calculations, no error thrown
  }
}

// SAFE: Explicit validation instead of as
onSubmitSafe(): void {
  const raw = this.form.value;
  if (!raw.email || !raw.password || !raw.age) {
    throw new Error('Form incomplete');
  }
  const age = Number(raw.age);
  if (isNaN(age) || age < 18) {
    throw new Error('Invalid age input');
  }
  // Only now assemble the object — no as-cast!
  const data: UserForm = {
    email: raw.email,
    password: raw.password,
    age,
  };
  this.userService.register(data);
}
```

**Particularly dangerous with Branded Types:**

```typescript annotated
// Branded type for safe IDs
type UserId = string & { readonly _brand: 'UserId' };

// DANGEROUS: Applying brand via as without validation
function getUser(id: string): User {
  const userId = id as UserId;    // No protection! Any string is accepted
  return userRepository.find(userId);
  // SQL injection? Prototype pollution? TypeScript says nothing.
}

// SAFE: Brand only assigned after validation
function asUserId(raw: string): UserId {
  if (!/^user-[a-z0-9]{8}$/.test(raw)) {
    throw new Error(`Invalid user ID: ${raw}`);
  }
  return raw as UserId;  // as is OK here — we validated BEFOREHAND
}
```

---

## Pattern 2: Non-null Assertion `!` — the optimistic crash

The exclamation mark says: "I promise this is not null or undefined."
TypeScript believes you. What happens when you're lying?

```typescript annotated
// SCENARIO: Angular template reference and DOM access
@Component({
  template: `<canvas #myCanvas></canvas>`
})
export class DiagramComponent implements OnInit {
  @ViewChild('myCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  // ^ The ! here is necessary (Angular only initialises it in ngAfterViewInit)
  //   But it's a "false promise" in ngOnInit

  ngOnInit(): void {
    // DANGEROUS: canvas is STILL null at this point!
    const ctx = this.canvas.nativeElement.getContext('2d')!;
    // ^ Two ! in a row — double fatal optimism
    // this.canvas is undefined → TypeError: Cannot read properties of undefined
    // The ! only prevents the compile error, not the runtime crash
    ctx.fillRect(0, 0, 100, 100);  // Explodes here
  }

  // SAFE: Respect the lifecycle correctly
  ngAfterViewInit(): void {
    const ctx = this.canvas?.nativeElement?.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }
    ctx.fillRect(0, 0, 100, 100);  // Safe
  }
}
```

**The chain crash pattern — particularly insidious:**

```typescript annotated
interface User {
  profile?: {
    avatar?: {
      url: string;
    };
  };
}

// DANGEROUS: Chaining ! operators
function getAvatarUrl(user: User): string {
  return user.profile!.avatar!.url;
  // ^ If profile is undefined → TypeError: Cannot read properties of undefined ('avatar')
  // Stack trace shows this line — but no hint about WHAT was null
  // Even worse in Angular templates: white image instead of an error message
}

// SAFE: Optional chaining with fallback
function getAvatarUrlSafe(user: User): string {
  return user.profile?.avatar?.url ?? '/assets/default-avatar.png';
}
```

---

## Pattern 3: `any` in critical paths

`any` is contagious. A single `any` can spread through the entire
type system and dissolve guarantees across a whole module.

```typescript annotated
// DANGEROUS: Treating an API response as any
// (often happens with quick prototypes that end up in production)
async function loadDashboardData(): Promise<DashboardData> {
  const response = await fetch('/api/dashboard');
  const json: any = await response.json();
  // ^ json is any — from here on there is NO type safety

  return {
    userCount: json.users.count,
    // ^ If json.users is undefined: TypeError — no compile error!
    revenue: json.revenue.total * 100,
    // ^ If json.revenue is null: TypeError — no compile error!
    activeCourses: json.courses.filter((c: any) => c.active),
    // ^ any propagates: c is any, typos go undetected
  };
}

// DANGEROUS: any as a "universal" function type
function process(handler: any): void {
  handler.onSuccess();   // No compile error — even if handler has no onSuccess method
  handler.onErro();      // Typo (onError -> onErro) — no compile error!
}
```

**The any propagation in Angular services:**

```typescript annotated
// In an Angular service
@Injectable({ providedIn: 'root' })
export class ApiService {
  // DANGEROUS: Generic method with any escape
  get(url: string): Observable<any> {
    return this.http.get(url);
    // ^ The any propagates into all callers
  }
}

// In the component — caller loses all types:
export class ProductComponent {
  products: any[] = [];  // any spreads!

  ngOnInit(): void {
    this.api.get('/api/products').subscribe(data => {
      this.products = data;  // data is any — all TypeScript benefits gone
      this.products[0].price.toFixed(2);
      // Typo? Wrong type? Undefined? No hint.
    });
  }
}

// SAFE: Using the generic type system correctly
@Injectable({ providedIn: 'root' })
export class ApiService {
  get<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
}
```

---

## Pattern 4: Object.assign and spread with unknown sources

This pattern is particularly dangerous because it looks harmless and
is frequently used for configuration merging.

```typescript annotated
// SCENARIO: Merging user settings from localStorage
interface AppConfiguration {
  language: string;
  theme: 'light' | 'dark';
  fontSize: number;
}

const defaultConfig: AppConfiguration = {
  language: 'en',
  theme: 'light',
  fontSize: 16,
};

// DANGEROUS: Unvalidated input directly into Object.assign
function loadConfiguration(): AppConfiguration {
  const saved = localStorage.getItem('config');
  if (!saved) return defaultConfig;

  const userInput = JSON.parse(saved);
  // ^ userInput is any — JSON.parse returns any

  return Object.assign({}, defaultConfig, userInput);
  // ^ PROTOTYPE POLLUTION POSSIBLE!
  // If localStorage contains: '{"__proto__": {"isAdmin": true}}'
  // then Object.prototype.isAdmin = true is set
  // ALL objects in the app now have isAdmin: true
  // TypeScript sees no error!
}

// SAFE: Explicit property picking instead of blind merging
function loadConfigurationSafe(): AppConfiguration {
  const saved = localStorage.getItem('config');
  if (!saved) return defaultConfig;

  let userInput: unknown;
  try {
    userInput = JSON.parse(saved);
  } catch {
    return defaultConfig;
  }

  if (typeof userInput !== 'object' || userInput === null) {
    return defaultConfig;
  }

  // Only explicitly extract known properties
  const u = userInput as Record<string, unknown>;
  return {
    language: typeof u['language'] === 'string' ? u['language'] : defaultConfig.language,
    theme: (u['theme'] === 'light' || u['theme'] === 'dark') ? u['theme'] : defaultConfig.theme,
    fontSize: typeof u['fontSize'] === 'number' ? u['fontSize'] : defaultConfig.fontSize,
  };
}
```

---

> 💭 **Think about it:** Which of the four patterns have you caught yourself
> using? Which comes up most often in your Angular project?
>
> **Answer:** Honestly: all four appear in almost every project.
> `as` when processing forms, `!` with ViewChild, `any` in
> legacy API calls, `Object.assign` when merging settings. Knowing
> about them is the first step — the next sections show the safe alternatives.

---

## What you've learned

- **`as`** without prior validation is a lie to the compiler — and
  the compiler always believes you
- **`!`** (Non-null assertion) only shifts the crash from compile time
  to runtime; it doesn't solve the problem
- **`any`** is contagious and spreads through the entire type system;
  a single `any` can destroy the type safety of an entire module
- **`Object.assign`/spread** with unknown sources opens the door to prototype
  pollution — a JavaScript vulnerability that TypeScript is completely blind to
- All four patterns occur in real-world Angular development — recognition is
  the first step toward avoidance

> 🧠 **Explain it to yourself:** Why is `as` with prior validation
> acceptable, but `as` without validation dangerous? What is the exact
> difference?
>
> **Key points:** `as` with validation: you have verified the invariant,
> the cast reflects a proven fact | `as` without validation: you're asserting
> something without proof | TypeScript cannot distinguish between the two
> — which is why the responsibility lies with you | "Trust but verify" → "Verify
> then trust"

**Core concept to remember:** The four dangerous patterns (`as`, `!`, `any`,
blind merging) all share the same problem: they make a promise to the compiler
that is never proven. Every `as` and `!` in the code is a TODO
for real validation.

---

> **Pause point** — You've learned about the four main sources of danger
> in everyday TypeScript development.
>
> Continue with: [Section 03: JavaScript Pitfalls in TypeScript](./03-javascript-fallen-in-typescript.md)
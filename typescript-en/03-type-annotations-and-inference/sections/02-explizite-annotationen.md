# Section 2: Explicit Annotations

**Estimated reading time:** ~10 minutes

## What you'll learn here

- The complete annotation syntax for every situation
- The decision tree: when to annotate, when to let TypeScript infer
- Why over-annotating is harmful — not just unnecessary
- Practical rules for your everyday Angular/React work

---

## Questions to Think About for This Section

1. **Why is over-annotating not just unnecessary, but actively harmful?**
2. **Why do you normally NOT annotate callback parameters?**

---

## The Annotation Syntax

An annotation always takes the same form: **name, colon, type**.

```typescript
// Variables
let name: string = "Matthias";
let alter: number = 30;
let aktiv: boolean = true;

// Functions
function greet(name: string, age: number): string {
  return `Hallo ${name}, du bist ${age}`;
}

// Arrow Functions
const multiply = (a: number, b: number): number => a * b;

// Object Destructuring
function printUser({ name, age }: { name: string; age: number }): void {
  console.log(name, age);
}

// Array Destructuring
const [first, second]: [string, number] = ["hello", 42];

// Arrays
let items: string[] = [];
let items2: Array<string> = [];  // Generic syntax, identical

// Union Types
let id: string | number = "abc-123";

// Literal Types
let direction: "north" | "south" | "east" | "west" = "north";
```

> **Practical tip:** In Angular projects, you'll primarily encounter annotations in:
> - **Service methods**: `getData(): Observable<User[]>` (return type for RxJS)
> - **Component inputs**: `@Input() user: User | undefined`
> - **Template variables**: These are automatically inferred — you don't annotate them

---

## The Decision Tree: When to Annotate?

```
                      Should I annotate?
                             |
                   Is it a parameter?
                    /                \
                  Yes                No
             Annotate!         Is it exported?
                                  /           \
                                Yes            No
                            Annotate!      Is a value
                           (Return Type)  immediately assigned?
                                            /          \
                                          Yes           No
                                    Let TS infer    Annotate!
                                    (Inference      (TS doesn't
                                     is sufficient)  know the type)
```

### As a Table

| Situation | Annotate? | Reason |
|-----------|:---------:|--------|
| Function parameters | **Always** | TS can't infer parameters |
| Exported return types | **Yes** | Clear API, better error messages |
| Local variable with initial value | **No** | Inference is correct, annotation would be noise |
| Variable without initial value | **Yes** | TS would infer `any` |
| Callback parameters | **No** | Contextual typing takes over |
| Empty arrays `[]` | **Yes** | Otherwise becomes `any[]` or `never[]` |
| Complex return types | **Yes** | Documentation for the reader |
| API responses / JSON.parse | **Yes** | TS doesn't know the runtime type |

---

## Why Over-Annotating Is Harmful

Many TypeScript beginners annotate everything — "better safe than sorry". But over-annotating isn't just unnecessary, it's **actively harmful**:

### Problem 1: Double Maintenance

```typescript
// BAD: Annotation repeats what the value already says
const name: string = "Matthias";
const count: number = items.length;
const doubled: number[] = items.map((n: number): number => n * 2);

// GOOD: Let inference take over
const name = "Matthias";
const count = items.length;
const doubled = items.map(n => n * 2);
```

If you change the value, with an explicit annotation you need to update **two places**. With inference, the type adjusts automatically.

### Problem 2: Annotations Can Be **Less Precise** Than Inference

```typescript
// Annotation: type is BROADER than necessary
const status: string = "active";
// status is now 'string' -- accepts "anything"

// Inference: type is MORE PRECISE
const status = "active";
// status is now '"active"' -- a literal type!
```

This is a common misconception: many believe an explicit annotation is "more precise". In reality, inference for `const` variables is **more precise**, because it recognizes the literal type.

> **Think about it:** Why does `const status: string = "active"` give the type `string`, but `const status = "active"` gives the type `"active"`? What do you lose by annotating?

### Problem 3: Callback Annotations Destroy Readability

```typescript
// BAD: Noise in every callback
const users = data
  .filter((item: DataItem): boolean => item.active)
  .map((item: DataItem): string => item.name)
  .sort((a: string, b: string): number => a.localeCompare(b));

// GOOD: Clean pipeline
const users = data
  .filter(item => item.active)
  .map(item => item.name)
  .sort((a, b) => a.localeCompare(b));
```

Contextual typing (Section 5) ensures that `item`, `a`, and `b` have the correct type in both versions. The annotations are pure noise.

---

## When Annotations Are Indispensable

### 1. Function Parameters — Always

```typescript
// TS can't derive the type -- how would it?
function calculateDiscount(price: number, percentage: number): number {
  return price * (1 - percentage / 100);
}
```

You learned the reasons in Section 1: parameters are contracts, not observations.

### 2. Exported Return Types — For Stable APIs

```typescript
// In an Angular Service:
@Injectable({ providedIn: 'root' })
export class UserService {
  // Return type annotated: the consumer immediately knows what they get
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  // Without annotation: works, but...
  // - Error messages point to the caller, not the source
  // - Changes in the implementation can silently change the return type
}
```

> **Background:** Why are annotated return types for exports so important? Because TypeScript marks the **call site** on an error, not the function implementation. If `getUsers()` suddenly returns `Observable<any>` (because someone changed the implementation), you'll only see the error where you use `getUsers()` — possibly in a completely different file. With an annotated return type, TS marks the error directly in the function.

### 3. Variables Without Initial Value

```typescript
// BAD: any, because no value is present
let username;
username = getName();  // username is 'any' and stays 'any'

// GOOD: Annotation gives TS the missing information
let username: string;
username = getName();  // username is 'string'
```

### 4. Empty Arrays

```typescript
// BAD: any[], because no elements are present
const items = [];
items.push("hello");  // No error
items.push(42);       // Also no error -- anything goes in!

// GOOD: Specify the type
const items: string[] = [];
items.push("hello");  // OK
items.push(42);       // ERROR -- exactly what we want
```

### 5. External Data

```typescript
// JSON.parse always returns 'any'
const data: User = JSON.parse(responseBody);

// Even better: runtime validation (e.g., with zod)
const UserSchema = z.object({ name: z.string(), age: z.number() });
const data = UserSchema.parse(JSON.parse(responseBody));
```

---

## Practice: Typical Angular/React Patterns

### Angular Component

```typescript
@Component({ selector: 'app-user-list', templateUrl: './user-list.component.html' })
export class UserListComponent implements OnInit {
  // Annotation needed: no initial value
  users: User[] = [];
  selectedUser: User | null = null;

  // Parameter annotated, return type annotated for Observable
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    // Callback parameter: do NOT annotate (contextual typing)
    this.userService.getUsers().subscribe(users => {
      this.users = users;  // users is automatically User[]
    });
  }

  // Parameter annotated, return type optional for simple method
  selectUser(user: User): void {
    this.selectedUser = user;
  }
}
```

### React Component

```typescript
// Props interface: annotation
interface UserListProps {
  initialFilter?: string;
  onSelect: (user: User) => void;
}

// Props parameter annotated, rest inferred
const UserList: React.FC<UserListProps> = ({ initialFilter, onSelect }) => {
  // Local state: inference takes over
  const [users, setUsers] = useState<User[]>([]);  // Generics instead of annotation
  const [filter, setFilter] = useState(initialFilter ?? "");

  // useEffect callback: do NOT annotate
  useEffect(() => {
    fetchUsers().then(data => setUsers(data));
  }, []);

  // Event handler: contextual typing
  const handleClick = (user: User) => {  // Annotate here: separate callback!
    onSelect(user);
  };

  return /* JSX */;
};
```

> **Practical tip:** Note the pattern with `useState`: if the initial value determines the type (like `useState("")`), you don't need a generic. But with `useState<User[]>([])`, the generic is necessary because an empty array would otherwise be `never[]`.

---

## Experiment Box: Annotation vs. Inference Compared

> **Experiment:** Try the following in the TypeScript Playground:
>
> ```typescript
> // Step 1: Annotation makes the type broader!
> const status: string = "active";
> // Hover over 'status' -- what type? ("active" or string?)
>
> // Step 2: Without annotation -- more precise!
> const status2 = "active";
> // Hover over 'status2' -- what does the IDE show now? Why is that better?
>
> // Step 3: Callback annotations are noise
> const doubled1 = [1, 2, 3].map((n: number): number => n * 2);
> const doubled2 = [1, 2, 3].map(n => n * 2);
> // Do both compile? Hover over 'n' in both versions.
> // Is the type of 'n' in doubled2 still correct?
>
> // Step 4: When annotation is indispensable
> const items = [];          // What is the type? Why is that dangerous?
> const items2: string[] = []; // Better -- why?
> ```
>
> What happens when you write `items.push("hello")` and then `items.push(42)`? What about with `items2`?

---

## Rubber Duck Prompt

Imagine a colleague asks: "Should I write the type `: string` for `const name = 'Max'` or leave it out?"

Explain in 2-3 sentences why the annotation here is not just unnecessary, but can actually be **harmful**. (Hint: literal type vs. base type)

---

## What you've learned

- Annotation syntax: **Name: Type** — consistent for variables, parameters, and return types
- **Over-annotating is harmful**: it creates noise, requires double maintenance, and can be less precise than inference
- The decision tree: annotate parameters and boundaries, let the internals be inferred
- In Angular/React projects: annotate **service returns, props interfaces, and parameters**; let **callbacks, local variables, and state with values** be inferred

---

**Pause point.** When you're ready, continue with [Section 3: How Inference Works](./03-wie-inference-funktioniert.md) — there you'll look over the compiler's shoulder and learn its inference rules.
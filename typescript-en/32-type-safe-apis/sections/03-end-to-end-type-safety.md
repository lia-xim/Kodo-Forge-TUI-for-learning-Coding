# Section 3: End-to-End Type Safety — the tRPC Concept

> Estimated reading time: **10 minutes**
>
> Previous section: [02 - Zod/Valibot Runtime Validation](./02-runtime-validierung.md)
> Next section: [04 - GraphQL and Code Generation](./04-graphql-codegen.md)

---

## What you'll learn here

- What "End-to-End Type Safety" means and why it's a paradigm shift
- How tRPC transports types directly from server to client — without code generation
- The concept of type inference across process boundaries
- When tRPC makes sense and when it doesn't

---

## What is End-to-End Type Safety?

Imagine you're on a phone call with someone about an important
agreement — but the conversation is passed through three interpreters.
By the end, something completely different arrives from what you said.
That's exactly how traditional REST typing works: types exist
on both sides, but the connection between them is manual and fragile.

With traditional REST APIs there are three type worlds:

```
Backend Types ──(JSON)──> ??? ──(JSON)──> Frontend Types
                           ^
                    Types are lost here!
```

End-to-End Type Safety means: types flow **directly from backend
to frontend**, without manual synchronization:

```
Backend Types ────────────────────────> Frontend Types
                  (automatically!)
```

> 📖 **Background: The Evolution of API Typing**
>
> 1. **Manual** (2015): Maintain interfaces on both sides manually
> 2. **Shared Types** (2017): Monorepo with a shared types package
> 3. **Code Generation** (2018): OpenAPI/GraphQL → generate TypeScript types
> 4. **tRPC** (2021): Types flow automatically — no generation needed
>
> tRPC was developed by Alex "KATT" Johansson. The core idea:
> In a TypeScript monorepo you could import the router type directly
> — the compiler infers the rest. No HTTP layer,
> no serialization in the type system, no code generation.

---

## The tRPC Principle: Router as Type Source

```typescript annotated
// === SERVER SIDE ===
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

// Router defines endpoints with input/output schemas
const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    // ^ Input schema: Zod validates at runtime
    .query(async ({ input }) => {
      // ^ input: { id: string } — inferred from the Zod schema!
      const user = await db.user.findUnique({ where: { id: input.id } });
      return user;
      // ^ Return type is inferred: User | null
    }),

  createUser: t.procedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      // ^ input: { name: string; email: string }
      return db.user.create({ data: input });
    }),
});

// THIS is the key: export the router TYPE
export type AppRouter = typeof appRouter;
// ^ Only the type is exported — no runtime code!
// The client imports this type and has ALL endpoint types
```

### Client Side: Type Inference Across Process Boundaries

```typescript annotated
// === CLIENT SIDE ===
import { createTRPCClient, httpBatchLink } from '@trpc/client';
// tRPC v11: links array instead of url directly
import type { AppRouter } from '../server/router';
// ^ Only 'import type' — no server code in the client bundle!

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:3000/api/trpc' })],
});

// Full autocomplete and type safety:
const user = await client.getUser.query({ id: "123" });
// ^ user: User | null — inferred from the server code!
// ^ input is checked against { id: string }
// ^ Typos like { idd: "123" } → compile error!

const newUser = await client.createUser.mutate({
  name: "Max",
  email: "max@test.de",
});
// ^ newUser: User — inferred from db.user.create()
```

> 💭 **Think about it:** How can the client know the server types without
> importing the server code? How does `import type` work?
>
> **Answer:** `import type` imports ONLY the TypeScript type — at
> runtime NOTHING is imported (type erasure). The TypeScript compiler
> reads the server files for type information, but the bundler
> removes the import entirely. Prerequisite: both projects must
> be in the same TypeScript context (monorepo, workspace, or
> tsconfig project references).

---

## The Type Inference Magic in Detail

How does it work? Think of a mirror system in a periscope:
the TypeScript compiler reads the server code and "mirrors" the
type information to the client — no runtime code travels along, only the
shape. `import type` is this mirror: no weight, just contour.

The magic of tRPC is based on TypeScript inference:

```typescript annotated
// Simplified version of the tRPC mechanism:

// 1. Procedure definition with Zod schema
function procedure<TInput, TOutput>(config: {
  input: z.ZodType<TInput>;
  resolve: (input: TInput) => Promise<TOutput>;
}) {
  return config;
  // ^ TypeScript infers TInput from the Zod schema
  // ^ and TOutput from the resolve return type
}

// 2. Router collects all procedures
function router<T extends Record<string, ReturnType<typeof procedure>>>(routes: T) {
  return routes;
  // ^ T is inferred as the exact type — each key with its procedure type
}

// 3. Client uses the router type for autocomplete
type InferInput<P> = P extends { input: z.ZodType<infer T> } ? T : never;
type InferOutput<P> = P extends { resolve: (...args: any[]) => Promise<infer T> } ? T : never;
// ^ Conditional types extract input/output from the procedure definition

// The result: the client "sees" the server types
// WITHOUT code generation, WITHOUT manual type sharing
```

> 🧠 **Explain it to yourself:** Why does tRPC need NO code generation
> script like OpenAPI or GraphQL? What replaces the code generation?
>
> **Key points:** TypeScript compiler IS the "generation" | import type
> transports types without runtime code | Conditional types + infer
> extract input/output | Monorepo setup required so both sides
> are in the same TS context

---

## tRPC in React (TanStack Query Integration)

```typescript annotated
// React-specific tRPC integration
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';

const trpc = createTRPCReact<AppRouter>();

function UserProfile({ userId }: { userId: string }) {
  // useQuery — full type inference from the server router!
  const { data, isLoading } = trpc.getUser.useQuery({ id: userId });
  // ^ data: User | null | undefined
  // ^ Input is checked against the Zod schema

  // useMutation — same type safety
  const createUser = trpc.createUser.useMutation();
  // ^ createUser.mutate() only accepts { name: string; email: string }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>User not found</div>;

  return <div>{data.name}</div>;
  // ^ data: User — after null check, data is guaranteed to be User
}
```

---

## When tRPC — when not?

```typescript
// ✅ tRPC is ideal when:
// - Frontend and backend in one monorepo (TypeScript)
// - The team controls both sides
// - Next.js, Remix, or similar fullstack framework
// - Fast iteration is more important than API documentation

// ❌ tRPC is NOT ideal when:
// - API is consumed by external teams / other languages
// - Backend is not TypeScript (Java, Go, Python)
// - Public API that needs to be documented
// - GraphQL ecosystem is already in use
```

> ⚡ **Practical tip for Angular:** tRPC is primarily designed for React/Next.js.
> For Angular there is `@analogjs/trpc` (Analog Framework)
> or you can use the vanilla tRPC client:
>
> ```typescript
> // Angular Service with tRPC vanilla client
> import { createTRPCClient, httpBatchLink } from '@trpc/client';
> import type { AppRouter } from '../server/router';
>
> @Injectable({ providedIn: 'root' })
> export class TrpcService {
>   // tRPC v11: links array instead of url directly
>   private client = createTRPCClient<AppRouter>({
>     links: [httpBatchLink({ url: '/api/trpc' })],
>   });
>
>   getUser(id: string) {
>     return from(this.client.getUser.query({ id }));
>     // ^ Observable<User | null> — promise converted to observable
>   }
> }
> ```

---

## Transferring the Concept: Typed RPC Without tRPC

You can apply the principle without the tRPC library too:

```typescript annotated
// Shared Types (simplified tRPC principle)
// shared/api-contract.ts
export const apiContract = {
  getUser: {
    input: z.object({ id: z.string() }),
    output: z.object({ id: z.string(), name: z.string() }),
  },
  createUser: {
    input: z.object({ name: z.string(), email: z.string().email() }),
    output: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  },
} as const;

export type ApiContract = typeof apiContract;
// ^ Export the type — client and server import this
```

> 🔬 **Experiment:** Build a minimal "tRPC-like" client
> that derives types from a contract:
>
> ```typescript
> type Contract = typeof apiContract;
>
> type TypedClient = {
>   [K in keyof Contract]: {
>     query: (input: z.infer<Contract[K]["input"]>) =>
>       Promise<z.infer<Contract[K]["output"]>>;
>   };
> };
>
> // What is the type of client.getUser.query?
> // Answer: (input: { id: string }) => Promise<{ id: string; name: string }>
> // Full inference from the contract — without code generation!
> ```

---

## What you've learned

- End-to-End Type Safety transports types automatically from server to client
- tRPC uses `import type` and TypeScript inference instead of code generation
- The router type is the single source of truth — the client derives all types from it
- tRPC requires a TypeScript monorepo — it does not work with other languages
- The principle (shared contract + type inference) can also be applied without tRPC

**Core concept to remember:** tRPC makes the network boundary invisible to the type system. The client "sees" the server types as if it were a local function call. That is the holy grail of API typing — but it requires a TypeScript monorepo.

---

> **Pause point** — End-to-end types are the ideal case. For the
> real world we often need other solutions — like GraphQL.
>
> Continue with: [Section 04: GraphQL and Code Generation](./04-graphql-codegen.md)
# Sektion 3: End-to-End Type Safety — das tRPC-Konzept

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Zod/Valibot Runtime-Validierung](./02-runtime-validierung.md)
> Naechste Sektion: [04 - GraphQL und Code Generation](./04-graphql-codegen.md)

---

## Was du hier lernst

- Was "End-to-End Type Safety" bedeutet und warum es ein Paradigmenwechsel ist
- Wie tRPC Typen vom Server direkt zum Client transportiert — ohne Code Generation
- Das Konzept der Typ-Inferenz ueber Prozessgrenzen hinweg
- Wann tRPC sinnvoll ist und wann nicht

---

## Was ist End-to-End Type Safety?

Stell dir vor, du telefonierst mit jemandem ueber eine wichtige
Vereinbarung — aber das Gespraech wird durch drei Uebersetzer
weitergereicht. Am Ende kommt etwas völlig anderes an als du gesagt hast.
Genau so funktioniert traditionelle REST-Typisierung: Die Typen existieren
auf beiden Seiten, aber die Verbindung dazwischen ist manuell und fragil.

Bei traditionellen REST APIs gibt es drei Typ-Welten:

```
Backend-Typen ──(JSON)──> ??? ──(JSON)──> Frontend-Typen
                           ^
                    Hier gehen Typen verloren!
```

End-to-End Type Safety bedeutet: Die Typen fliessen **vom Backend
direkt zum Frontend**, ohne manuelles Synchronisieren:

```
Backend-Typen ────────────────────────> Frontend-Typen
                  (automatisch!)
```

> 📖 **Hintergrund: Die Evolution der API-Typisierung**
>
> 1. **Manuell** (2015): Interface auf beiden Seiten manuell pflegen
> 2. **Shared Types** (2017): Monorepo mit geteiltem Types-Package
> 3. **Code Generation** (2018): OpenAPI/GraphQL → TypeScript-Typen generieren
> 4. **tRPC** (2021): Typen fliessen automatisch — keine Generation noetig
>
> tRPC wurde von Alex "KATT" Johansson entwickelt. Die Kernidee:
> In einem TypeScript-Monorepo koenntest du den Router-Typ direkt
> importieren — der Compiler inferiert den Rest. Keine HTTP-Schicht,
> keine Serialisierung im Typ-System, keine Code-Generation.

---

## Das tRPC-Prinzip: Router als Typ-Quelle

```typescript annotated
// === SERVER-SEITE ===
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

// Router definiert Endpunkte mit Input/Output-Schemas
const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    // ^ Input-Schema: Zod validiert zur Laufzeit
    .query(async ({ input }) => {
      // ^ input: { id: string } — inferiert aus dem Zod-Schema!
      const user = await db.user.findUnique({ where: { id: input.id } });
      return user;
      // ^ Rueckgabetyp wird inferiert: User | null
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

// DAS ist der Schluessel: Den Router-TYP exportieren
export type AppRouter = typeof appRouter;
// ^ NUR der Typ wird exportiert — kein Runtime-Code!
// Der Client importiert diesen Typ und hat ALLE Endpunkt-Typen
```

### Client-Seite: Typ-Inferenz ueber Prozessgrenzen

```typescript annotated
// === CLIENT-SEITE ===
import { createTRPCClient, httpBatchLink } from '@trpc/client';
// tRPC v11: links-Array statt url direkt
import type { AppRouter } from '../server/router';
// ^ Nur 'import type' — kein Server-Code im Client-Bundle!

const client = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:3000/api/trpc' })],
});

// Volle Autocomplete und Typ-Sicherheit:
const user = await client.getUser.query({ id: "123" });
// ^ user: User | null — inferiert aus dem Server-Code!
// ^ input wird gegen { id: string } geprueft
// ^ Tippfehler wie { idd: "123" } → Compile-Error!

const newUser = await client.createUser.mutate({
  name: "Max",
  email: "max@test.de",
});
// ^ newUser: User — inferiert aus db.user.create()
```

> 💭 **Denkfrage:** Wie kann der Client die Server-Typen kennen, ohne
> den Server-Code zu importieren? Wie funktioniert `import type`?
>
> **Antwort:** `import type` importiert NUR den TypeScript-Typ — zur
> Laufzeit wird NICHTS importiert (Type Erasure). Der TypeScript-Compiler
> liest die Server-Dateien fuer die Typ-Information, aber der Bundler
> entfernt den Import komplett. Voraussetzung: Beide Projekte muessen
> im gleichen TypeScript-Kontext sein (Monorepo, Workspace, oder
> tsconfig Project References).

---

## Das Typ-Inferenz-Magie im Detail

Wie funktioniert das? Denk an ein Spiegelsystem in einem Periskop:
Der TypeScript-Compiler liest den Server-Code und "spiegelt" die
Typ-Information zum Client — kein Runtime-Code reist mit, nur die
Form. `import type` ist dieser Spiegel: kein Gewicht, nur Kontur.

Die Magie von tRPC basiert auf TypeScript-Inferenz:

```typescript annotated
// Vereinfachte Version des tRPC-Mechanismus:

// 1. Procedure-Definition mit Zod-Schema
function procedure<TInput, TOutput>(config: {
  input: z.ZodType<TInput>;
  resolve: (input: TInput) => Promise<TOutput>;
}) {
  return config;
  // ^ TypeScript inferiert TInput aus dem Zod-Schema
  // ^ und TOutput aus dem resolve-Rueckgabetyp
}

// 2. Router sammelt alle Procedures
function router<T extends Record<string, ReturnType<typeof procedure>>>(routes: T) {
  return routes;
  // ^ T wird als exakter Typ inferiert — jeder Key mit seinem Procedure-Typ
}

// 3. Client nutzt den Router-Typ fuer Autocomplete
type InferInput<P> = P extends { input: z.ZodType<infer T> } ? T : never;
type InferOutput<P> = P extends { resolve: (...args: any[]) => Promise<infer T> } ? T : never;
// ^ Conditional Types extrahieren Input/Output aus der Procedure-Definition

// Das Ergebnis: Der Client "sieht" die Server-Typen
// OHNE Code-Generation, OHNE manuelles Typ-Sharing
```

> 🧠 **Erklaere dir selbst:** Warum braucht tRPC KEIN Code-Generation-
> Script wie OpenAPI oder GraphQL? Was ersetzt die Code-Generation?
>
> **Kernpunkte:** TypeScript-Compiler IS die "Generation" | import type
> transportiert Typen ohne Runtime-Code | Conditional Types + infer
> extrahieren Input/Output | Monorepo-Setup noetig damit beide Seiten
> im gleichen TS-Kontext sind

---

## tRPC in React (TanStack Query Integration)

```typescript annotated
// React-spezifische tRPC-Integration
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/router';

const trpc = createTRPCReact<AppRouter>();

function UserProfile({ userId }: { userId: string }) {
  // useQuery — volle Typ-Inferenz aus dem Server-Router!
  const { data, isLoading } = trpc.getUser.useQuery({ id: userId });
  // ^ data: User | null | undefined
  // ^ Input wird gegen das Zod-Schema geprueft

  // useMutation — gleiche Typ-Sicherheit
  const createUser = trpc.createUser.useMutation();
  // ^ createUser.mutate() akzeptiert nur { name: string; email: string }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>User not found</div>;

  return <div>{data.name}</div>;
  // ^ data: User — nach null-Check ist data garantiert User
}
```

---

## Wann tRPC — wann nicht?

```typescript
// ✅ tRPC ist ideal wenn:
// - Frontend und Backend in einem Monorepo (TypeScript)
// - Das Team kontrolliert beide Seiten
// - Next.js, Remix oder aehnliches Fullstack-Framework
// - Schnelle Iteration wichtiger als API-Dokumentation

// ❌ tRPC ist NICHT ideal wenn:
// - API wird von externen Teams / Sprachen konsumiert
// - Backend ist nicht TypeScript (Java, Go, Python)
// - Oeffentliche API die dokumentiert sein muss
// - GraphQL-Ecosystem wird bereits genutzt
```

> ⚡ **Praxis-Tipp fuer Angular:** tRPC ist primaer fuer React/Next.js
> designed. Fuer Angular gibt es `@analogjs/trpc` (Analog Framework)
> oder du nutzt den vanilla tRPC-Client:
>
> ```typescript
> // Angular Service mit tRPC vanilla client
> import { createTRPCClient, httpBatchLink } from '@trpc/client';
> import type { AppRouter } from '../server/router';
>
> @Injectable({ providedIn: 'root' })
> export class TrpcService {
>   // tRPC v11: links-Array statt url direkt
>   private client = createTRPCClient<AppRouter>({
>     links: [httpBatchLink({ url: '/api/trpc' })],
>   });
>
>   getUser(id: string) {
>     return from(this.client.getUser.query({ id }));
>     // ^ Observable<User | null> — Promise in Observable konvertiert
>   }
> }
> ```

---

## Das Konzept uebertragen: Typed RPC ohne tRPC

Du kannst das Prinzip auch ohne tRPC-Library anwenden:

```typescript annotated
// Shared Types (vereinfachtes tRPC-Prinzip)
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
// ^ Typ exportieren — Client und Server importieren diesen
```

> 🔬 **Experiment:** Baue einen minimalen "tRPC-aehnlichen" Client
> der Typen aus einem Contract ableitet:
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
> // Was ist der Typ von client.getUser.query?
> // Antwort: (input: { id: string }) => Promise<{ id: string; name: string }>
> // Volle Inferenz aus dem Contract — ohne Code-Generation!
> ```

---

## Was du gelernt hast

- End-to-End Type Safety transportiert Typen automatisch vom Server zum Client
- tRPC nutzt `import type` und TypeScript-Inferenz statt Code-Generation
- Der Router-Typ ist die Single Source of Truth — Client leitet alle Typen davon ab
- tRPC braucht ein TypeScript-Monorepo — es funktioniert nicht mit anderen Sprachen
- Das Prinzip (Shared Contract + Typ-Inferenz) laesst sich auch ohne tRPC umsetzen

**Kernkonzept zum Merken:** tRPC macht die Netzwerkgrenze unsichtbar fuer das Typsystem. Der Client "sieht" die Server-Typen so, als waere es ein lokaler Funktionsaufruf. Das ist der heilige Gral der API-Typisierung — aber es erfordert ein TypeScript-Monorepo.

---

> **Pausenpunkt** — End-to-End Types sind der Idealfall. Fuer die
> reale Welt brauchen wir oft andere Loesungen — wie GraphQL.
>
> Weiter geht es mit: [Sektion 04: GraphQL und Code Generation](./04-graphql-codegen.md)

# Sektion 3: API Layer — Type-safe REST und Validierung

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - Domain Modeling](./02-domain-modeling.md)
> Naechste Sektion: [04 - Business Logic](./04-business-logic.md)

---

## Was du hier lernst

- Wie man eine **typsichere API-Schicht** baut die Route, Method, Request und Response verbindet
- **Route-Definition als Single Source of Truth** — ein Typ fuer alles
- **Validierung an der Systemgrenze** mit Type Guards (keine externen Dependencies)
- Wie **Error-Responses als Typ** modelliert werden

---

## Schicht 2: Die API

Die API-Schicht ist die **defensive Schale** (L39). Hier kommen
externe Daten rein — und hier muessen sie validiert werden.

```typescript annotated
// ── API-Vertrag: Ein Typ definiert ALLES ────────────────────────

interface ApiRoute<
  Method extends "GET" | "POST" | "PUT" | "DELETE",
  Path extends string,
  RequestBody,
  ResponseBody,
  ErrorBody
> {
  method: Method;
  path: Path;
  // Phantom Types (L26): Diese Properties existieren nur im Typ
  _request: RequestBody;
  _response: ResponseBody;
  _error: ErrorBody;
}

// Konkrete Routes:
type GetUserRoute = ApiRoute<
  "GET",
  "/api/users/:userId",
  never,                                    // GET hat keinen Body
  { id: UserId; name: string; email: string },
  { code: "NOT_FOUND"; message: string }
>;

type CreateOrderRoute = ApiRoute<
  "POST",
  "/api/orders",
  { userId: UserId; items: { productId: string; quantity: number }[] },
  { orderId: OrderId; status: "draft" },
  { code: "VALIDATION_ERROR"; fields: Record<string, string> }
>;
```

> 📖 **Hintergrund: API-Vertraege als Typen**
>
> Bibliotheken wie tRPC, Hono und Elysia nutzen genau dieses Pattern:
> Die API-Route-Definition IST der Typ. Dadurch teilen Client und
> Server denselben Typ — Aenderungen am Server fuehren zu Compile-
> Fehlern im Client. Das ist die End-to-End-Typsicherheit die
> traditionelle REST-APIs nicht bieten. In unserem Projekt zeigen
> wir die Kernidee ohne externe Dependencies.

---

## Route-Parameter-Extraktion (L37)

```typescript annotated
// Nutze Type-Level Programming (L37) fuer Route-Parameter:
type ExtractRouteParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

// Test:
type UserRouteParams = ExtractRouteParams<"/api/users/:userId">;
// ^ { userId: string }

// Typsicherer Route-Handler:
type RouteHandler<R extends ApiRoute<any, any, any, any, any>> =
  R extends ApiRoute<infer _M, infer Path, infer Req, infer Res, infer Err>
    ? (ctx: {
        params: ExtractRouteParams<Path>;
        body: Req;
      }) => Promise<
        | { ok: true; data: Res; status: 200 | 201 }
        | { ok: false; error: Err; status: 400 | 404 | 500 }
      >
    : never;
```

### Handler implementieren

```typescript annotated
// Der Handler fuer GET /api/users/:userId:
const getUserHandler: RouteHandler<GetUserRoute> = async (ctx) => {
  // ctx.params.userId ist string — Autocomplete!
  const userId = createUserId(ctx.params.userId);
  const user = await userRepository.findById(userId);

  if (!user) {
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: `User ${ctx.params.userId} not found` },
      status: 404,
    };
  }

  return {
    ok: true,
    data: { id: user.id, name: user.name, email: user.email },
    status: 200,
  };
};
```

> 🧠 **Erklaere dir selbst:** Warum definieren wir Error-Typen
> als Teil der Route statt sie global zu haben? Was ist der Vorteil?
> **Kernpunkte:** Jede Route hat spezifische Fehler | GET /users:
> NOT_FOUND | POST /orders: VALIDATION_ERROR | Globale Fehler-Typen
> waeren zu weit — man wuesste nicht welche Fehler moeglich sind |
> Spezifische Fehler-Typen = bessere Client-Fehlerbehandlung

---

## Validierung an der Systemgrenze

```typescript annotated
// ── Validator fuer CreateOrderRoute ─────────────────────────────
// Ohne externe Dependencies — pure TypeScript Type Guards:

interface CreateOrderInput {
  userId: string;
  items: { productId: string; quantity: number }[];
}

function isCreateOrderInput(data: unknown): data is CreateOrderInput {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.userId !== "string") return false;
  if (!Array.isArray(obj.items)) return false;

  return obj.items.every(item => {
    if (typeof item !== "object" || item === null) return false;
    const i = item as Record<string, unknown>;
    return typeof i.productId === "string" &&
           typeof i.quantity === "number" &&
           Number.isInteger(i.quantity) &&
           i.quantity > 0;
  });
}

// Verwendung im Handler:
const createOrderHandler: RouteHandler<CreateOrderRoute> = async (ctx) => {
  // ctx.body ist vom API-Framework als unknown behandelt
  // Der Typ sagt CreateOrderInput, aber wir validieren trotzdem:
  if (!isCreateOrderInput(ctx.body)) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", fields: { body: "Invalid input" } },
      status: 400,
    };
  }

  const userId = createUserId(ctx.body.userId);
  const orderId = createOrderId();
  // ... Order erstellen
  return { ok: true, data: { orderId, status: "draft" }, status: 201 };
};
```

> ⚡ **Framework-Bezug:** In Angular wuerde die Validierung in einem
> HTTP-Interceptor oder im Service stattfinden. Die Route-Definitionen
> koennten als Angular-DI-Token registriert werden. In Next.js
> wuerden die Route-Handler in `app/api/users/[userId]/route.ts`
> liegen — und die Typ-Definitionen in einer geteilten Datei.
> Das Pattern ist identisch, nur die Integration unterscheidet sich.

> 💭 **Denkfrage:** Wir validieren `ctx.body` obwohl der Typ schon
> `CreateOrderInput` sagt. Ist das nicht redundant?
>
> **Antwort:** Nein! Der Typ kommt von der Route-Definition — er ist
> eine DEKLARATION, keine Garantie. Die echten Daten kommen von
> aussen (HTTP-Request). Ohne Validierung koenntest du `{ foo: "bar" }`
> als CreateOrderInput behandeln. Die Validierung ist die defensive
> Schale — der Typ ist der offensive Kern.

---

## Error-Handling: Result-Pattern (L25)

```typescript annotated
// ── Result-Typ fuer die API-Schicht ─────────────────────────────
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// API-spezifische Fehler:
type ApiError =
  | { code: "NOT_FOUND"; resource: string; id: string }
  | { code: "VALIDATION_ERROR"; fields: Record<string, string> }
  | { code: "UNAUTHORIZED"; message: string }
  | { code: "INTERNAL"; message: string };

// Typsicherer Error-Response-Builder:
function errorResponse(error: ApiError, status: number): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Exhaustive Error-Mapping:
function mapErrorToStatus(error: ApiError): number {
  switch (error.code) {
    case "NOT_FOUND": return 404;
    case "VALIDATION_ERROR": return 400;
    case "UNAUTHORIZED": return 401;
    case "INTERNAL": return 500;
    default: {
      const _: never = error;
      return 500;
    }
  }
}
```

---

## Experiment: Erweitere die API

```typescript
// Aufgabe 1: Definiere eine UpdateOrderStatusRoute:
// PUT /api/orders/:orderId/status
// Body: { status: "paid"; paymentId: string } | { status: "cancelled"; reason: string }
// Response: Order (aktualisiert)
// Error: NOT_FOUND | INVALID_TRANSITION

// Aufgabe 2: Baue einen typsicheren API-Client:
// type ApiClient = {
//   getUser(userId: string): Promise<Result<GetUserRoute["_response"], GetUserRoute["_error"]>>;
//   createOrder(input: CreateOrderRoute["_request"]): Promise<Result<...>>;
// };
// Die Typen kommen direkt aus den Route-Definitionen!

// Aufgabe 3: Was passiert wenn du den Error-Typ einer Route aenderst?
// Welche Stellen im Code muessen sich anpassen?
// (Antwort: Der Compiler zeigt alle betroffenen Stellen!)
```

---

## Was du gelernt hast

- **API-Routes als Typen** verbinden Method, Path, Request, Response und Error in einer Definition
- **Route-Parameter-Extraktion** (L37) macht URL-Params typsicher
- **Validierung an der Systemgrenze** mit Type Guards — die defensive Schale in Aktion
- **Error-Typen als Discriminated Union** mit exhaustivem Status-Mapping
- Der API-Vertrag ist die **Single Source of Truth** fuer Client und Server

> 🧠 **Erklaere dir selbst:** Welche Lektionen stecken in dieser
> API-Schicht? Zaehle: Generics (L13), Template Literal Types (L18),
> Type-Level Programming (L37), Result (L25), Discriminated Unions
> (L12), Exhaustive Checks (L12), Type Guards (L11), Branded Types
> (L24). Wie viele findest du?
> **Kernpunkte:** Mindestens 8 Konzepte | Die API-Schicht ist die
> komplexeste weil sie alles verbindet | Aber jeder einzelne
> Baustein ist dir vertraut

**Kernkonzept zum Merken:** Die API ist die Grenze zwischen "vertrauenswuerdig" und "unvertrauenswuerdig". Alles was reinkommt ist `unknown` bis es validiert ist. Alles was rausgeht hat einen praezisen Typ. Das ist die Essenz der defensiven Schale.

---

> **Pausenpunkt** — Die API-Schicht steht. Naechste Schicht:
> Business Logic mit Generics und Patterns.
>
> Weiter geht es mit: [Sektion 04: Business Logic](./04-business-logic.md)

# Sektion 5: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Event Names](./04-event-names.md)

---

## Was du hier lernst

- CSS Property Typen
- Typsichere Route-Definitionen
- i18n Translation Keys
- Template Literal Types in echten Frameworks

---

## Pattern 1: CSS Properties

```typescript
type CssLength = `${number}${"px" | "em" | "rem" | "%"}`;
type CssColor = `#${string}` | `rgb(${number}, ${number}, ${number})`;

function setStyle(prop: string, value: CssLength | CssColor) {
  console.log(`${prop}: ${value}`);
}

setStyle("width", "100px");        // OK
setStyle("margin", "2rem");        // OK
setStyle("color", "#ff0000");      // OK
// setStyle("width", "100");       // Error! Einheit fehlt
```

---

## Pattern 2: Route-Typen mit Parameter-Extraktion

```typescript
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never;

type Params = ExtractParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

// Route-Handler mit extrahierten Parametern:
type RouteHandler<Path extends string> = (
  params: Record<ExtractParams<Path>, string>
) => void;

type UserPostHandler = RouteHandler<"/users/:userId/posts/:postId">;
// (params: { userId: string; postId: string }) => void
```

---

## Pattern 3: i18n Translation Keys

```typescript
type TranslationKey =
  | `nav.${string}`
  | `page.${string}.title`
  | `page.${string}.description`
  | `error.${string}`;

function t(key: TranslationKey): string {
  return key; // Placeholder
}

t("nav.home");                // OK
t("page.about.title");       // OK
t("error.404");               // OK
// t("random.key");           // Error!
```

---

## Pattern 4: Type-Safe SQL Columns

```typescript
type Table = "users" | "products" | "orders";
type Column<T extends Table> =
  T extends "users" ? "id" | "name" | "email" :
  T extends "products" ? "id" | "name" | "price" :
  T extends "orders" ? "id" | "userId" | "total" :
  never;

type QualifiedColumn<T extends Table> = `${T}.${Column<T>}`;

type UserCols = QualifiedColumn<"users">;
// "users.id" | "users.name" | "users.email"
```

---

## Template Literal Types in echten Frameworks

| Framework | Verwendung |
|-----------|-----------|
| React | `on${Capitalize<EventName>}` fuer Event-Props |
| Vue | Template Literal Types fuer Prop-Typen |
| Express | Route-Parameter mit `:param` Pattern |
| Prisma | Generierte Typen aus Schema |
| tRPC | Procedure-Namen als Template Literals |

---

## Pausenpunkt — Ende der Lektion

Du beherrschst jetzt Template Literal Types — von einfacher Konkatenation
bis zu komplexen String-Parsern auf Type-Level.

> **Naechste Lektion:** [19 - Modules & Declarations](../../19-modules-und-declarations/README.md)

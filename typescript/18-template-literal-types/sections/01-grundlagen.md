# Sektion 1: Template Literal Types — Grundlagen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Naechste Sektion: [02 - Utility Types](./02-utility-types.md)

---

## Was du hier lernst

- Template Literal Syntax auf Type-Level
- String-Konkatenation mit Typen
- Union-Expansion in Template Literals
- Unterschied zu Runtime Template Literals

---

## Template Literals auf Type-Level

Wie JavaScript Template Literals, aber fuer TYPEN:

```typescript
type Greeting = `Hello, ${string}!`;

const a: Greeting = "Hello, World!";  // OK
const b: Greeting = "Hello, Max!";    // OK
const c: Greeting = "Hi, Max!";       // Error! Beginnt nicht mit "Hello, "
```

---

## String-Konkatenation

```typescript
type Prefix = "get" | "set";
type Name = "Name" | "Age";

type Methods = `${Prefix}${Name}`;
// "getName" | "getAge" | "setName" | "setAge"
```

> **Union-Expansion:** TypeScript bildet automatisch das kartesische Produkt
> aller Union-Member. 2 Prefixe x 2 Namen = 4 Kombinationen.

---

## Mit Literal Types

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiPath = "/users" | "/products";

type Endpoint = `${HttpMethod} ${ApiPath}`;
// "GET /users" | "GET /products" | "POST /users" | "POST /products" | ...
// 4 * 2 = 8 Kombinationen
```

---

## String-Typen als Constraints

```typescript
type CssProperty = `${string}-${string}`;

function setCss(prop: CssProperty, value: string) {
  console.log(`${prop}: ${value}`);
}

setCss("background-color", "red");  // OK
setCss("font-size", "16px");        // OK
// setCss("color", "red");          // Error! Kein Bindestrich
```

---

## Pausenpunkt

**Kernerkenntnisse:**
- `` `${A}${B}` `` auf Type-Level = String-Konkatenation fuer Typen
- Unions werden zum kartesischen Produkt expandiert
- Nuetzlich fuer Constraints die ein String-Muster erzwingen

> **Weiter:** [Sektion 02 - Utility Types](./02-utility-types.md)

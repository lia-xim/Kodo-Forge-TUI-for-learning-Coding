# Sektion 4: Array-Verbesserungen und Control-Flow

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Inferred Type Predicates](./03-inferred-type-predicates.md)
> Naechste Sektion: [05 - Performance und Editor-Features](./05-performance-und-editor-features.md)

---

## Was du hier lernst

- Wie TypeScript 5.4 **Narrowing in Closures verbessert** hat — ein langer Schmerzpunkt
- Warum `Array.isArray()` jetzt korrekt mit **readonly Arrays** funktioniert
- Neue **Utility Types und Typisierungen** fuer `Object.groupBy` und `Array.fromAsync`
- Wie `Object.hasOwn` die typsicherere Alternative zu `hasOwnProperty` ist

---

## Preserved Narrowing in Closures (TypeScript 5.4)

Hier ist ein Code-Muster das du hundertmal geschrieben hast:

```typescript
function processUser(user: User | null) {
  if (!user) return;
  
  // Hier: user ist User (narrowed)
  
  const greet = () => {
    console.log(user.name);
    //          ^^^^^^^^^^
    // Vor TS 5.4: Fehler!
    // "'user' is possibly null"
    // Aber... wir haben doch oben geprueft?
  };
  
  greet();
}
```

Vor TypeScript 5.4 gab es hier einen Compile-Fehler. Der Grund: TypeScript war
**konservativ** bei Closures. Der Compiler dachte: "Zwischen der Null-Pruefung und
der Closure-Ausfuehrung koennte `user` reassigned worden sein. Ich kann nicht
sicher sein."

Das war technisch korrekt — aber uebervorsichtig.

> 📖 **Hintergrund: Das Closure-Narrowing-Problem**
>
> TypeScript's Control Flow Analysis (CFA) ist normaleweise brilliant. Bei Closures
> aber gab es ein fundamentales Problem: Eine Closure wird **spaeter** ausgefuehrt
> (moeglicherweise). Wenn `user` eine Variable ist die reassigned werden kann, dann
> gilt das Narrowing bei der Closure-Erstellung nicht mehr zur Closure-Ausfuehrung.
>
> Das TypeScript-Team loeste das Problem elegant in 5.4: TypeScript analysiert jetzt
> ob die Variable **zwischen dem Narrowing und der Closure-Verwendung reassigned wird**.
> Wenn nicht — dann ist das Narrowing auch in der Closure gueltig.
>
> Das klingt einfach, ist aber eine signifikante Erweiterung der Control Flow Analysis.

```typescript annotated
// TypeScript 5.4: Preserved Narrowing in Closures

function processOrder(order: Order | null) {
  if (!order) return;
  // order: Order  (narrowed -- null ausgeschlossen)

  // TypeScript 5.4 analysiert: Wird 'order' zwischen hier und der Closure
  // reassigned? Nein? Dann gilt das Narrowing in der Closure!

  const processItems = () => {
    order.items.forEach(item => {  // Kein Fehler mehr!
      //  ^^^^^^^^^^^ TypeScript weiss: order ist Order
      processItem(item, order.id);
    });
  };

  // TypeScript 5.4: OK! order ist nie reassigned, also ist es in der
  // Closure immer noch sicher vom Typ Order
  processItems();
}

// ABER: Wenn die Variable reassigned werden kann, gilt das NICHT:
function processOptional(data: string | null) {
  if (!data) return;
  // data: string

  // Irgendwo zwischen Narrowing und Closure koennte data neu gesetzt werden:
  setTimeout(() => {
    console.log(data.toUpperCase());
    // TypeScript muss vorsichtig sein: setTimeout laeuft ASYNCHRON
    // Bis setTimeout-Callback laeuft, koennte data reassigned sein
    // TS 5.4: Das ist ein Grenzfall -- bei let wird TS vorsichtiger sein
  }, 1000);
}
```

> 🧠 **Erklaere dir selbst:** Warum ist TypeScript bei `setTimeout`-Callbacks
> vorsichtiger als bei synchronen Closures? Was ist der technische Unterschied?
>
> **Kernpunkte:** Synchrone Closure wird noch waehrend der Funktion ausgefuehrt |
> `setTimeout`-Callback wird nach dem aktuellen Call-Stack ausgefuehrt |
> Zwischen `setTimeout`-Registrierung und Ausfuehrung kann die Variable geaendert werden |
> `const` loest das Problem: `const` kann nicht reassigned werden, also gilt Narrowing immer

---

## Array.isArray und readonly Arrays

Vor TypeScript 5.4 gab es ein seltsames Verhalten mit `Array.isArray`:

```typescript
// Vor TS 5.4:
function process(input: string | readonly string[]) {
  if (Array.isArray(input)) {
    // input sollte string[] sein -- aber:
    input;  // Typ: string[] & readonly string[]  -- seltsam!
    // TS kombinierte BEIDE Zweige in komplexen Typen
  }
}
```

TypeScript 5.4 verbesserte das Narrowing:

```typescript annotated
// TypeScript 5.4: Array.isArray narrowt readonly Arrays korrekt

function processData(data: string | readonly string[]) {
  if (Array.isArray(data)) {
    data;
    // data: readonly string[]  ← Korrekt! Nicht (string[] & readonly string[])
    // TypeScript erhaelt readonly -- weil readonly string[] AUCH ein Array ist

    // Praktisch: Alle Array-Methoden die nicht mutieren funktionieren:
    const upper = data.map(s => s.toUpperCase()); // OK!
    const first = data[0];                         // OK!
    // data.push('neue')  ← Fehler! readonly schreibt man nicht
  }
}

// Warum wichtig? In Angular sind viele Arrays readonly:
// signals(), queryList.toArray(), etc. geben oft readonly zurueck
// Array.isArray-Checks funktionieren jetzt korrekt mit diesen Typen
```

---

## Neue Utility Types: NoInfer\<T\> (TypeScript 5.4)

TypeScript 5.4 fuehrte `NoInfer<T>` ein — ein Utility Type der die Inferenz
in generischen Funktionen praeziser macht:

```typescript annotated
// Problem ohne NoInfer:
function createStore<T>(
  initialValue: T,
  fallback: T  // TypeScript inferiert T aus BEIDEN Argumenten
): Store<T> { /* ... */ }

createStore("hello", 42);
// TypeScript inferiert T als string | number (weil beide Argumente T bestimmen)
// Das ist oft nicht was man will!

// Loesung mit NoInfer<T>:
function createStore<T>(
  initialValue: T,
  fallback: NoInfer<T>  // fallback beeinflusst die T-Inferenz NICHT
): Store<T> { /* ... */ }

createStore("hello", 42);
// Fehler! T wird als string aus initialValue inferiert
// Dann ist fallback: NoInfer<string> -- und 42 ist kein string
// Das ist das gewuenschte Verhalten: T aus initialValue bestimmen

createStore("hello", "world");
// OK! T = string, fallback ist auch string
```

```typescript annotated
// Praktisches Beispiel: Event-System
function on<EventMap, K extends keyof EventMap>(
  event: K,
  handler: (data: NoInfer<EventMap[K]>) => void
  //                  ^^^^^^^^ handler beeinflusst K-Inferenz nicht
): void { /* ... */ }

type AppEvents = {
  'user:login': { userId: string };
  'user:logout': { userId: string; reason: string };
};

on<AppEvents, 'user:login'>('user:login', (data) => {
  console.log(data.userId);  // data: { userId: string } -- korrekt!
  // Ohne NoInfer koennte TypeScript K aus dem handler-Typ inferieren
  // Mit NoInfer wird K nur aus dem ersten Argument (event) bestimmt
});
```

---

## Object.groupBy und Map.groupBy Typen (TypeScript 5.4)

JavaScript ES2024 fuehrte `Object.groupBy` und `Map.groupBy` ein.
TypeScript 5.4 hat die korrekten Typen dafuer hinzugefuegt:

```typescript annotated
// Object.groupBy -- verteilt Array-Elemente in Gruppen
const users: User[] = [
  { id: '1', name: 'Alice', department: 'Engineering' },
  { id: '2', name: 'Bob', department: 'Design' },
  { id: '3', name: 'Charlie', department: 'Engineering' },
];

// TypeScript 5.4+ weiss den Typ:
const byDepartment = Object.groupBy(users, u => u.department);
// byDepartment: Partial<Record<string, User[]>>
//               ^^^^^^^ Partial! Weil nicht jeder Key belegt sein muss
//                              ^ User[] pro Gruppe

byDepartment['Engineering']?.forEach(u => console.log(u.name));
//                         ^^ Optional Chaining noetig -- Partial!

// Map.groupBy: Wie Object.groupBy aber als Map<K, V[]>
const byDeptMap = Map.groupBy(users, u => u.department);
// byDeptMap: Map<string, User[]>
// Hier kein Partial -- Map<K, V> gibt undefined zurueck fuer fehlende Keys
byDeptMap.get('Engineering')?.forEach(u => console.log(u.name));
```

> 💭 **Denkfrage:** Warum ist `Object.groupBy` als `Partial<Record<K, T[]>>` getypt
> und nicht als `Record<K, T[]>`? Was wuerde passieren wenn man `Record<K, T[]>` nutzt?
>
> **Antwort:** Weil nicht alle moeglichen Keys belegt sein muessen. Bei
> `Record<K, T[]>` wuerde TypeScript annehmen, dass `byDepartment['Finanzen']`
> existiert — aber wenn kein User aus Finanzen im Array ist, ist der Wert `undefined`.
> `Partial` erzwingt optional chaining und schutzt vor Laufzeitfehlern.

---

## Experiment-Box: Object.hasOwn als typsichere Alternative

Ein Feature das seit TypeScript 4.4 existiert aber viele nicht kennen:
`Object.hasOwn` als Ersatz fuer das fehleranfaellige `hasOwnProperty`:

```typescript
// Das ALTE Muster (problematisch):
const obj = { name: 'Alice' };

if (obj.hasOwnProperty('name')) {
  // Problem 1: hasOwnProperty kann ueberschrieben werden
  // Problem 2: TypeScript narrowt den Typ hier nicht
  console.log(obj.name); // obj ist immer noch der gleiche Typ
}

// Das Spezial-Problem:
const evil = Object.create(null);
// evil hat KEIN hasOwnProperty! Es erbt nicht von Object.prototype
// evil.hasOwnProperty('key')  ← Laufzeitfehler!

// NEUE LOESUNG: Object.hasOwn (TypeScript 4.4+, ES2022)
if (Object.hasOwn(obj, 'name')) {
  // Object.hasOwn ist nicht ueberschreibbar
  // Funktioniert auch mit Object.create(null)-Objekten
  // TypeScript 5.x versteht das als Type Guard in manchen Kontexten
  console.log(obj.name);
}

// In Angular-Templates und Services:
function validateConfig(config: unknown): config is AppConfig {
  if (typeof config !== 'object' || config === null) return false;
  
  // hasOwn ist die moderne, typsichere Variante:
  return Object.hasOwn(config, 'apiUrl') &&
         Object.hasOwn(config, 'timeout') &&
         Object.hasOwn(config, 'environment');
}
```

> ⚡ **Praxis-Tipp fuer dein Angular-Projekt:** `Object.hasOwn` ist seit Angular 15+
> (Target ES2022) problemlos nutzbar. Wenn dein `tsconfig.json` noch
> `"target": "ES2019"` oder aelter hat, brauchst du einen Polyfill.
> Moderne Angular-Projekte targeten ES2022 — dort funktioniert `Object.hasOwn` nativ.

---

## Array.fromAsync — Typen (TypeScript 5.2)

TypeScript 5.2 fuehrte korrekte Typen fuer `Array.fromAsync` ein:

```typescript annotated
// Array.fromAsync: Wie Array.from aber fuer async iterables
async function collectData() {
  // Synchrones Beispiel mit Array.from (bekannt):
  const sync = Array.from({ length: 3 }, (_, i) => i);
  // sync: number[]

  // Asynchrones Beispiel mit Array.fromAsync:
  async function* generateUsers() {
    yield { id: '1', name: 'Alice' };
    yield { id: '2', name: 'Bob' };
    yield { id: '3', name: 'Charlie' };
  }

  const users = await Array.fromAsync(generateUsers());
  // users: { id: string; name: string }[]
  //        ^ TypeScript inferiert den Typ korrekt aus dem async generator!

  // Praktisches Angular-Beispiel: HTTP-Streaming
  // (Angular SSE / Streaming HTTP):
  const chunks = await Array.fromAsync(
    streamingResponse as AsyncIterable<DataChunk>
  );
  // chunks: DataChunk[]
}
```

---

## Control Flow: switch(true) Narrowing (TypeScript 5.3)

Ein kleines aber feines Feature aus TypeScript 5.3:

```typescript annotated
// switch(true) Pattern -- ein elegantes Muster fuer komplexe Bedingungen
function describeUser(user: User | Admin | SuperAdmin): string {
  switch (true) {
    case user.role === 'superadmin':
      // TypeScript 5.3: user ist hier SuperAdmin! Korrektes Narrowing
      return `Super Admin: ${user.globalPermissions.join(', ')}`;

    case user.role === 'admin':
      // TypeScript 5.3: user ist hier Admin!
      return `Admin Level ${user.level}: ${user.department}`;

    default:
      // TypeScript: user ist hier User
      return `User: ${user.name}`;
  }
}
// Vor TS 5.3: switch(true) narrowte den Typ nicht korrekt
// TS 5.3 analysiert die case-Bedingungen als Type Guards
```

---

## Was du gelernt hast

- **Preserved Narrowing in Closures** (TS 5.4) loest das jahrelange Problem mit
  Null-Checks die in synchronen Closures nicht anerkannt wurden
- **Array.isArray** narrowt jetzt korrekt `readonly` Arrays ohne seltsame
  Intersection-Typen zu produzieren
- **NoInfer\<T\>** gibt Kontrolle darueber welche Argumente die Typ-Inferenz bestimmen
- **Object.groupBy** und **Map.groupBy** haben korrekte Typen — Partial wegen
  moeglicher Luecken bei Object.groupBy
- **Object.hasOwn** ist die moderne, typsichere Alternative zu `hasOwnProperty`

**Kernkonzept zum Merken:** TypeScript 5.x verbessert kontinuierlich die
**Control Flow Analysis** — den Algorithmus der bestimmt welchen Typ eine Variable
an welcher Stelle im Code hat. Jede Verbesserung macht den Compiler cleverer
ohne dass du Code aendern musst.

> **Pausenpunkt** — Gut gemacht! Die Kern-Features der 5.x Reihe sind verinnerlicht.
> Jetzt schauen wir uns an, was im Hintergrund passiert: Performance und Editor.
>
> Weiter geht es mit: [Sektion 05: Performance und Editor-Features](./05-performance-und-editor-features.md)

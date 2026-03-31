# Sektion 4: Module Augmentation

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [03 - Declaration Files](./03-declaration-files.md)
> Naechste Sektion: [05 - Praxis-Patterns](./05-praxis-patterns.md)

---

## Was du hier lernst

- Module Augmentation: bestehende Module erweitern
- Global Augmentation: globale Typen erweitern
- Namespace Augmentation
- Wann Augmentation sinnvoll ist

---

## Module Augmentation

Bestehende Module koennen um neue Typen erweitert werden:

```typescript
// Express Request erweitern
import 'express';

declare module 'express' {
  interface Request {
    user?: { id: string; role: string };
    requestId: string;
  }
}

// Jetzt hat Request.user und Request.requestId!
```

> **Wichtig:** Die Datei muss ein ES Module sein (mindestens ein import/export).
> Sonst wird es als Script behandelt und die Augmentation funktioniert nicht.

---

## Global Augmentation

Globale Typen erweitern (Window, NodeJS.ProcessEnv, etc.):

```typescript
// env.d.ts
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    __APP_VERSION__: string;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      API_KEY: string;
    }
  }
}

export {}; // Macht die Datei zum Modul!
```

```typescript
// Jetzt typsicher:
process.env.DATABASE_URL;  // string (nicht string | undefined!)
window.__APP_VERSION__;    // string
```

---

## Namespace Augmentation

```typescript
// Bestehende Library-Namespaces erweitern
declare namespace Express {
  interface Request {
    session: {
      userId: string;
      token: string;
    };
  }
}
```

---

## Interface Merging

TypeScript merged Interfaces mit gleichem Namen automatisch:

```typescript
interface User { name: string; }
interface User { email: string; }

// Ergebnis: { name: string; email: string; }
// Das funktioniert auch ueber Dateigrenzen hinweg!
```

> **Das ist der Grund warum Augmentation funktioniert:**
> Wenn du ein Interface in einer declare module erweiterst,
> wird es mit dem Original gemerged.

---

## Pausenpunkt

**Kernerkenntnisse:**
- `declare module 'x'` — bestehende Module erweitern
- `declare global` — globale Typen erweitern
- `export {}` — Datei zum Modul machen (noetig fuer global augmentation)
- Interface Merging ist der Mechanismus hinter Augmentation

> **Weiter:** [Sektion 05 - Praxis-Patterns](./05-praxis-patterns.md)

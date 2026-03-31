# Sektion 5: Praxis-Patterns

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [04 - Module Augmentation](./04-module-augmentation.md)

---

## Was du hier lernst

- Library-Typen richtig organisieren
- Ambient Declarations fuer globale Variablen
- Best Practices fuer Modul-Organisation
- Haeufige Fehler und Loesungen

---

## Pattern 1: Typen-Datei pro Feature

```
src/
  types/
    user.ts        # User-bezogene Typen
    api.ts         # API-bezogene Typen
    env.d.ts       # Environment-Variablen
    global.d.ts    # Globale Augmentations
  features/
    auth/
      types.ts     # Feature-spezifische Typen
      auth.ts      # Implementierung
```

---

## Pattern 2: Triple-Slash Directives (Legacy)

```typescript
/// <reference types="node" />
/// <reference path="./custom-types.d.ts" />
```

> **Veraltet.** Nutze tsconfig.json `types` und `typeRoots` stattdessen.
> Triple-Slash Directives sind nur noch fuer Spezialfaelle relevant.

---

## Pattern 3: Declaration Merging fuer Plugins

```typescript
// base-app.ts
export interface AppConfig {
  name: string;
  version: string;
}

// plugin-auth.ts
declare module './base-app' {
  interface AppConfig {
    auth: {
      provider: 'oauth' | 'jwt';
      secret: string;
    };
  }
}

// Jetzt hat AppConfig auch auth!
```

---

## Haeufige Fehler und Loesungen

| Fehler | Ursache | Loesung |
|--------|---------|---------|
| "Cannot find module 'x'" | Fehlende Typen | `npm i @types/x` oder eigene .d.ts |
| "Augmentation not working" | Datei ist kein Modul | `export {}` hinzufuegen |
| "Duplicate identifier" | Gleicher Name in .d.ts und .ts | Typ-Only-Import verwenden |
| "Could not find declaration file" | Library ohne Typen | `declare module 'x'` schreiben |

---

## Best Practices

1. **Named Exports bevorzugen** — konsistenter, refactoring-sicher
2. **import type fuer reine Typen** — verhindert ungewollte Imports
3. **Barrel Files sparsam einsetzen** — koennen Tree-Shaking erschweren
4. **@types zuerst pruefen** — Community-Typen vor eigenen
5. **Augmentation minimal halten** — nur was wirklich noetig ist

---

## Pausenpunkt — Ende der Lektion

Du verstehst jetzt das TypeScript-Modul-System, Declaration Files und Augmentation.

> **Naechste Lektion:** [20 - Review Challenge Phase 2](../../20-review-challenge-phase-2/README.md)

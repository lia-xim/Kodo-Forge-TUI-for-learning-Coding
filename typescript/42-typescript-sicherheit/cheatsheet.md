# Cheatsheet: TypeScript Sicherheit

> Lektion 42 — Kompakte Referenz fuer den Alltag

---

## Die Kernwahrheit

> TypeScript ist ein **Korrektheitswerkzeug**, kein Sicherheitswerkzeug.
> TypeScript prueft Compile-Zeit-Struktur. Echte Angriffe passieren zur **Laufzeit**.

---

## 8 Rote Flaggen im Code Review

| Muster | Problem | Fix |
|--------|---------|-----|
| `data as User` (externe Daten) | Kein Laufzeit-Check | `parseUser(data)` mit Type Guard |
| `value!` ohne Erklaerung | Crash wenn null | Expliziter if-Check |
| `JSON.parse(raw) as T` | Wirft + kein Struct-Check | try-catch + Type Guard |
| `Object.assign({}, a, userInput)` | Prototype Pollution | Whitelist + `Object.create(null)` |
| `param: any` in Signaturen | any breitet sich aus | `unknown` + Narrowing |
| URL-Params ohne Validierung | Ungueltige IDs, Injection | Regex-Check + Branded Type |
| `eval(str)` / `new Function(str)` | Beliebige Code-Ausfuehrung | Parser schreiben |
| `element.innerHTML = userInput` | XSS | `{{ }}` Template oder DomSanitizer |

---

## Type Guards — das Schutz-Fundament

```typescript
// Typ-Signatur eines Validators
type Validator<T> = (value: unknown) => value is T;

// Minimaler Type Guard
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['id'] === 'string'    &&
    typeof v['name'] === 'string'  &&
    typeof v['email'] === 'string' &&
    (v['email'] as string).includes('@')
  );
}

// Verwendung: kein 'as' Cast noetig
const raw = await fetch('/api/user').then(r => r.json());
if (!isUser(raw)) throw new ValidationError('Ungueltige API-Antwort');
// Ab hier: raw ist User — TypeScript weiss es, du hast es bewiesen
```

---

## Parse, don't validate

```typescript
// ❌ VALIDATE-Ansatz: Wissen vom Objekt getrennt
function isValid(v: unknown): boolean { /* ... */ }
if (isValid(data)) {
  const user = data as User;  // as-Cast trotzdem noetig!
}

// ✅ PARSE-Ansatz: Ergebnis ist T oder Fehler
function parseUser(v: unknown): User {
  if (!isUser(v)) throw new ParseError('Kein gueltiger User', v);
  return v;  // Kein 'as' — isUser hat es bewiesen
}

// ✅ NOCH BESSER: Result-Pattern (L25)
function safeParseUser(v: unknown): Result<User, ParseError> {
  if (!isUser(v)) return err(new ParseError('Kein gueltiger User', v));
  return ok(v);
}
```

---

## Parse at the boundary

```
┌─────────────────────────────────────────────────┐
│  AUSSEN (unsicher)                              │
│  API, localStorage, URL-Parameter, FormData     │
│                    │                            │
│              PARSE HIER                         │
│         (einmal, am Systemrand)                 │
│                    │                            │
│  INNEN (sicher)                                 │
│  Alle Typen sind bewiesen — kein erneutes       │
│  Validieren noetig                              │
└─────────────────────────────────────────────────┘
```

**Regel:** Validiere einmal, beim Eintritt in dein System. Danach gilt der Typ.

---

## Prototype Pollution verhindern

```typescript
// ❌ GEFAEHRLICH
Object.assign({}, defaults, userInput);

// ✅ SICHER: Object.create(null) + Whitelist
const ERLAUBTE_KEYS = ['theme', 'sprache'] as const;
const sicher = Object.create(null) as Record<string, unknown>;
for (const key of ERLAUBTE_KEYS) {
  if (key in (userInput as object)) {
    sicher[key] = (userInput as Record<string, unknown>)[key];
  }
}
```

---

## JSON.parse sicher verwenden

```typescript
// ❌ GEFAEHRLICH
const config = JSON.parse(localStorage.getItem('config') || '{}') as AppConfig;

// ✅ SICHER
function ladeConfig(): AppConfig {
  const raw = localStorage.getItem('config');
  if (!raw) return standardConfig;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return standardConfig;  // Korrumpierter JSON — Fallback
  }
  return isAppConfig(parsed) ? parsed : standardConfig;
}
```

---

## ESLint-Mindestkonfiguration

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-return": "error"
}
```

---

## Angular: DomSanitizer korrekt einsetzen

```typescript
// ❌ NIE mit Nutzereingabe
this.sanitizer.bypassSecurityTrustHtml(userInput);

// ✅ Sanitize zuerst bei HTML-Inhalten
const safe = this.sanitizer.sanitize(SecurityContext.HTML, userContent);

// ✅ Bypass nur fuer eigenen, kontrollierten Inhalt
this.sanitizer.bypassSecurityTrustHtml(myOwnRenderer.render(markdown));

// ✅ Beste Option: Angular Template-Binding nutzen
// {{ userContent }}  → automatisch escaped, kein XSS moeglich
```

---

## Gedaechtnis-Anker

| Konzept | Merksatz |
|---------|----------|
| Type Erasure | "TypeScript-Typen sind Tinte die nach dem Drucken verschwindet" |
| Type Guards | "Beweise, dann vertraue — nicht umgekehrt" |
| Parse, don't validate | "Transformation statt Wahrheitswert" |
| Prototype Pollution | "Object.create(null) hat keinen Prototyp — kein Ziel" |
| Parse at the boundary | "Einmal pruufen, danach vertrauen" |
| `as` ohne Check | "Ein Versprechen ohne Beweis" |

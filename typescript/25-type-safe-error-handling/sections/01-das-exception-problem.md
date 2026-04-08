# Sektion 1: Das Exception-Problem

> Geschätzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: -- (Start)
> Nächste Sektion: [02 - Das Result-Pattern](./02-das-result-pattern.md)

---

## Was du hier lernst

- Warum `throw`-basiertes Error Handling **unsichtbare Abhängigkeiten** erzeugt
- Den Unterschied zwischen **erwarteten Fehlern** (Validierung, Netzwerk) und **unerwarteten Fehlern** (Bugs)
- Wie TypeScript-Funktionen mit `throw` Fehler **verstecken** statt sie zu dokumentieren
- Warum andere Sprachen (Rust, Haskell, Go) explizites Error Handling bevorzugen

---

## Hintergrund: Zwei Welten des Fehler-Handlings

> **Feature Origin Story: Exceptions vs. explizite Fehler**
>
> Ausnahmen (Exceptions) wurden in den 1960ern in LISP eingeführt und
> populär gemacht durch Java (1995). Das Versprechen: Fehlerpfade können
> vom normalen Kontrollfluss getrennt werden.
>
> Aber schon früh gab es Kritik. Tony Hoare (Erfinder von `null`,
> was er selbst als "Billion-Dollar Mistake" bezeichnete) erkannte:
> Exceptions machen den Kontrollfluss unsichtbar. Wenn `doSomething()`
> wirft, muss man die Dokumentation lesen — der Typ sagt nichts.
>
> 2015 kommt Rust mit `Result<T, E>`: Fehler sind Rückgabewerte,
> nicht Ausnahmen. Der Compiler erzwingt dass du den Fehlerfall behandelst.
> Go (2009) mit `value, err := doSomething()`. Haskell mit `Maybe` und `Either`.
>
> TypeScript hat `Result<T, E>` nicht eingebaut — aber du kannst es
> selbst implementieren. Das ist das Kernthema dieser Lektion.

---

## Das Problem: Fehler sind unsichtbar

```typescript annotated
// Diese Funktion kann fehlschlagen — aber ihr Typ sagt nichts davon:
function parseUserFromJson(jsonString: string): User {
  const data = JSON.parse(jsonString);
  // ^ kann SyntaxError werfen! Aber User im Rückgabetyp verrät das nicht.

  if (!data.id || !data.email) {
    throw new Error("Ungültige User-Daten");
    // ^ Kann auch werfen! Unsichtbar im Typ.
  }

  return { id: data.id, email: data.email, name: data.name };
}

// Caller-Code — was kann hier fehlschlagen?
function loadUserProfile(json: string): void {
  const user = parseUserFromJson(json);
  // ^ Welche Fehler? SyntaxError? ValidationError? Wer weiß?
  // TypeScript gibt uns keinen Hinweis.
  console.log(`Hallo, ${user.name}`);
}
```

> 🧠 **Erkläre dir selbst:** Warum ist ein Rückgabetyp `User` bei einer
> Funktion die werfen kann eine "Lüge"? Was verspricht der Typ dem Caller
> und was hält er nicht ein?
>
> **Kernpunkte:** Typ `User` verspricht: "Ich gebe immer einen User zurück" |
> In Wirklichkeit: Kann werfen, also manchmal gar nichts zurückgeben |
> Der Caller verlässt sich auf das Versprechen → unbehandelte Exception |
> TypeScript prüft das nicht — anders als bei `null` (strictNullChecks)

---

## Erwartete vs. unerwartete Fehler
<!-- section:summary -->
Eine wichtige Unterscheidung die viele Entwickler nicht explizit machen:

<!-- depth:standard -->
Eine wichtige Unterscheidung die viele Entwickler nicht explizit machen:

```typescript
// UNERWARTETE Fehler (Bugs) — sollten immer werfen:
function divideNumbers(a: number, b: number): number {
  if (b === 0) throw new Error("Division durch Null — das ist ein Bug!");
  // ^ Das sollte NIE passieren wenn der Code korrekt ist.
  //   throw ist hier richtig: Das ist ein Programmfehler, kein Benutzer-Input-Fehler.
  return a / b;
}

// ERWARTETE Fehler (Benutzer-Input, Netzwerk, Validierung):
function parseAge(input: string): number {
  const n = parseInt(input, 10);
  if (isNaN(n) || n < 0 || n > 150) {
    throw new ValidationError(`Ungültiges Alter: ${input}`);
    // ^ Dieser Fehler ist *erwartet* — der Caller muss damit rechnen.
    //   Aber 'throw' macht es unsichtbar.
  }
  return n;
}
```

> 💭 **Denkfrage:** Was ist der Unterschied zwischen einer Funktion die
> wirft wenn der Input ungültig ist, und einer die `null` zurückgibt?
> Welche erzwingt eine Fehlerbehandlung durch den Caller?
>
> **Antwort:** Bei `null` zwingt TypeScript den Caller (mit `strictNullChecks`)
> auf `null` zu prüfen. Bei `throw` gibt es keinen Compile-Zwang — der Caller
> **kann** `try/catch` verwenden, muss aber nicht. `null` ist damit
> "sicherer" als `throw` für erwartete Fehler — aber limitiert auf
> ein einziges "Fehlersignal" ohne Fehler-Information.

---

<!-- /depth -->
## Das `throw`-Problem in TypeScript vs. Java
<!-- section:summary -->
Java hat **Checked Exceptions** — eine Lösung des gleichen Problems:

<!-- depth:standard -->
Java hat **Checked Exceptions** — eine Lösung des gleichen Problems:

```java
// Java: Checked Exception — Compiler erzwingt Behandlung!
public User parseUserFromJson(String json) throws ValidationException, IOException {
  // 'throws' im Methodensignal: Caller MUSS try/catch verwenden
}

// Caller-Code muss explizit behandeln:
try {
  User user = parseUserFromJson(json);
} catch (ValidationException e) {
  // MUSS behandelt werden — Compiler-Fehler wenn nicht!
}
```

TypeScript hat keine Checked Exceptions. Der Typ sagt nie welche Fehler
möglich sind. Das führt zu drei häufigen Problemen:

```typescript annotated
// Problem 1: Vergessenes try/catch
function loadUser(json: string): void {
  const user = parseUserFromJson(json); // Wirft — aber nobody knows!
  // ^ Wenn parseUserFromJson wirft, crasht die App unbehandelt.
}

// Problem 2: Zu breites catch — alle Fehler gleich
try {
  loadUser(jsonString);
} catch (error) {
  console.log("Irgendwas ist falsch"); // Was genau? Keine Ahnung.
  // ^ 'error' hat Typ 'unknown' — kein Typ-Check möglich!
}

// Problem 3: Error-Type unklar
try {
  loadUser(jsonString);
} catch (error) {
  // Ist das ein SyntaxError? ValidationError? NetworkError?
  // TypeScript weiß es nicht — du musst raten!
  if (error instanceof ValidationError) { /* Validierung */ }
  else if (error instanceof SyntaxError) { /* JSON */ }
  // else: unbekannt! Was jetzt? Re-throw? Ignorieren?
}
```

<!-- depth:vollstaendig -->
> **Experiment:** Probiere folgendes im TypeScript Playground aus:
>
> ```typescript
> type User = { id: string; name: string };
>
> // Funktion die werfen KANN — Typ zeigt es nicht!
> function parseUserFromJson(jsonString: string): User {
>   const data = JSON.parse(jsonString) as Record<string, unknown>;
>   if (!data['id'] || !data['name']) throw new Error('Fehlende Felder');
>   return { id: String(data['id']), name: String(data['name']) };
> }
>
> // Caller ohne try/catch — kein Compile-Error!
> function loadUser(json: string): void {
>   const user = parseUserFromJson(json); // Kann werfen — TypeScript schweigt
>   console.log(`Hallo, ${user.name}`);
> }
>
> // Jetzt mit Result-Typ — Fehler sichtbar im Typ:
> type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
>
> function parseUserSafe(jsonString: string): Result<User> {
>   try {
>     const data = JSON.parse(jsonString) as Record<string, unknown>;
>     if (!data['id'] || !data['name']) return { ok: false, error: 'Fehlende Felder' };
>     return { ok: true, value: { id: String(data['id']), name: String(data['name']) } };
>   } catch {
>     return { ok: false, error: 'Ungültiges JSON' };
>   }
> }
>
> const r1 = parseUserSafe('{"id":"1","name":"Max"}');
> const r2 = parseUserSafe('{invalid}');
> if (r1.ok) console.log(`User: ${r1.value.name}`);   // Max
> if (!r2.ok) console.log(`Fehler: ${r2.error}`);     // Ungültiges JSON
> ```
>
> Was passiert wenn du `parseUserSafe` aufrufst und das `if (r1.ok)`-Check weglässt?
> TypeScript zeigt sofort: `r1.value` ist nicht zugänglich ohne die `ok`-Prüfung.

---

<!-- /depth -->
## Das `unknown` Problem bei try/catch
<!-- section:summary -->
TypeScript 4.0 hat `useUnknownInCatchVariables` eingeführt:

<!-- depth:standard -->
TypeScript 4.0 hat `useUnknownInCatchVariables` eingeführt:

```typescript annotated
// Vor TS 4.0 (veraltet):
try {
  throw "Fehler-String";
} catch (error) {
  console.log(error.message); // War früher erlaubt (und falsch)
  // ^ Problem: 'error' war implizit 'any' — alle Methoden waren erlaubt
}

// Ab TS 4.0 mit useUnknownInCatchVariables (in strict enthalten):
try {
  throw new Error("Fehler");
} catch (error) {
  // error: unknown — muss geprüft werden!
  console.log(error.message); // ❌ 'error' ist 'unknown'
  // ^ COMPILE-ERROR: Object is of type 'unknown'

  if (error instanceof Error) {
    console.log(error.message); // ✅ Jetzt OK — eingeschränkt auf Error
  }
}
```

Das ist gut — aber löst nicht das Kernproblem: Die **Existenz** von Fehlern
ist immer noch unsichtbar im Rückgabetyp.

> 🔍 **Tieferes Wissen: Rust's Ansatz — `?`-Operator**
>
> In Rust gibt es den `?`-Operator der explizites Error-Handling ergonomisch macht:
>
> ```rust
> fn parse_user(json: &str) -> Result<User, ParseError> {
>     // Typ sagt: KANN User ODER ParseError zurückgeben
>     let data: Value = serde_json::from_str(json)?;
>     // ^ '?' propagiert den Fehler automatisch an den Caller!
>     // Kein try/catch, aber auch kein unbehandtelter Fehler.
>     Ok(User { id: data["id"].as_str()? .to_string() })
> }
> ```
>
> TypeScript hat keinen `?`-Operator — aber mit async/await und
> `Result<T, E>` kommen wir sehr nah dran.

---

<!-- /depth -->
## Warum nicht einfach immer `null` zurückgeben?

```typescript annotated
// Simple Lösung: null bei Fehler
function parseAge(input: string): number | null {
  const n = parseInt(input, 10);
  if (isNaN(n) || n < 0 || n > 150) return null;
  return n;
}

// Problem 1: Kein Fehler-Details
const age = parseAge("abc");
if (age === null) {
  // Warum null? Was war falsch? Wir wissen es nicht!
  console.log("Irgendwas stimmt nicht...");
}

// Problem 2: null und "kein Wert" vermischen sich
function findUser(id: string): User | null { /* suche in DB */ return null; }
// Hier bedeutet null: "nicht gefunden" — ganz anders als beim Fehler-null!

// Mit Result<T, E>:
function parseAgeResult(input: string): Result<number, string> {
  const n = parseInt(input, 10);
  if (isNaN(n)) return { ok: false, error: `'${input}' ist keine Zahl` };
  if (n < 0)    return { ok: false, error: `Alter kann nicht negativ sein: ${n}` };
  if (n > 150)  return { ok: false, error: `Unrealistisches Alter: ${n}` };
  return { ok: true, value: n };
}

// Jetzt: Fehler SIND im Typ, MIT Details
const result = parseAgeResult("abc");
if (!result.ok) {
  console.log(result.error); // "'abc' ist keine Zahl"
  // ^ Typ: string — wir kennen den Fehler!
}
```

> **In deinem Angular-Projekt** siehst du das häufig bei HTTP-Requests:
>
> ```typescript
> // Typisches Problem:
> getUserById(id: string): Observable<User> {
>   return this.http.get<User>(`/api/users/${id}`);
>   // ^ Wirft bei 404, 500, Netzwerkfehler — aber Typ sagt: "immer User"!
> }
>
> // Besser (next Sektion):
> getUserById(id: string): Observable<Result<User, ApiError>> {
>   return this.http.get<User>(`/api/users/${id}`).pipe(
>     map(user => ({ ok: true as const, value: user })),
>     catchError(err => of({ ok: false as const, error: toApiError(err) }))
>   );
>   // ^ Fehler sind im Typ! Caller MUSS den Fehlerfall behandeln.
> }
> ```

---

## Zusammenfassung: Was fehlt bei throw

| Aspekt | throw | null | Result<T,E> |
|--------|:----:|:----:|:-----------:|
| Sichtbar im Typ? | ❌ | ✅ (aber kein Detail) | ✅ (mit Detail) |
| Compiler erzwingt Behandlung? | ❌ | ✅ (strictNullChecks) | ✅ |
| Fehler-Details verfügbar? | ✅ (catch) | ❌ | ✅ |
| Stackable (multiple errors)? | ❌ | ❌ | ✅ (mit Typen) |
| Ergonomisch? | ✅ Gewohnt | ✅ Einfach | ⚠️ Mehr Code |

---

## Was du gelernt hast

- `throw`-basiertes Error Handling erzeugt **unsichtbare Abhängigkeiten** — der Rückgabetyp lügt
- **Erwartete Fehler** (Validierung, Netzwerk) sollten explizit im Rückgabetyp sein
- **Unerwartete Fehler** (Bugs, Invariant-Verletzungen) → weiterhin `throw`
- TypeScript's `useUnknownInCatchVariables` hilft bei Typsicherheit im `catch`, löst aber nicht das Sichtbarkeits-Problem
- `null` ist besser als `throw` für Fehler, aber verliert Fehler-Details

> 🧠 **Erkläre dir selbst:** Warum ist eine Funktion `parseUser(): User` die
> werfen kann eine "Lüge"? Was wäre die ehrlichste Signatur?
>
> **Kernpunkte:** User verspricht: "immer ein User" | throw = kein Rückgabewert |
> Ehrliche Signatur: `parseUser(): User | never` (unwürdig) |
> Besser: `parseUser(): Result<User, ParseError>` (sichtbar, vollständig)

**Kernkonzept zum Merken:** Fehler die erwartet werden, gehören **in den Rückgabetyp**.
Alles andere ist eine Lüge im Typsystem.

---

> **Pausenpunkt** -- Du verstehst das Problem. Jetzt kommt die Lösung.
>
> Weiter geht es mit: [Sektion 02: Das Result-Pattern](./02-das-result-pattern.md)

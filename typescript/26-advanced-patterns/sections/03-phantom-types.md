# Sektion 3: Phantom Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - State Machine Pattern](./02-state-machine-pattern.md)
> Naechste Sektion: [04 - Fluent API Pattern](./04-fluent-api-pattern.md)

---

## Was du hier lernst

- Was **Phantom Types** sind und warum sie zur Laufzeit "unsichtbar" sind
- Wie man mit Phantom Types **semantische Verwechslungen** verhindert
- Den Zusammenhang zwischen Phantom Types und **Branded Types** (Lektion 24)
- Wie Phantom Types **Zustandsinformationen** im Typ tragen koennen

---

## Hintergrund: Der unsichtbare Typ

> **Feature Origin Story: Phantom Types**
>
> Der Begriff "Phantom Type" stammt aus der funktionalen Programmierung —
> insbesondere Haskell (ca. 2000). James Cheney und Ralf Hinze beschrieben
> das Konzept formal in ihrem Paper "First-Class Phantom Types" (2003).
>
> Die Idee: Ein Typparameter, der im **Wert** nicht vorkommt, aber
> im **Typ** existiert. Er ist ein "Phantom" — unsichtbar zur Laufzeit,
> aber sichtbar fuer den Compiler.
>
> In Haskell: `newtype Distance a = Distance Double` — das `a` taucht
> nirgends im Wert auf (es ist immer ein Double), aber der Typ
> unterscheidet `Distance Meters` von `Distance Miles`.
>
> TypeScript's strukturelles Typsystem macht Phantom Types etwas
> trickreicher als in Haskell — aber mit Branded Types (Lektion 24)
> haben wir die Grundlage bereits gelegt.

---

## Das Problem: Semantisch verschiedene Werte mit gleichem Typ

```typescript annotated
// Alles ist "string" — aber semantisch voellig verschieden!
function sendEmail(to: string, subject: string, body: string): void {
  // Was hindert uns daran, die Parameter zu vertauschen?
  // Nichts! Alles ist string.
}

sendEmail(
  "Hallo Welt",          // Oops! Das ist der Subject, nicht die Email
  "max@example.com",     // Oops! Das ist die Adresse, nicht der Subject
  "Willkommen!"
);
// ^ TypeScript: "Alles OK!" — Alles ist string. Kein Fehler.
// Laufzeit: Email geht an "Hallo Welt" — das wird nicht funktionieren.

// Gleiches Problem mit Zahlen:
function transfer(amount: number, fromAccount: number, toAccount: number): void {
  // amount, fromAccount, toAccount — alles number. Verwechslung moeglich!
}

transfer(12345678, 100, 87654321);
// ^ Ist 12345678 der Betrag oder die Kontonummer? Wer weiss?
```

> 💭 **Denkfrage:** Du hast in Lektion 24 Branded Types kennengelernt.
> Wie haengen Branded Types und Phantom Types zusammen?
>
> **Antwort:** Branded Types SIND eine Form von Phantom Types in TypeScript!
> Das `__brand`-Property existiert nur im Typ, nicht zur Laufzeit.
> Es ist ein "Phantom" — es traegt Information die der Compiler nutzt,
> die aber zur Laufzeit verschwunden ist (Type Erasure).

---

## Phantom Types in TypeScript

In Haskell ist ein Phantom Type einfach ein ungenutzter Typparameter.
In TypeScript brauchen wir einen kleinen Trick, weil das strukturelle
Typsystem ungeutzte Parameter ignorieren wuerde:

```typescript annotated
// Generischer Phantom-Typ-Wrapper
type Phantom<BaseType, Tag> = BaseType & { readonly __phantom: Tag };
// ^ BaseType: Der echte Laufzeit-Typ (string, number)
// ^ Tag: Der Phantom-Typ (existiert NUR im Typsystem)
// ^ __phantom: "Anker" damit TypeScript den Tag nicht wegoptimiert

// Definiere semantische Typen:
type Email = Phantom<string, "Email">;
type Subject = Phantom<string, "Subject">;
type Body = Phantom<string, "Body">;

// Typsichere Funktion:
function sendEmail(to: Email, subject: Subject, body: Body): void {
  // Jetzt kann man die Parameter NICHT mehr verwechseln!
}

// Erstelle Werte mit Validierung:
function validateEmail(raw: string): Email {
  if (!raw.includes("@")) throw new Error("Ungueltige Email");
  return raw as Email;
}

const email = validateEmail("max@example.com");
const subject = "Hallo" as Subject;
const body = "Willkommen!" as Body;

sendEmail(email, subject, body); // OK
// sendEmail(subject, email, body); // COMPILE-ERROR!
// ^ Subject ist nicht Email — die Typen sind inkompatibel
```

> 🧠 **Erklaere dir selbst:** Warum braucht der Phantom-Typ das
> `__phantom`-Property? Was wuerde passieren wenn wir einfach
> `type Email = string & { tag: "Email" }` schreiben?
>
> **Kernpunkte:** Ohne __phantom wuerde TypeScript's strukturelles
> Typsystem die Tags nicht unterscheiden | `{ tag: "Email" }` und
> `{ tag: "Subject" }` sind verschiedene Typen — das funktioniert |
> __phantom ist Konvention, der Name ist egal | Wichtig: readonly
> damit niemand den Wert aendern will

---

## Phantom Types fuer Zustaende

Eine maechtige Anwendung: Den Zustand eines Objekts im Typ kodieren,
ohne ihn als Laufzeitwert zu speichern:

```typescript annotated
// Zustaende als Phantom-Typen (keine Laufzeit-Werte!)
type Draft = { readonly __state: "draft" };
type Published = { readonly __state: "published" };
type Archived = { readonly __state: "archived" };

// Artikel mit Phantom-State
type Article<State> = {
  readonly __phantom: State;
  id: string;
  title: string;
  content: string;
};

// Funktionen die nur bestimmte Zustaende akzeptieren:
function publish(article: Article<Draft>): Article<Published> {
  // ^ Akzeptiert NUR Draft-Artikel!
  console.log(`Publishing: ${article.title}`);
  return article as unknown as Article<Published>;
  // ^ Zur Laufzeit aendert sich nichts — nur der Typ
}

function archive(article: Article<Published>): Article<Archived> {
  // ^ Akzeptiert NUR Published-Artikel!
  return article as unknown as Article<Archived>;
}

// Verwendung:
const draft: Article<Draft> = {
  id: "1", title: "TypeScript Patterns", content: "..."
} as Article<Draft>;

const published = publish(draft);     // OK: Draft -> Published
const archived = archive(published);  // OK: Published -> Archived

// archive(draft);  // COMPILE-ERROR! Draft ist nicht Published
// publish(archived); // COMPILE-ERROR! Archived ist nicht Draft
```

> **Experiment:** Ueberlege dir ein Phantom-Typ-System fuer Datenbankeintraege:
>
> ```typescript
> // Ein User der noch nicht gespeichert ist hat keine ID:
> type Unsaved = { readonly __dbState: "unsaved" };
> type Saved = { readonly __dbState: "saved" };
>
> type DbEntity<T, State> = State extends Saved
>   ? T & { id: number; createdAt: Date }  // Saved: id + createdAt garantiert
>   : T;                                    // Unsaved: nur die Daten
>
> function save<T>(entity: DbEntity<T, Unsaved>): DbEntity<T, Saved> {
>   // Speichere in DB und fuege id + createdAt hinzu
>   return { ...entity, id: 1, createdAt: new Date() } as DbEntity<T, Saved>;
> }
>
> // Frage: Was passiert wenn du save() zweimal aufrufst?
> // Antwort: Compile-Error! DbEntity<T, Saved> ist nicht DbEntity<T, Unsaved>
> ```

---

## Phantom Types vs. Branded Types vs. Newtype

| Ansatz | Laufzeit-Overhead | Typensicherheit | Komplexitaet |
|---|---|---|---|
| Branded Types (L24) | Keiner | Hoch | Gering |
| Phantom Types | Keiner | Sehr hoch | Mittel |
| Newtype (naechste Lektion) | Keiner | Hoechste | Hoch |
| Wrapper-Klassen | Ja (Objekt) | Hoch | Gering |

> ⚡ **In React** siehst du Phantom-Type-aehnliche Patterns bei
> Typisierung von Hooks:
>
> ```typescript
> // React.Ref<T> ist ein Phantom-Type-Pattern:
> // T erscheint nur im Typ, nicht im Laufzeit-Wert
> const inputRef = useRef<HTMLInputElement>(null);
> // inputRef.current ist HTMLInputElement | null
> // T="HTMLInputElement" ist ein Phantom — es existiert nur im Typ
>
> // Aehnlich: React.Key ist string | number
> // Aber React verwendet es intern nicht typsicher —
> // ein Phantom-Typ koennte "NumericKey" und "StringKey" unterscheiden
> ```

---

## Was du gelernt hast

- **Phantom Types** tragen Information im Typ die zur Laufzeit nicht existiert (Type Erasure)
- Sie verhindern **semantische Verwechslungen** (Email vs. Subject, Draft vs. Published)
- In TypeScript braucht man ein `__phantom`-Property als "Anker" wegen des strukturellen Typsystems
- Phantom Types koennen **Zustaende** kodieren ohne Laufzeit-Overhead
- **Branded Types** aus Lektion 24 sind eine einfache Form von Phantom Types

> 🧠 **Erklaere dir selbst:** Warum sind Phantom Types besonders gut geeignet
> fuer Einheitensysteme (Meter vs. Meilen, EUR vs. USD)?
>
> **Kernpunkte:** Zur Laufzeit sind beides einfach Zahlen | Der Typ verhindert
> Vermischung | NASA Mars Climate Orbiter: Meilen/Meter-Verwechslung kostete
> 125 Millionen Dollar | Phantom Types haetten das verhindert

**Kernkonzept zum Merken:** Phantom Types sind Typ-Information ohne
Laufzeit-Repraesentaiton. Sie nutzen TypeScript's Type Erasure als Feature:
Der Compiler prueft, die Runtime ignoriert.

---

> **Pausenpunkt** -- Phantom Types sind maechtig aber abstrakt.
> Naechstes Thema: Fluent APIs — schoene, lesbare Interfaces.
>
> Weiter geht es mit: [Sektion 04: Fluent API Pattern](./04-fluent-api-pattern.md)

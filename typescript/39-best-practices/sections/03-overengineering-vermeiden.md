# Sektion 3: Overengineering vermeiden — YAGNI fuer Typen

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [02 - any vs unknown vs never](./02-any-unknown-never.md)
> Naechste Sektion: [04 - Type Assertions vs Type Guards](./04-assertions-vs-guards.md)

---

## Was du hier lernst

- Wie man **Over-Engineering erkennt** — die Warnsignale im Typ-Code
- Das **YAGNI-Prinzip** angewandt auf TypeScript-Typen
- Konkrete Beispiele: Wo Generics, Branded Types und Conditional Types **zu viel** sind
- Die **Faustregeln** fuer angemessene Typ-Komplexitaet

---

## Das Problem: Zu viel des Guten

Du hast in 37 Lektionen maechtige Typ-Werkzeuge gelernt: Generics,
Conditional Types, Mapped Types, Template Literal Types, Branded
Types, Phantom Types. Die Versuchung ist gross, sie ueberall einzusetzen.
Aber **mehr Typsicherheit ist nicht immer besser**.

> 📖 **Hintergrund: YAGNI — You Aren't Gonna Need It**
>
> YAGNI ist ein Prinzip aus Extreme Programming (Kent Beck, 1999):
> "Implementiere nichts, bis du es tatsaechlich brauchst." Es gilt
> fuer Code — und genauso fuer Typen. Ein ueber-generischer Typ
> der "alle moeglichen Faelle abdeckt" ist oft schwerer zu verstehen,
> langsamer fuer den Compiler und fragiler bei Aenderungen als ein
> einfacher konkreter Typ. Die besten TypeScript-Entwickler schreiben
> nicht die komplexesten Typen — sie schreiben die **einfachsten
> Typen die den Job erledigen**.

---

## Warnsignal 1: Generics die nur einmal vorkommen

```typescript annotated
// OVER-ENGINEERED: T wird nur einmal verwendet — kein Mehrwert
function log<T>(message: T): void {
  console.log(message);
}
// ^ T wird nie fuer Rueckgabetyp oder anderen Parameter verwendet
// ^ Es gibt keinen Zusammenhang der durch T ausgedrueckt wird

// RICHTIG: Einfacher Typ reicht
function log(message: unknown): void {
  console.log(message);
}

// GERECHTFERTIGT: T wird mehrfach verwendet — es gibt einen Zusammenhang
function identity<T>(value: T): T {
  return value;
}
// ^ T verbindet Input mit Output — das ist der Sinn von Generics
```

### Die Faustregel fuer Generics

> **Verwende einen Generic nur wenn er mindestens zweimal vorkommt**
> (in Parametern und/oder Rueckgabetyp). Ein Generic der nur einmal
> auftaucht ist fast immer `unknown`.

---

## Warnsignal 2: Conditional Types fuer einfache Faelle

```typescript annotated
// OVER-ENGINEERED: Conditional Type wo eine Union reicht
type ResponseType<T extends "json" | "text"> =
  T extends "json" ? object : T extends "text" ? string : never;

// RICHTIG: Interface-Map ist klarer
interface ResponseMap {
  json: object;
  text: string;
}
type ResponseType<T extends keyof ResponseMap> = ResponseMap[T];
// ^ Gleiche Funktionalitaet, aber lesbar und erweiterbar

// NOCH BESSER (wenn nur 2 Faelle): Overloads
function fetch(url: string, type: "json"): Promise<object>;
function fetch(url: string, type: "text"): Promise<string>;
function fetch(url: string, type: string): Promise<unknown> {
  // Implementierung
}
```

> 🧠 **Erklaere dir selbst:** Wann sind Conditional Types gerechtfertigt
> und wann sind sie Over-Engineering? Was ist die Grenze?
> **Kernpunkte:** Gerechtfertigt: Wenn die Logik wirklich konditional
> ist (infer, rekursive Typen) | Over-Engineering: Wenn eine Map
> oder Overloads reichen | Faustregel: Wenn du den Typ in einer
> Zeile als Map schreiben kannst, brauchst du kein Conditional Type

---

## Warnsignal 3: Branded Types fuer alles

```typescript annotated
// OVER-ENGINEERED: Brands fuer interne, kurzlebige Werte
type FormName = string & { __brand: "FormName" };
type FormEmail = string & { __brand: "FormEmail" };
type FormAge = string & { __brand: "FormAge" };

function processForm(name: FormName, email: FormEmail, age: FormAge) {}
// ^ Drei Brands fuer ein einfaches Formular? Overkill!

// RICHTIG: Einfaches Interface
interface FormData {
  name: string;
  email: string;
  age: string;
}

function processForm(data: FormData) {}
// ^ Klar, einfach, erweiterbar

// GERECHTFERTIGT: Brands fuer Domain-kritische IDs
type UserId = string & { __brand: "UserId" };
type OrderId = string & { __brand: "OrderId" };
// ^ Verwechslung von UserId/OrderId hat echte Konsequenzen
//   (falscher User bekommt falsche Bestellung)
```

### Wann Branded Types sinnvoll sind

| Situation | Branded Type? |
|-----------|:---:|
| Entity-IDs die verwechselt werden koennten (UserId, OrderId) | Ja |
| Waehrungsbetraege (EUR vs USD) | Ja |
| Validierte Werte (Email, URL, Positive Number) | Ja |
| Formularfelder die sowieso zusammengehoeren | Nein |
| Lokale Variablen in einer Funktion | Nein |
| Strings die nur in einem Modul existieren | Nein |

> ⚡ **Framework-Bezug:** In Angular-Projekten siehst du oft
> ueber-typisierte Services: Jeder Parameter hat einen eigenen
> Branded Type, jede Methode hat Generics. Das macht den Service
> schwer zu verwenden. Besser: Branded Types nur fuer IDs die
> zwischen Services wandern. In React: Props-Interfaces einfach
> halten — `{ userId: string }` statt `{ userId: UserId }` wenn
> der Brand keinen echten Schutz bietet.

> 💭 **Denkfrage:** Wie wuerdest du entscheiden ob ein Branded Type
> sich lohnt? Was ist der Mindest-"Wert" den er bieten muss?
>
> **Antwort:** Ein Branded Type lohnt sich wenn die Verwechslung
> zweier Werte einen **echten Bug** verursachen wuerde (z.B. falscher
> User, falscher Betrag). Wenn die Verwechslung nur einen Tippfehler
> in einer lokalen Variable waere, reicht ein einfacher Typ. Die
> Frage: "Was passiert im schlimmsten Fall wenn die Werte vertauscht
> werden?"

---

## Die Komplexitaets-Pyramide

```
                    ▲ Komplexitaet
                   /│\
                  / │ \
                 /  │  \   Type-Level Programming
                /   │   \  (L37) — Fuer Libraries
               /────│────\
              /     │     \   Conditional Types, Mapped Types
             /      │      \  (L16-17) — Fuer Utility Types
            /───────│───────\
           /        │        \   Branded Types, Phantom Types
          /         │         \  (L24, L26) — Fuer Domain-IDs
         /──────────│──────────\
        /           │           \   Generics
       /            │            \  (L13-14) — Fuer wiederverwendbare APIs
      /─────────────│─────────────\
     /              │              \   Interface, type, Union
    /               │               \  (L05, L07, L08) — Fuer 80% des Codes
   /────────────────│────────────────\
  /                 │                 \   Primitive (string, number, boolean)
 /──────────────────│──────────────────\  (L02) — Basis
```

**Regel: Starte immer unten. Gehe nur nach oben wenn unten nicht reicht.**

---

## Experiment: Typ-Audit an eigenem Code

Nimm ein TypeScript-Modul aus deinem Projekt und pruefe:

```typescript
// Checkliste:
// 1. Gibt es Generics die nur einmal vorkommen? → Ersetze durch konkreten Typ
// 2. Gibt es Conditional Types die als Map geschrieben werden koennten? → Vereinfache
// 3. Gibt es Branded Types fuer lokale Werte? → Entferne den Brand
// 4. Gibt es verschachtelte Generics (T extends U extends V)? → Vereinfache
// 5. Versteht ein neuer Entwickler den Typ in unter 30 Sekunden? → Wenn nein: zu komplex

// Bonus: Zaehle die Zeilen die NUR fuer Typ-Definitionen da sind.
// Wenn Typ-Code > 30% des gesamten Codes → wahrscheinlich Over-Engineering.
```

---

## Was du gelernt hast

- **YAGNI gilt auch fuer Typen** — schreibe den einfachsten Typ der den Job erledigt
- **Generics** nur wenn T mindestens zweimal vorkommt
- **Conditional Types** nur wenn eine Map oder Overloads nicht reichen
- **Branded Types** nur fuer Domain-kritische Werte deren Verwechslung echte Bugs verursacht
- Die **Komplexitaets-Pyramide**: Starte unten, gehe nur hoch wenn noetig

> 🧠 **Erklaere dir selbst:** Ein Kollege schreibt: `type ApiResponse<T
> extends Record<string, unknown>> = T extends { error: infer E } ?
> { success: false; error: E } : { success: true; data: T }`. Ist
> das gerechtfertigt oder Over-Engineering? Was wuerdest du vorschlagen?
> **Kernpunkte:** Der Conditional Type ist unnoetig wenn nur 2 Faelle
> existieren | Einfacher: Discriminated Union `{ success: true; data: T }
> | { success: false; error: E }` | Keine Inferenz noetig | Klarere
> Fehlermeldungen

**Kernkonzept zum Merken:** Typ-Komplexitaet hat Kosten — Compiler-Zeit, Lesbarkeit, Wartbarkeit. Jeder Typ muss seinen Nutzen rechtfertigen. Im Zweifel: einfacher.

---

> **Pausenpunkt** — Du weisst jetzt wann Typen zu viel sind.
> Naechster Schritt: Type Assertions vs Type Guards — wann was.
>
> Weiter geht es mit: [Sektion 04: Type Assertions vs Type Guards](./04-assertions-vs-guards.md)

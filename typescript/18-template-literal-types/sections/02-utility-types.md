# Sektion 2: String Utility Types

> Geschaetzte Lesezeit: **10 Minuten**
>
> Vorherige Sektion: [01 - Grundlagen](./01-grundlagen.md)
> Naechste Sektion: [03 - Pattern Matching](./03-pattern-matching.md)

---

## Was du hier lernst

- Die vier eingebauten String-Transformation-Typen: `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>`, `Uncapitalize<T>`
- Was "intrinsisch" bedeutet und warum diese Typen **direkt im Compiler** leben
- Wie man Getter/Setter-Namen, Event-Prefixe und API-Konventionen automatisch generiert
- Warum diese Typen in Kombination mit Template Literals und Unions ihre volle Kraft entfalten

---

## Die Hintergrundgeschichte: Was der Compiler wissen muss

Als das TypeScript-Team Template Literal Types in Version 4.1 entwickelte, stiessen sie auf ein Problem: Wie soll der Compiler `"hello"` zu `"HELLO"` machen?

Das klingt trivial — JavaScript hat `String.prototype.toUpperCase()`. Aber TypeScript-Typen existieren nur zur Compilezeit. Es gibt **keinen JavaScript-Code**, den man aufrufen koennte. Der Compiler muesste die Transformation selbst verstehen.

Die Loesung: Das Team implementierte vier "intrinsic" (eingebaute) Types direkt **in den Compiler-Code**. Sie sind kein TypeScript-Code, der irgendwo in `lib.d.ts` steht — sie sind in Rust (bzw. C++ im urspruenglichen Compiler) implementiert. TypeScript gibt ihnen einfach Namen, aber die eigentliche Logik steckt tief im Compiler.

Das bedeutet: Man kann diese Typen **nicht mit normalen TypeScript-Mitteln nachbauen**. Es gibt kein Conditional Type-Konstrukt, das `"hello"` zu `"HELLO"` transformieren koennte — ausser man haette Zugriff auf den Compiler selbst. Das macht sie zu einer eigenen Kategorie im TypeScript-Typsystem.

---

## Die vier Transformationstypen

```typescript annotated
type A = Uppercase<"hello">;      // "HELLO"
//       ^^^^^^^^^                // Alle Zeichen in Grossbuchstaben
type B = Lowercase<"HELLO">;      // "hello"
//       ^^^^^^^^^                // Alle Zeichen in Kleinbuchstaben
type C = Capitalize<"hello">;     // "Hello"
//       ^^^^^^^^^^               // Nur ERSTER Buchstabe gross, Rest unveraendert
type D = Uncapitalize<"Hello">;   // "hello"
//       ^^^^^^^^^^^^^            // Nur ERSTER Buchstabe klein, Rest unveraendert
```

Das sieht einfach aus — und das ist es auch. Die Kraft liegt nicht in diesen Typen allein, sondern darin, was passiert, wenn man sie mit **Template Literals und Unions** kombiniert.

> **Erklaere dir selbst:** Was ist der Unterschied zwischen `Uppercase<T>` und `Capitalize<T>`? In welcher Situation wuerdest du welchen verwenden? Denke an konkrete Beispiele aus einem API-Design.
>
> **Kernpunkte:** Uppercase transformiert ALLE Zeichen. Capitalize nur den ersten. Uppercase passt fuer Konstanten (HTTP_METHOD), Capitalize fuer CamelCase-Konventionen (onClick, getName). Capitalize ist in der Praxis viel haeufiger, weil JavaScript-Konventionen meist CamelCase verwenden.

---

## Kombiniert mit Template Literals: Getter und Setter

Das klassische Beispiel, das du in fast jedem TypeScript-Projekt brauchen koenntest:

```typescript annotated
type Getter<T extends string> = `get${Capitalize<T>}`;
//          ^^^^^^^^^^^^^^^^^^   ^^^  ^^^^^^^^^^^^^^
//          Constraint: T muss   |    T wird kapitalisiert
//          ein string sein      Prefix "get" wird davorgestellt

type Setter<T extends string> = `set${Capitalize<T>}`;

type GetName = Getter<"name">;     // "getName"
type SetAge  = Setter<"age">;      // "setAge"
type GetUrl  = Getter<"url">;      // "getUrl"

// Der entscheidende Moment: mit Unions kombinieren
type Properties = "name" | "email" | "age";

type GetterNames = Getter<Properties>;
// TypeScript expandiert: Getter<"name"> | Getter<"email"> | Getter<"age">
// Ergebnis:             "getName" | "getEmail" | "getAge"

type SetterNames = Setter<Properties>;
// "setName" | "setEmail" | "setAge"

type AllAccessors = GetterNames | SetterNames;
// "getName" | "getEmail" | "getAge" | "setName" | "setEmail" | "setAge"
```

Das ist **distributives Verhalten**: Wenn `T` eine Union ist, wird der generische Typ fuer jedes Union-Member einzeln ausgewertet. Das ist dasselbe Prinzip, das wir in Sektion 1 beim kartesischen Produkt gesehen haben — aber jetzt mit Transformationen.

---

> **Experiment:** Probiere folgendes im TypeScript Playground:
>
> ```typescript
> type EventName<T extends string> = `on${Capitalize<T>}`;
>
> type DomEvents = "click" | "keydown" | "mouseenter" | "scroll";
>
> type HandlerNames = EventName<DomEvents>;
> // Hovere ueber HandlerNames — was ergibt sich?
>
> // Jetzt ein Interface daraus machen:
> type HandlerProps = {
>   [K in DomEvents as EventName<K>]: (event: Event) => void;
> };
> // Was entsteht hier? Hovere ueber HandlerProps.
> ```
>
> Beachte wie `as EventName<K>` den Key waehrend des Mappings transformiert. Das ist Key Remapping aus L16 — kombiniert mit Template Literal Types aus dieser Lektion.

---

## Ein realistisches Beispiel: API-Methoden generieren

In vielen Projekten gibt es Patterns wie `getUserById`, `getProductById`, `deleteUserById`. Das sind repetitive Muster, die sich mit Template Literal Types automatisch typisieren lassen:

```typescript annotated
type Resource = "user" | "product" | "order";
type CrudAction = "get" | "create" | "update" | "delete";

// Generiere alle CRUD-Methodennamen automatisch
type CrudMethod = `${CrudAction}${Capitalize<Resource>}`;
// "getUser" | "createUser" | "updateUser" | "deleteUser"
// | "getProduct" | "createProduct" | "updateProduct" | "deleteProduct"
// | "getOrder" | "createOrder" | "updateOrder" | "deleteOrder"
// Gesamt: 4 × 3 = 12 Methodennamen

// Jetzt ein typsicheres Service-Interface erstellen:
type ApiService = {
  [K in CrudMethod]: (...args: unknown[]) => Promise<unknown>;
  //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                  Wir vereinfachen den Payload — in der Praxis
  //                  wuerde man das mit bedingten Typen prazisieren
};

// Das Interface erzwingt, dass JEDE der 12 Methoden implementiert ist
declare const service: ApiService;
service.getUser;      // OK
service.deleteOrder;  // OK
// service.fetchUser; // FEHLER! "fetchUser" ist keine gueltige Methode
```

---

## Uppercase fuer Konstanten und Enums

`Uppercase<T>` ist besonders nuetzlich fuer Konstanten und Konfiguration:

```typescript annotated
type HttpMethod = "get" | "post" | "put" | "delete";
type HttpMethodUpper = Uppercase<HttpMethod>;
// "GET" | "POST" | "PUT" | "DELETE"

// Konvertierungsfunktion mit prazisem Rueckgabetyp:
function toUpperMethod<T extends HttpMethod>(method: T): Uppercase<T> {
  return method.toUpperCase() as Uppercase<T>;
  //            ^^^^^^^^^^^^^                    // Laufzeit: .toUpperCase()
  //                          ^^^^^^^^^^^^^^^    // Typ: Uppercase<T> (Compilezeit)
  // Beide muessen uebereinstimmen — TypeScript prueft den Typ,
  // JavaScript fuehrt die Transformation aus
}

const m = toUpperMethod("get");  // Typ: "GET" (nicht nur string!)
// TypeScript weiss exakt, dass "get" zu "GET" wird
```

**In deinem Angular-Projekt:** Angular verwendet Uppercase-Konventionen fuer HTTP-Methoden in Interceptors. Template Literal Types koennen sicherstellen, dass du die richtige Schreibweise verwendest:

```typescript
// In einem Angular HTTP-Interceptor
type AllowedMethod = Uppercase<"get" | "post" | "put" | "delete">;
// "GET" | "POST" | "PUT" | "DELETE"

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly methodsNeedingAuth: AllowedMethod[] = ["POST", "PUT", "DELETE"];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const method = req.method as AllowedMethod;
    if (this.methodsNeedingAuth.includes(method)) {
      // Authentifizierung hinzufuegen
    }
    return next.handle(req);
  }
}
```

---

## Uncapitalize: Der wenig bekannte vierte Typ

`Uncapitalize<T>` ist der am seltensten verwendete der vier Typen — aber er hat seinen Platz, insbesondere beim Konvertieren von PascalCase zu camelCase:

```typescript annotated
type PascalToCamel<T extends string> = Uncapitalize<T>;
//  "UserProfile" -> "userProfile"
//  "HttpRequest" -> "httpRequest"

type Properties = "Name" | "Email" | "Age";  // PascalCase

type CamelProperties = Uncapitalize<Properties>;
// "name" | "email" | "age"

// Praktisch: Wenn du eine Bibliothek hast, die PascalCase-Keys liefert,
// aber dein Interface camelCase erwartet:
type NormalizeKeys<T> = {
  [K in keyof T as Uncapitalize<K & string>]: T[K];
};

interface PascalApi {
  UserName: string;
  UserAge: number;
  IsActive: boolean;
}

type NormalizedApi = NormalizeKeys<PascalApi>;
// {
//   userName: string;
//   userAge: number;
//   isActive: boolean;
// }
```

Das zeigt das kombinierte Muster: Key Remapping aus L16 (`as` Klausel) plus `Uncapitalize` aus dieser Sektion. Template Literal Types bauen auf dem auf, was du schon weisst.

---

## Die Grenzen: Was intrinsisch bedeutet

Ein kurzer Blick auf das, was diese Typen **nicht** koennen:

```typescript
// Das kann Capitalize NICHT:
type CamelToSnake<T extends string> = ???;
// "userName" -> "user_name" — das geht mit Capitalize allein nicht
// Dafuer braucht man infer + Rekursion (Sektion 3!)

// Das kann Uppercase NICHT:
type OnlyFirstWordUpper<T extends string> = ???;
// "hello world" -> "Hello world" — auch das geht nicht direkt
```

Die intrinsischen Typen sind bewusst **einfach gehalten**. Sie machen eine Sache und machen sie gut. Fuer komplexere String-Transformationen braucht man die Kombination aus Template Literals und `infer` — das ist das Thema von Sektion 3.

> **Denkfrage:** Wenn Capitalize nur den ersten Buchstaben transformiert — was passiert mit `Capitalize<"helloWorld">`? Und was mit `Capitalize<"hello-world">`? Pruefe deine Antwort im TypeScript Playground, bevor du weiter liest.
>
> **Antwort:** `Capitalize<"helloWorld">` ergibt `"HelloWorld"` — der Rest bleibt unveraendert, also wird aus CamelCase einfach CamelCase mit grossem Anfangsbuchstaben. `Capitalize<"hello-world">` ergibt `"Hello-world"` — nur der erste Buchstabe vor dem Bindestrich wird gross. Das ist oft unerwartet fuer Entwickler, die einen vollstaendigen Titel-Case erwarten.

---

## Was du gelernt hast

- `Uppercase<T>`, `Lowercase<T>`, `Capitalize<T>` und `Uncapitalize<T>` sind die vier eingebauten String-Transformationstypen — direkt im TypeScript-Compiler implementiert, nicht in TypeScript selbst
- Diese Typen sind **intrinsisch** — sie koennen nicht mit Conditional Types nachgebaut werden, weil die String-Manipulation selbst im Compiler steckt
- In Kombination mit Template Literals entstehen maeechtige Muster: automatische Getter/Setter-Namen, Event-Handler-Props, CRUD-Methoden
- **Distributives Verhalten**: Wenn `T` eine Union ist, wird der Typ fuer jedes Union-Member einzeln ausgewertet — das Ergebnis ist wieder eine Union

> **Erklaere dir selbst:** Du hast `type Getter<T extends string> = \`get${Capitalize<T>}\`` gesehen. Erklaere Schritt fuer Schritt, was passiert wenn du `Getter<"name" | "age">` auswertest. Wie kommt TypeScript zu `"getName" | "getAge"`?
>
> **Kernpunkte:** Union-Distribution | Fuer jedes Union-Member einzeln auswerten | Getter<"name"> = "getName", Getter<"age"> = "getAge" | Ergebnisse werden zu neuer Union vereinigt

**Kernkonzept zum Merken:** Die vier String-Utilities sind absichtlich primitiv — sie transformieren Gross-/Kleinschreibung und sonst nichts. Ihre Kraft liegt in der Kombination mit Template Literals und dem distributiven Verhalten gegenueber Unions. Wenn du komplexere String-Manipulationen brauchst, musst du `infer` dazunehmen — das kommt in der naechsten Sektion.

---

## Schnellreferenz: Die vier intrinsischen Typen

| Typ | Transformation | Beispiel |
|---|---|---|
| `Uppercase<T>` | Alle Zeichen gross | `"hello"` → `"HELLO"` |
| `Lowercase<T>` | Alle Zeichen klein | `"HELLO"` → `"hello"` |
| `Capitalize<T>` | Erster Buchstabe gross | `"hello"` → `"Hello"` |
| `Uncapitalize<T>` | Erster Buchstabe klein | `"Hello"` → `"hello"` |

Alle vier Typen sind distributiv: Sie funktionieren auf einzelnen Strings und auf Unions. Das macht sie ideal als Baustein in groesseren generischen Typen.

Ein Gedankenstueck zum Abschluss: Warum gibt es kein `TitleCase<T>` das jedes Wort grossschreibt? Weil TypeScript keine Leerzeichen als Wortgrenzen interpretieren kann — ausser durch rekursive `infer`-Typen. Das waere moeglich, aber sehr langsam fuer den Compiler und in der Praxis selten benoetigt. Die vier eingebauten Typen deckten den groessten Teil der realen Anwendungsfaelle ab — der Rest bleibt der Kreativitaet des Entwicklers mit `infer` ueberlassen.

---

> **Pausenpunkt** — Guter Moment, um das Gelernte zu festigen. Kannst du aus dem Kopf ein `type IsEventHandler<T extends string> = T extends \`on${Capitalize<string>}\` ? true : false` konstruieren? Probiere es im Playground aus — was ergibt `IsEventHandler<"onClick">` und `IsEventHandler<"handleClick">`?
>
> Weiter geht es mit: [Sektion 03: Pattern Matching mit Strings](./03-pattern-matching.md)

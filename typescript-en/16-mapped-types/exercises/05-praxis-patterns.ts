/**
 * Lektion 16 - Exercise 05: Praxis-Patterns
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/05-praxis-patterns.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: FormState<T> System
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein vollstaendiges Form-State-System:
// - FormErrors<T> — jede Property optional als string (Fehlermeldung)
// - FormTouched<T> — jede Property als boolean
// - FormDirty<T> — jede Property als boolean
// - FormState<T> — values, errors, touched, dirty, isValid, isSubmitting
//
// Dann erstelle eine initFormState<T>-Funktion die einen initialen
// FormState mit leeren Werten erzeugt.

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  age: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: API DTO System
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ein DTO-System fuer eine REST API:
// - CreateDTO<T> — ohne id, createdAt, updatedAt
// - UpdateDTO<T> — wie CreateDTO aber alles optional
// - ResponseDTO<T> — Date-Felder werden zu string
// Alle basierend auf einem Entity-Typ mit id, createdAt, updatedAt.

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Article extends BaseEntity {
  title: string;
  content: string;
  published: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: WithAccessors<T>
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle WithAccessors<T> das dem Original-Typ Getter und Setter
// hinzufuegt: getX(): T[K] und setX(value: T[K]): void
// Implementiere dann eine createAccessible<T>-Funktion die ein Objekt
// mit Accessors versieht.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: EventMap ableiten
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle EventMap<T> das fuer jede Property ein {K}Changed-Event
// mit previousValue und newValue generiert.
// Erstelle dann eine makeObservable<T>-Funktion die ein Objekt
// "beobachtbar" macht — bei jeder Aenderung wird ein Event ausgeloest.

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Config-Schema
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Erstelle ConfigSchema<T> das fuer jede Property:
// { value: T[K]; default: T[K]; description: string; required: boolean }
// generiert. Implementiere eine createConfig<T>-Funktion die aus einem
// Schema die endgueltigen Config-Werte extrahiert.

// Exercise 04: Multi-Step Validierung — SearchQuery aufbauen
// ==========================================================
// Ziel: Brands als Validierungszustands-Tracking verwenden

// In dieser Übung modellierst du eine Verarbeitungs-Pipeline
// bei der jeder Schritt einen eigenen Brand-Typ produziert.

// TODO 1: Definiere Brand-"Flags" (keine Basis-Typen, nur Marker):
//   - Trimmed     — String wurde getrimmt (keine Leerzeichen am Rand)
//   - NonEmpty    — String ist nicht leer
//   - Lowercase   — String ist kleingeschrieben
//   - Escaped     — String wurde HTML-escaped (< > & werden zu &lt; &gt; &amp;)

// TODO 2: Definiere kombinierte Typen:
//   - TrimmedString   = string & Trimmed
//   - SearchQuery     = string & Trimmed & NonEmpty & Lowercase

// TODO 3: Schreibe die Transformations-Funktionen:
//   - trim(s: string): TrimmedString  — nutze .trim()
//   - assertNonEmpty(s: TrimmedString): string & Trimmed & NonEmpty  — wirft wenn leer
//   - toLowercase(s: string & Trimmed & NonEmpty): SearchQuery  — nutze .toLowerCase()
//   - escape(s: string): string & Escaped  — ersetze < > & mit HTML-Entities

// TODO 4: Schreibe eine Hilfsfunktion die alle Schritte kombiniert:
//   - createSearchQuery(input: string): SearchQuery | null
//     (gibt null wenn die Eingabe leer ist nach trim)

// TODO 5: Schreibe eine Funktion die SearchQuery erwartet:
//   - function searchProducts(query: SearchQuery): void {
//       console.log(`Suche nach: "${query}"`);
//     }

// TODO 6: Teste:
// const q1 = createSearchQuery("  TypeScript GENERICS  ");
// → "typescript generics" (trimmed + lowercase)
// if (q1) searchProducts(q1);  // ✅

// searchProducts("typescript"); // ❌ COMPILE-ERROR
// searchProducts(trim("  test  ")); // ❌ COMPILE-ERROR — noch nicht NonEmpty + Lowercase

export {};

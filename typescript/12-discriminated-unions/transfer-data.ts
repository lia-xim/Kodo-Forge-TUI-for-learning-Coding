/**
 * Lektion 12 — Transfer Tasks: Discriminated Unions
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "12-form-wizard",
    title: "Mehrstufiger Formular-Wizard mit State Machine",
    prerequisiteLessons: [12],
    scenario:
      "Du baust einen Registrierungsprozess mit mehreren Schritten. " +
      "Bisher verwendet das Team Booleans (isStep1Done, isStep2Done, ...) " +
      "und Bugs entstehen, weil Benutzer Schritte ueberspringen koennen.",
    task:
      "Modelliere den Wizard als Discriminated Union:\n\n" +
      "1. Definiere die Wizard-Zustaende: personal_info, address, payment, confirmation, completed\n" +
      "2. Jeder Zustand hat nur die Daten die in diesem Schritt relevant sind\n" +
      "3. Erstelle State-Transition-Funktionen (nextStep, previousStep)\n" +
      "4. Stelle sicher, dass Schritte nicht uebersprungen werden koennen\n" +
      "5. Erstelle eine render-Funktion mit Exhaustive Check",
    starterCode: [
      "// TODO: Wizard-Zustaende als Discriminated Union",
      "// TODO: State-Transition-Funktionen",
      "// TODO: render-Funktion mit Exhaustive Check",
    ].join("\n"),
    solutionCode: [
      "type WizardState =",
      '  | { step: "personal_info"; name: string; email: string }',
      '  | { step: "address"; name: string; email: string; street: string; city: string }',
      '  | { step: "payment"; name: string; email: string; street: string; city: string; cardNumber: string }',
      '  | { step: "confirmation"; summary: { name: string; email: string; address: string; payment: string } }',
      '  | { step: "completed"; orderId: string };',
      "",
      "function assertNever(value: never): never {",
      "  throw new Error(`Unbehandelt: ${JSON.stringify(value)}`);",
      "}",
      "",
      "function toAddress(",
      '  state: Extract<WizardState, { step: "personal_info" }>,',
      "  address: { street: string; city: string }",
      "): WizardState {",
      '  return { step: "address", name: state.name, email: state.email, ...address };',
      "}",
      "",
      "function render(state: WizardState): string {",
      "  switch (state.step) {",
      '    case "personal_info": return `Schritt 1: Name=${state.name}`;',
      '    case "address": return `Schritt 2: ${state.street}, ${state.city}`;',
      '    case "payment": return `Schritt 3: Karte ****${state.cardNumber.slice(-4)}`;',
      '    case "confirmation": return `Schritt 4: Bitte bestaetigen`;',
      '    case "completed": return `Fertig! Bestellnr: ${state.orderId}`;',
      "    default: return assertNever(state);",
      "  }",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union als State Machine",
      "Extract fuer typsichere Uebergaenge",
      "Exhaustive Check mit assertNever",
      "Zustandsuebergaenge als Funktionen",
    ],
    hints: [
      "Jeder Schritt ist eine eigene Variante mit 'step' als Diskriminator.",
      "Extract<WizardState, { step: 'personal_info' }> stellt sicher, dass nur der richtige Vorgaenger-Zustand uebergeben wird.",
      "Die render-Funktion mit assertNever im default warnt bei neuen Schritten.",
    ],
    difficulty: 4,
  },

  {
    id: "12-api-error-handler",
    title: "Typsicherer API-Error-Handler",
    prerequisiteLessons: [12],
    scenario:
      "Dein Backend gibt verschiedene Fehlertypen zurueck: Validierung, " +
      "Authentifizierung, Rate-Limiting, Wartungsmodus. Bisher wird alles " +
      "als generischer Error behandelt — keine spezifische Benutzer-Meldung.",
    task:
      "Erstelle ein Error-Handling-System:\n\n" +
      "1. Definiere eine ApiError Discriminated Union mit 5+ Fehlervarianten\n" +
      "2. Erstelle eine formatError-Funktion fuer Benutzer-Meldungen\n" +
      "3. Erstelle eine shouldRetry-Funktion\n" +
      "4. Erstelle eine logError-Funktion fuer verschiedene Log-Level\n" +
      "5. Zeige wie der Exhaustive Check bei neuen Fehlertypen hilft",
    starterCode: [
      "// TODO: ApiError Discriminated Union",
      "// TODO: formatError fuer Benutzer-Meldungen",
      "// TODO: shouldRetry fuer Retry-Logik",
      "// TODO: logError fuer differenziertes Logging",
    ].join("\n"),
    solutionCode: [
      "type ApiError =",
      '  | { type: "validation"; fields: { name: string; message: string }[] }',
      '  | { type: "auth"; reason: "expired" | "invalid" | "missing" }',
      '  | { type: "rate_limit"; retryAfterMs: number }',
      '  | { type: "maintenance"; estimatedEnd: Date }',
      '  | { type: "server"; statusCode: number; message: string };',
      "",
      "function formatError(error: ApiError): string {",
      "  switch (error.type) {",
      '    case "validation":',
      "      return `Bitte korrigiere: ${error.fields.map(f => f.message).join(', ')}`;",
      '    case "auth":',
      "      return error.reason === 'expired' ? 'Sitzung abgelaufen' : 'Zugriff verweigert';",
      '    case "rate_limit":',
      "      return `Zu viele Anfragen. Bitte warte ${Math.ceil(error.retryAfterMs / 1000)}s.`;",
      '    case "maintenance":',
      "      return `Wartungsmodus bis ${error.estimatedEnd.toLocaleTimeString()}.`;",
      '    case "server":',
      "      return `Server-Fehler (${error.statusCode}). Bitte spaeter erneut versuchen.`;",
      "  }",
      "}",
      "",
      "function shouldRetry(error: ApiError): boolean {",
      "  switch (error.type) {",
      '    case "rate_limit": return true;',
      '    case "server": return error.statusCode >= 500;',
      '    case "validation": case "auth": case "maintenance": return false;',
      "  }",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union fuer Error-Hierarchie",
      "Exhaustive Check als Sicherheitsnetz",
      "Pattern Matching fuer Geschaeftslogik",
      "Typsichere Fehlerbehandlung ohne try/catch",
    ],
    hints: [
      "Jeder Fehlertyp braucht einen eindeutigen 'type'-Wert und spezifische Daten.",
      "shouldRetry nutzt den Diskriminator um zu entscheiden ob ein Retry sinnvoll ist.",
      "Wenn ein neuer Fehlertyp hinzukommt, zeigen assertNever-Stellen alle Funktionen die aktualisiert werden muessen.",
    ],
    difficulty: 4,
  },

  {
    id: "12-event-sourcing",
    title: "Event Sourcing mit Discriminated Unions",
    prerequisiteLessons: [12],
    scenario:
      "Du baust ein Bankkonto-System. Statt den aktuellen Stand zu speichern, " +
      "speicherst du alle Events (Einzahlung, Abhebung, Ueberweisung). " +
      "Der aktuelle Stand wird aus den Events berechnet.",
    task:
      "Implementiere ein Event-Sourcing-System:\n\n" +
      "1. Definiere BankEvent als Discriminated Union (deposit, withdrawal, transfer, interest)\n" +
      "2. Erstelle eine applyEvent-Funktion (Reducer) die den Kontostand berechnet\n" +
      "3. Erstelle eine replay-Funktion die alle Events nachspielt\n" +
      "4. Erstelle eine formatEvent-Funktion fuer den Kontoauszug\n" +
      "5. Verwende Exhaustive Checks ueberall",
    starterCode: [
      "// TODO: BankEvent Discriminated Union",
      "// TODO: applyEvent Reducer",
      "// TODO: replay Funktion",
      "// TODO: formatEvent fuer Kontoauszug",
    ].join("\n"),
    solutionCode: [
      "type BankEvent =",
      '  | { type: "deposit"; amount: number; timestamp: Date }',
      '  | { type: "withdrawal"; amount: number; timestamp: Date }',
      '  | { type: "transfer"; amount: number; to: string; timestamp: Date }',
      '  | { type: "interest"; rate: number; timestamp: Date };',
      "",
      "type AccountState = { balance: number; owner: string };",
      "",
      "function applyEvent(state: AccountState, event: BankEvent): AccountState {",
      "  switch (event.type) {",
      '    case "deposit":',
      "      return { ...state, balance: state.balance + event.amount };",
      '    case "withdrawal":',
      "      return { ...state, balance: state.balance - event.amount };",
      '    case "transfer":',
      "      return { ...state, balance: state.balance - event.amount };",
      '    case "interest":',
      "      return { ...state, balance: state.balance * (1 + event.rate) };",
      "  }",
      "}",
      "",
      "function replay(initial: AccountState, events: BankEvent[]): AccountState {",
      "  return events.reduce(applyEvent, initial);",
      "}",
      "",
      "function formatEvent(event: BankEvent): string {",
      "  const date = event.timestamp.toLocaleDateString();",
      "  switch (event.type) {",
      '    case "deposit": return `${date}: +${event.amount} EUR (Einzahlung)`;',
      '    case "withdrawal": return `${date}: -${event.amount} EUR (Abhebung)`;',
      '    case "transfer": return `${date}: -${event.amount} EUR (Ueberweisung an ${event.to})`;',
      '    case "interest": return `${date}: Zinsen ${(event.rate * 100).toFixed(2)}%`;',
      "  }",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union als Event-Typ",
      "Reducer-Pattern (applyEvent)",
      "Event Replay aus Event-Historie",
      "Exhaustive Check fuer neue Event-Typen",
    ],
    hints: [
      "Jedes Event hat einen 'type'-Diskriminator und einen Zeitstempel.",
      "applyEvent ist ein Reducer: (state, event) => newState — wie in Redux.",
      "replay faltet alle Events mit reduce() ueber den Anfangszustand.",
    ],
    difficulty: 5,
  },
];

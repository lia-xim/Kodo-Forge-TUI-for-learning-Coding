/**
 * Lektion 25 — Transfer Tasks: Type-safe Error Handling
 *
 * 3 Transfer Tasks in NEUEN Kontexten:
 *  1. Typsicheres Validierungssystem fuer ein API-Gateway (Backend)
 *  2. Error Handling fuer eine Datei-Upload-Pipeline (File Processing)
 *  3. Fehlerbehandlung in einem Multi-Step-Wizard (UI-Framework)
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // --- Task 1: API-Gateway Validierung ---
  {
    id: "25-api-gateway-validation",
    title: "Typsicheres Validierungssystem fuer ein API-Gateway",
    prerequisiteLessons: [12, 25],
    scenario:
      "Du arbeitest an einem API-Gateway das eingehende Requests validiert " +
      "bevor sie an Microservices weitergeleitet werden. Aktuell wirft das " +
      "Gateway bei ungueltigem Input einfach eine Exception — Clients " +
      "bekommen dann ein generisches 500er-Error. Das Problem: Es gibt " +
      "verschiedene Validierungsfehler (fehlende Header, ungueltiger Body, " +
      "abgelaufene Tokens) und der Client soll jeweils spezifisches Feedback " +
      "bekommen. In deinem Angular-Projekt am Arbeitsplatz kennst du das " +
      "Problem: HttpInterceptors werfen catch-all Errors.",
    task:
      "Implementiere ein typsicheres Validierungssystem mit Result-Typen.\n\n" +
      "1. Definiere einen ValidationError Union-Typ mit mindestens 4 Varianten: " +
      "MISSING_HEADER, INVALID_BODY, EXPIRED_TOKEN, RATE_LIMITED\n" +
      "2. Schreibe Validierungs-Funktionen die Result<T, ValidationError> zurueckgeben\n" +
      "3. Komponiere die Validierungen mit flatMapResult zu einer Pipeline\n" +
      "4. Konvertiere ValidationError zu HTTP-Status-Codes mit exhaustivem Switch\n" +
      "5. Zeige wie ein neuer Fehler-Typ (z.B. PAYLOAD_TOO_LARGE) sofort Compile-Errors " +
      "an allen Switch-Stellen erzeugt",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "// TODO: ValidationError Union-Typ\n" +
      "// TODO: validateHeaders(req): Result<Headers, ValidationError>\n" +
      "// TODO: validateBody(req): Result<Body, ValidationError>\n" +
      "// TODO: validateToken(req): Result<Token, ValidationError>\n" +
      "// TODO: Pipeline mit flatMapResult\n" +
      "// TODO: toHttpStatus(e: ValidationError): number (exhaustiv)",
    solutionCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "function flatMap<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {\n" +
      "  return r.ok ? fn(r.value) : r;\n" +
      "}\n" +
      "function assertNever(x: never): never { throw new Error(`Unhandled: ${x}`); }\n" +
      "\n" +
      "type ValidationError =\n" +
      "  | { type: 'MISSING_HEADER'; header: string }\n" +
      "  | { type: 'INVALID_BODY'; message: string }\n" +
      "  | { type: 'EXPIRED_TOKEN'; expiredAt: string }\n" +
      "  | { type: 'RATE_LIMITED'; retryAfterMs: number };\n" +
      "\n" +
      "interface Request { headers: Record<string, string>; body: string; }\n" +
      "interface ValidatedRequest { contentType: string; payload: unknown; token: string; }\n" +
      "\n" +
      "function validateHeaders(req: Request): Result<string, ValidationError> {\n" +
      "  const ct = req.headers['content-type'];\n" +
      "  if (!ct) return err({ type: 'MISSING_HEADER', header: 'content-type' });\n" +
      "  return ok(ct);\n" +
      "}\n" +
      "\n" +
      "function validateBody(body: string): Result<unknown, ValidationError> {\n" +
      "  try { return ok(JSON.parse(body)); }\n" +
      "  catch { return err({ type: 'INVALID_BODY', message: 'Invalid JSON' }); }\n" +
      "}\n" +
      "\n" +
      "function validateToken(req: Request): Result<string, ValidationError> {\n" +
      "  const auth = req.headers['authorization'];\n" +
      "  if (!auth) return err({ type: 'MISSING_HEADER', header: 'authorization' });\n" +
      "  if (auth === 'expired') return err({ type: 'EXPIRED_TOKEN', expiredAt: '2024-01-01' });\n" +
      "  return ok(auth);\n" +
      "}\n" +
      "\n" +
      "function validateRequest(req: Request): Result<ValidatedRequest, ValidationError> {\n" +
      "  return flatMap(\n" +
      "    validateHeaders(req),\n" +
      "    ct => flatMap(\n" +
      "      validateBody(req.body),\n" +
      "      payload => flatMap(\n" +
      "        validateToken(req),\n" +
      "        token => ok({ contentType: ct, payload, token })\n" +
      "      )\n" +
      "    )\n" +
      "  );\n" +
      "}\n" +
      "\n" +
      "function toHttpStatus(e: ValidationError): number {\n" +
      "  switch (e.type) {\n" +
      "    case 'MISSING_HEADER': return 400;\n" +
      "    case 'INVALID_BODY':   return 422;\n" +
      "    case 'EXPIRED_TOKEN':  return 401;\n" +
      "    case 'RATE_LIMITED':   return 429;\n" +
      "    default: return assertNever(e);\n" +
      "  }\n" +
      "}",
    conceptsBridged: [
      "Result-Pattern fuer Validierung",
      "flatMapResult fuer sequentielle Validierung",
      "Exhaustiver Switch fuer Error-zu-HTTP Mapping",
      "Union-Typen als Fehler-Hierarchie",
    ],
    hints: [
      "Starte mit dem ValidationError Union-Typ. Jede Variante braucht ein `type`-Property als Discriminant.",
      "Jede Validierungsfunktion gibt Result zurueck. flatMap verkettet sie: Wenn eine fehlschlaegt, brechen alle ab.",
      "toHttpStatus: switch ueber e.type mit assertNever im default. Fuege PAYLOAD_TOO_LARGE hinzu und beobachte den Compile-Error.",
    ],
    difficulty: 4,
  },

  // --- Task 2: Datei-Upload-Pipeline ---
  {
    id: "25-file-upload-pipeline",
    title: "Error Handling fuer eine Datei-Upload-Pipeline",
    prerequisiteLessons: [12, 25],
    scenario:
      "Du baust ein Datei-Upload-System fuer eine Dokumenten-Verwaltung. " +
      "Eine Datei durchlaeuft mehrere Verarbeitungsschritte: Groessen-Check, " +
      "Typ-Validierung, Virus-Scan, Thumbnail-Generierung und Speicherung. " +
      "Jeder Schritt kann auf unterschiedliche Weise fehlschlagen. Aktuell " +
      "werden alle Fehler als generischer string behandelt — der Benutzer " +
      "sieht immer 'Upload fehlgeschlagen'. In deinem React-Projekt hast " +
      "du aehnliche Probleme: fetch-Errors werden nicht differenziert.",
    task:
      "Implementiere eine typsichere Upload-Pipeline mit spezifischen Fehler-Typen.\n\n" +
      "1. Definiere UploadError Union: FILE_TOO_LARGE, INVALID_TYPE, VIRUS_DETECTED, STORAGE_FULL, THUMBNAIL_FAILED\n" +
      "2. Schreibe Verarbeitungs-Funktionen die Result<ProcessedFile, UploadError> zurueckgeben\n" +
      "3. Verwende mapResult fuer Transformationen (z.B. Thumbnail-Groesse berechnen)\n" +
      "4. Erstelle eine exhaustive toUserMessage-Funktion mit satisfies Record\n" +
      "5. Zeige die gesamte Pipeline: Datei rein → Result mit spezifischer Fehlermeldung raus",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "interface FileInput { name: string; sizeBytes: number; mimeType: string; content: string; }\n" +
      "interface ProcessedFile { name: string; thumbnailUrl: string; storagePath: string; }\n" +
      "\n" +
      "// TODO: UploadError Union\n" +
      "// TODO: checkSize, checkType, scanVirus, generateThumbnail, store\n" +
      "// TODO: Pipeline\n" +
      "// TODO: toUserMessage (exhaustiv)",
    solutionCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "function flatMap<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {\n" +
      "  return r.ok ? fn(r.value) : r;\n" +
      "}\n" +
      "\n" +
      "interface FileInput { name: string; sizeBytes: number; mimeType: string; content: string; }\n" +
      "interface ProcessedFile { name: string; thumbnailUrl: string; storagePath: string; }\n" +
      "\n" +
      "type UploadError =\n" +
      "  | { type: 'FILE_TOO_LARGE'; maxBytes: number; actualBytes: number }\n" +
      "  | { type: 'INVALID_TYPE'; allowed: string[]; actual: string }\n" +
      "  | { type: 'VIRUS_DETECTED'; threatName: string }\n" +
      "  | { type: 'STORAGE_FULL'; availableBytes: number }\n" +
      "  | { type: 'THUMBNAIL_FAILED'; reason: string };\n" +
      "\n" +
      "const MAX_SIZE = 10_000_000;\n" +
      "const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];\n" +
      "\n" +
      "function checkSize(file: FileInput): Result<FileInput, UploadError> {\n" +
      "  if (file.sizeBytes > MAX_SIZE) return err({ type: 'FILE_TOO_LARGE', maxBytes: MAX_SIZE, actualBytes: file.sizeBytes });\n" +
      "  return ok(file);\n" +
      "}\n" +
      "\n" +
      "function checkType(file: FileInput): Result<FileInput, UploadError> {\n" +
      "  if (!ALLOWED_TYPES.includes(file.mimeType)) return err({ type: 'INVALID_TYPE', allowed: ALLOWED_TYPES, actual: file.mimeType });\n" +
      "  return ok(file);\n" +
      "}\n" +
      "\n" +
      "function scanVirus(file: FileInput): Result<FileInput, UploadError> {\n" +
      "  if (file.content.includes('VIRUS')) return err({ type: 'VIRUS_DETECTED', threatName: 'TestVirus' });\n" +
      "  return ok(file);\n" +
      "}\n" +
      "\n" +
      "function generateThumbnail(file: FileInput): Result<string, UploadError> {\n" +
      "  if (!file.mimeType.startsWith('image/')) return err({ type: 'THUMBNAIL_FAILED', reason: 'Nicht-Bild' });\n" +
      "  return ok(`/thumbs/${file.name}.jpg`);\n" +
      "}\n" +
      "\n" +
      "function store(file: FileInput, thumbUrl: string): Result<ProcessedFile, UploadError> {\n" +
      "  return ok({ name: file.name, thumbnailUrl: thumbUrl, storagePath: `/uploads/${file.name}` });\n" +
      "}\n" +
      "\n" +
      "function processUpload(file: FileInput): Result<ProcessedFile, UploadError> {\n" +
      "  return flatMap(\n" +
      "    checkSize(file),\n" +
      "    f => flatMap(\n" +
      "      checkType(f),\n" +
      "      f2 => flatMap(\n" +
      "        scanVirus(f2),\n" +
      "        f3 => flatMap(\n" +
      "          generateThumbnail(f3),\n" +
      "          thumb => store(f3, thumb)\n" +
      "        )\n" +
      "      )\n" +
      "    )\n" +
      "  );\n" +
      "}\n" +
      "\n" +
      "type UploadErrorType = UploadError['type'];\n" +
      "const userMessages = {\n" +
      "  FILE_TOO_LARGE: 'Die Datei ist zu gross. Maximum: 10 MB.',\n" +
      "  INVALID_TYPE: 'Dieser Dateityp wird nicht unterstuetzt.',\n" +
      "  VIRUS_DETECTED: 'Die Datei wurde als schaedlich erkannt.',\n" +
      "  STORAGE_FULL: 'Kein Speicherplatz verfuegbar.',\n" +
      "  THUMBNAIL_FAILED: 'Vorschaubild konnte nicht erstellt werden.',\n" +
      "} satisfies Record<UploadErrorType, string>;",
    conceptsBridged: [
      "Result-Pipeline fuer sequentielle Verarbeitung",
      "Spezifische Error-Union statt generischer Strings",
      "satisfies Record fuer exhaustive Fehlermeldungen",
      "mapResult/flatMapResult Komposition",
    ],
    hints: [
      "Definiere jeden UploadError-Typ mit einem `type`-Discriminant und spezifischen Daten (z.B. maxBytes bei FILE_TOO_LARGE).",
      "Jeder Verarbeitungsschritt gibt Result zurueck. flatMap verkettet: checkSize → checkType → scanVirus → thumbnail → store.",
      "satisfies Record<UploadError['type'], string> prueft dass fuer JEDEN Error-Typ eine Nachricht existiert — Compile-Error wenn eine fehlt.",
    ],
    difficulty: 4,
  },

  // --- Task 3: Multi-Step Wizard ---
  {
    id: "25-multi-step-wizard",
    title: "Fehlerbehandlung in einem Multi-Step-Wizard",
    prerequisiteLessons: [12, 25],
    scenario:
      "Du baust einen Registrierungs-Wizard mit 4 Schritten: persoenliche " +
      "Daten, Adresse, Zahlungsinformationen und Bestaetigung. Jeder Schritt " +
      "kann verschiedene Validierungsfehler haben. Der Wizard soll dem Benutzer " +
      "zeigen WELCHER Schritt fehlgeschlagen ist und WAS genau falsch war. " +
      "In deinem Angular-Projekt nutzt du Reactive Forms — stell dir vor, " +
      "die gleiche Logik fuer FormGroup-Validierung. In React waere es ein " +
      "Multi-Step-Form mit useState fuer jeden Schritt.",
    task:
      "Implementiere typsichere Wizard-Validierung mit Result-Typen.\n\n" +
      "1. Definiere WizardError als Union mit step-Discriminant: PERSONAL_DATA, ADDRESS, PAYMENT, CONFIRMATION\n" +
      "2. Jede Variante hat spezifische Fehler-Details (z.B. PERSONAL_DATA: field + message)\n" +
      "3. Schreibe validateStep-Funktionen fuer jeden Schritt → Result<StepData, WizardError>\n" +
      "4. Erstelle submitWizard das alle Schritte nacheinander validiert (flatMapResult)\n" +
      "5. Implementiere getStepErrorMessage: exhaustiver Switch der benutzerfreundliche Meldungen zurueckgibt\n" +
      "6. Bonus: Konvertiere WizardError zu FormField-Highlighting (welches Feld rot markieren?)",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "// TODO: PersonalData, Address, Payment Interfaces\n" +
      "// TODO: WizardError Union (4 Varianten)\n" +
      "// TODO: validatePersonalData, validateAddress, validatePayment, validateConfirmation\n" +
      "// TODO: submitWizard Pipeline\n" +
      "// TODO: getStepErrorMessage (exhaustiv)",
    solutionCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "function flatMap<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {\n" +
      "  return r.ok ? fn(r.value) : r;\n" +
      "}\n" +
      "function assertNever(x: never): never { throw new Error(`Unhandled: ${x}`); }\n" +
      "\n" +
      "interface PersonalData { name: string; email: string; age: number; }\n" +
      "interface Address { street: string; city: string; zip: string; }\n" +
      "interface Payment { cardNumber: string; expiry: string; }\n" +
      "interface Registration { personal: PersonalData; address: Address; payment: Payment; }\n" +
      "\n" +
      "type WizardError =\n" +
      "  | { step: 'PERSONAL_DATA'; field: string; message: string }\n" +
      "  | { step: 'ADDRESS'; field: string; message: string }\n" +
      "  | { step: 'PAYMENT'; field: string; message: string }\n" +
      "  | { step: 'CONFIRMATION'; reason: string };\n" +
      "\n" +
      "function validatePersonal(data: PersonalData): Result<PersonalData, WizardError> {\n" +
      "  if (!data.name.trim()) return err({ step: 'PERSONAL_DATA', field: 'name', message: 'Name ist Pflichtfeld' });\n" +
      "  if (!data.email.includes('@')) return err({ step: 'PERSONAL_DATA', field: 'email', message: 'Ungueltige E-Mail' });\n" +
      "  if (data.age < 18) return err({ step: 'PERSONAL_DATA', field: 'age', message: 'Mindestalter: 18' });\n" +
      "  return ok(data);\n" +
      "}\n" +
      "\n" +
      "function validateAddress(addr: Address): Result<Address, WizardError> {\n" +
      "  if (!addr.street.trim()) return err({ step: 'ADDRESS', field: 'street', message: 'Strasse fehlt' });\n" +
      "  if (!addr.zip.match(/^\\d{5}$/)) return err({ step: 'ADDRESS', field: 'zip', message: 'PLZ muss 5 Ziffern haben' });\n" +
      "  return ok(addr);\n" +
      "}\n" +
      "\n" +
      "function validatePayment(pay: Payment): Result<Payment, WizardError> {\n" +
      "  if (pay.cardNumber.replace(/\\s/g, '').length !== 16) return err({ step: 'PAYMENT', field: 'cardNumber', message: 'Kartennummer muss 16 Stellen haben' });\n" +
      "  return ok(pay);\n" +
      "}\n" +
      "\n" +
      "function submitWizard(p: PersonalData, a: Address, pay: Payment): Result<Registration, WizardError> {\n" +
      "  return flatMap(\n" +
      "    validatePersonal(p),\n" +
      "    personal => flatMap(\n" +
      "      validateAddress(a),\n" +
      "      address => flatMap(\n" +
      "        validatePayment(pay),\n" +
      "        payment => ok({ personal, address, payment })\n" +
      "      )\n" +
      "    )\n" +
      "  );\n" +
      "}\n" +
      "\n" +
      "function getStepErrorMessage(e: WizardError): string {\n" +
      "  switch (e.step) {\n" +
      "    case 'PERSONAL_DATA': return `Schritt 1: ${e.field} — ${e.message}`;\n" +
      "    case 'ADDRESS': return `Schritt 2: ${e.field} — ${e.message}`;\n" +
      "    case 'PAYMENT': return `Schritt 3: ${e.field} — ${e.message}`;\n" +
      "    case 'CONFIRMATION': return `Schritt 4: ${e.reason}`;\n" +
      "    default: return assertNever(e);\n" +
      "  }\n" +
      "}\n" +
      "\n" +
      "// Demo:\n" +
      "const result = submitWizard(\n" +
      "  { name: 'Max', email: 'max@test.de', age: 25 },\n" +
      "  { street: 'Hauptstr. 1', city: 'Berlin', zip: '10115' },\n" +
      "  { cardNumber: '1234 5678 9012 3456', expiry: '12/25' }\n" +
      ");\n" +
      "if (result.ok) console.log('Registrierung:', result.value);\n" +
      "else console.log('Fehler:', getStepErrorMessage(result.error));",
    conceptsBridged: [
      "Result fuer Multi-Step Validierung",
      "Discriminated Union mit step-Property",
      "flatMapResult fuer sequentielle Wizard-Schritte",
      "Exhaustive Switch fuer benutzerfreundliche Fehlermeldungen",
      "Error-zu-UI Mapping (welches Feld hervorheben)",
    ],
    hints: [
      "WizardError nutzt 'step' als Discriminant statt 'type'. Jede Variante hat Step-spezifische Details.",
      "submitWizard verkettet die Schritte mit flatMap. Wenn Schritt 1 fehlschlaegt, werden 2-4 uebersprungen.",
      "getStepErrorMessage: switch ueber e.step. Jeder Case baut eine benutzerfreundliche Meldung mit den spezifischen Details.",
    ],
    difficulty: 4,
  },
];

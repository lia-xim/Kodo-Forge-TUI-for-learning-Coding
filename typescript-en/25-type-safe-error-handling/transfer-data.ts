/**
 * Lesson 25 — Transfer Tasks: Type-safe Error Handling
 *
 * 3 Transfer Tasks in NEW contexts:
 *  1. Type-safe validation system for an API gateway (Backend)
 *  2. Error handling for a file upload pipeline (File Processing)
 *  3. Error handling in a multi-step wizard (UI Framework)
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // --- Task 1: API Gateway Validation ---
  {
    id: "25-api-gateway-validation",
    title: "Type-safe Validation System for an API Gateway",
    prerequisiteLessons: [12, 25],
    scenario:
      "You are working on an API gateway that validates incoming requests " +
      "before forwarding them to microservices. Currently, the gateway simply " +
      "throws an exception for invalid input — clients then receive a generic " +
      "500 error. The problem: there are different validation errors (missing " +
      "headers, invalid body, expired tokens) and the client should receive " +
      "specific feedback for each case. In your Angular project at work, you " +
      "know this problem: HttpInterceptors throw catch-all errors.",
    task:
      "Implement a type-safe validation system with Result types.\n\n" +
      "1. Define a ValidationError union type with at least 4 variants: " +
      "MISSING_HEADER, INVALID_BODY, EXPIRED_TOKEN, RATE_LIMITED\n" +
      "2. Write validation functions that return Result<T, ValidationError>\n" +
      "3. Compose the validations with flatMapResult into a pipeline\n" +
      "4. Convert ValidationError to HTTP status codes with an exhaustive switch\n" +
      "5. Show how a new error type (e.g. PAYLOAD_TOO_LARGE) immediately causes compile errors " +
      "at all switch locations",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "// TODO: ValidationError union type\n" +
      "// TODO: validateHeaders(req): Result<Headers, ValidationError>\n" +
      "// TODO: validateBody(req): Result<Body, ValidationError>\n" +
      "// TODO: validateToken(req): Result<Token, ValidationError>\n" +
      "// TODO: Pipeline with flatMapResult\n" +
      "// TODO: toHttpStatus(e: ValidationError): number (exhaustive)",
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
      "Result pattern for validation",
      "flatMapResult for sequential validation",
      "Exhaustive switch for error-to-HTTP mapping",
      "Union types as error hierarchy",
    ],
    hints: [
      "Start with the ValidationError union type. Each variant needs a `type` property as the discriminant.",
      "Each validation function returns Result. flatMap chains them: if one fails, all subsequent ones abort.",
      "toHttpStatus: switch over e.type with assertNever in default. Add PAYLOAD_TOO_LARGE and observe the compile error.",
    ],
    difficulty: 4,
  },

  // --- Task 2: File Upload Pipeline ---
  {
    id: "25-file-upload-pipeline",
    title: "Error Handling for a File Upload Pipeline",
    prerequisiteLessons: [12, 25],
    scenario:
      "You are building a file upload system for a document management application. " +
      "A file goes through several processing steps: size check, " +
      "type validation, virus scan, thumbnail generation, and storage. " +
      "Each step can fail in different ways. Currently " +
      "all errors are handled as a generic string — the user " +
      "always sees 'Upload failed'. In your React project you " +
      "have similar problems: fetch errors are not differentiated.",
    task:
      "Implement a type-safe upload pipeline with specific error types.\n\n" +
      "1. Define UploadError union: FILE_TOO_LARGE, INVALID_TYPE, VIRUS_DETECTED, STORAGE_FULL, THUMBNAIL_FAILED\n" +
      "2. Write processing functions that return Result<ProcessedFile, UploadError>\n" +
      "3. Use mapResult for transformations (e.g. calculating thumbnail size)\n" +
      "4. Create an exhaustive toUserMessage function using satisfies Record\n" +
      "5. Show the complete pipeline: file in → Result with specific error message out",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "interface FileInput { name: string; sizeBytes: number; mimeType: string; content: string; }\n" +
      "interface ProcessedFile { name: string; thumbnailUrl: string; storagePath: string; }\n" +
      "\n" +
      "// TODO: UploadError union\n" +
      "// TODO: checkSize, checkType, scanVirus, generateThumbnail, store\n" +
      "// TODO: Pipeline\n" +
      "// TODO: toUserMessage (exhaustive)",
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
      "  if (!file.mimeType.startsWith('image/')) return err({ type: 'THUMBNAIL_FAILED', reason: 'Not an image' });\n" +
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
      "  FILE_TOO_LARGE: 'The file is too large. Maximum: 10 MB.',\n" +
      "  INVALID_TYPE: 'This file type is not supported.',\n" +
      "  VIRUS_DETECTED: 'The file was identified as malicious.',\n" +
      "  STORAGE_FULL: 'No storage space available.',\n" +
      "  THUMBNAIL_FAILED: 'Thumbnail could not be created.',\n" +
      "} satisfies Record<UploadErrorType, string>;",
    conceptsBridged: [
      "Result pipeline for sequential processing",
      "Specific error union instead of generic strings",
      "satisfies Record for exhaustive error messages",
      "mapResult/flatMapResult composition",
    ],
    hints: [
      "Define each UploadError type with a `type` discriminant and specific data (e.g. maxBytes for FILE_TOO_LARGE).",
      "Each processing step returns Result. flatMap chains them: checkSize → checkType → scanVirus → thumbnail → store.",
      "satisfies Record<UploadError['type'], string> verifies that a message exists for EVERY error type — compile error if one is missing.",
    ],
    difficulty: 4,
  },

  // --- Task 3: Multi-Step Wizard ---
  {
    id: "25-multi-step-wizard",
    title: "Error Handling in a Multi-Step Wizard",
    prerequisiteLessons: [12, 25],
    scenario:
      "You are building a registration wizard with 4 steps: personal " +
      "data, address, payment information, and confirmation. Each step " +
      "can have different validation errors. The wizard should show the user " +
      "WHICH step failed and WHAT exactly was wrong. " +
      "In your Angular project you use Reactive Forms — imagine " +
      "the same logic for FormGroup validation. In React it would be a " +
      "multi-step form with useState for each step.",
    task:
      "Implement type-safe wizard validation with Result types.\n\n" +
      "1. Define WizardError as a union with step discriminant: PERSONAL_DATA, ADDRESS, PAYMENT, CONFIRMATION\n" +
      "2. Each variant has specific error details (e.g. PERSONAL_DATA: field + message)\n" +
      "3. Write validateStep functions for each step → Result<StepData, WizardError>\n" +
      "4. Create submitWizard that validates all steps sequentially (flatMapResult)\n" +
      "5. Implement getStepErrorMessage: exhaustive switch that returns user-friendly messages\n" +
      "6. Bonus: Convert WizardError to FormField highlighting (which field to highlight in red?)",
    starterCode:
      "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\n" +
      "function ok<T>(v: T) { return { ok: true as const, value: v }; }\n" +
      "function err<E>(e: E) { return { ok: false as const, error: e }; }\n" +
      "\n" +
      "// TODO: PersonalData, Address, Payment interfaces\n" +
      "// TODO: WizardError union (4 variants)\n" +
      "// TODO: validatePersonalData, validateAddress, validatePayment, validateConfirmation\n" +
      "// TODO: submitWizard pipeline\n" +
      "// TODO: getStepErrorMessage (exhaustive)",
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
      "  if (!data.name.trim()) return err({ step: 'PERSONAL_DATA', field: 'name', message: 'Name is required' });\n" +
      "  if (!data.email.includes('@')) return err({ step: 'PERSONAL_DATA', field: 'email', message: 'Invalid email' });\n" +
      "  if (data.age < 18) return err({ step: 'PERSONAL_DATA', field: 'age', message: 'Minimum age: 18' });\n" +
      "  return ok(data);\n" +
      "}\n" +
      "\n" +
      "function validateAddress(addr: Address): Result<Address, WizardError> {\n" +
      "  if (!addr.street.trim()) return err({ step: 'ADDRESS', field: 'street', message: 'Street is required' });\n" +
      "  if (!addr.zip.match(/^\\d{5}$/)) return err({ step: 'ADDRESS', field: 'zip', message: 'ZIP code must have 5 digits' });\n" +
      "  return ok(addr);\n" +
      "}\n" +
      "\n" +
      "function validatePayment(pay: Payment): Result<Payment, WizardError> {\n" +
      "  if (pay.cardNumber.replace(/\\s/g, '').length !== 16) return err({ step: 'PAYMENT', field: 'cardNumber', message: 'Card number must have 16 digits' });\n" +
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
      "    case 'PERSONAL_DATA': return `Step 1: ${e.field} — ${e.message}`;\n" +
      "    case 'ADDRESS': return `Step 2: ${e.field} — ${e.message}`;\n" +
      "    case 'PAYMENT': return `Step 3: ${e.field} — ${e.message}`;\n" +
      "    case 'CONFIRMATION': return `Step 4: ${e.reason}`;\n" +
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
      "if (result.ok) console.log('Registration:', result.value);\n" +
      "else console.log('Error:', getStepErrorMessage(result.error));",
    conceptsBridged: [
      "Result for multi-step validation",
      "Discriminated union with step property",
      "flatMapResult for sequential wizard steps",
      "Exhaustive switch for user-friendly error messages",
      "Error-to-UI mapping (which field to highlight)",
    ],
    hints: [
      "WizardError uses 'step' as the discriminant instead of 'type'. Each variant has step-specific details.",
      "submitWizard chains the steps with flatMap. If step 1 fails, steps 2–4 are skipped.",
      "getStepErrorMessage: switch over e.step. Each case builds a user-friendly message with the specific details.",
    ],
    difficulty: 4,
  },
];
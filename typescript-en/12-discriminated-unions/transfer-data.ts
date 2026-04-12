/**
 * Lesson 12 — Transfer Tasks: Discriminated Unions
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "12-form-wizard",
    title: "Multi-Step Form Wizard with State Machine",
    prerequisiteLessons: [12],
    scenario:
      "You are building a registration process with multiple steps. " +
      "Currently the team uses Booleans (isStep1Done, isStep2Done, ...) " +
      "and bugs arise because users can skip steps.",
    task:
      "Model the wizard as a Discriminated Union:\n\n" +
      "1. Define the wizard states: personal_info, address, payment, confirmation, completed\n" +
      "2. Each state only holds data relevant to that step\n" +
      "3. Create state transition functions (nextStep, previousStep)\n" +
      "4. Ensure that steps cannot be skipped\n" +
      "5. Create a render function with Exhaustive Check",
    starterCode: [
      "// TODO: Wizard states as Discriminated Union",
      "// TODO: State transition functions",
      "// TODO: render function with Exhaustive Check",
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
      "  throw new Error(`Unhandled: ${JSON.stringify(value)}`);",
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
      '    case "personal_info": return `Step 1: Name=${state.name}`;',
      '    case "address": return `Step 2: ${state.street}, ${state.city}`;',
      '    case "payment": return `Step 3: Card ****${state.cardNumber.slice(-4)}`;',
      '    case "confirmation": return `Step 4: Please confirm`;',
      '    case "completed": return `Done! Order no.: ${state.orderId}`;',
      "    default: return assertNever(state);",
      "  }",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union as State Machine",
      "Extract for type-safe transitions",
      "Exhaustive Check with assertNever",
      "State transitions as functions",
    ],
    hints: [
      "Each step is its own variant with 'step' as the discriminator.",
      "Extract<WizardState, { step: 'personal_info' }> ensures that only the correct predecessor state is passed.",
      "The render function with assertNever in the default case warns when new steps are added.",
    ],
    difficulty: 4,
  },

  {
    id: "12-api-error-handler",
    title: "Type-Safe API Error Handler",
    prerequisiteLessons: [12],
    scenario:
      "Your backend returns various error types: validation, " +
      "authentication, rate limiting, maintenance mode. Currently everything " +
      "is treated as a generic Error — no specific user message.",
    task:
      "Create an error handling system:\n\n" +
      "1. Define an ApiError Discriminated Union with 5+ error variants\n" +
      "2. Create a formatError function for user messages\n" +
      "3. Create a shouldRetry function\n" +
      "4. Create a logError function for different log levels\n" +
      "5. Show how the Exhaustive Check helps with new error types",
    starterCode: [
      "// TODO: ApiError Discriminated Union",
      "// TODO: formatError for user messages",
      "// TODO: shouldRetry for retry logic",
      "// TODO: logError for differentiated logging",
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
      "      return `Please correct: ${error.fields.map(f => f.message).join(', ')}`;",
      '    case "auth":',
      "      return error.reason === 'expired' ? 'Session expired' : 'Access denied';",
      '    case "rate_limit":',
      "      return `Too many requests. Please wait ${Math.ceil(error.retryAfterMs / 1000)}s.`;",
      '    case "maintenance":',
      "      return `Maintenance mode until ${error.estimatedEnd.toLocaleTimeString()}.`;",
      '    case "server":',
      "      return `Server error (${error.statusCode}). Please try again later.`;",
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
      "Discriminated Union for error hierarchy",
      "Exhaustive Check as safety net",
      "Pattern matching for business logic",
      "Type-safe error handling without try/catch",
    ],
    hints: [
      "Each error type needs a unique 'type' value and specific data.",
      "shouldRetry uses the discriminator to decide whether a retry makes sense.",
      "When a new error type is added, assertNever locations show all functions that need to be updated.",
    ],
    difficulty: 4,
  },

  {
    id: "12-event-sourcing",
    title: "Event Sourcing with Discriminated Unions",
    prerequisiteLessons: [12],
    scenario:
      "You are building a bank account system. Instead of storing the current balance, " +
      "you store all events (deposit, withdrawal, transfer). " +
      "The current balance is calculated from the events.",
    task:
      "Implement an event sourcing system:\n\n" +
      "1. Define BankEvent as a Discriminated Union (deposit, withdrawal, transfer, interest)\n" +
      "2. Create an applyEvent function (reducer) that calculates the account balance\n" +
      "3. Create a replay function that replays all events\n" +
      "4. Create a formatEvent function for the account statement\n" +
      "5. Use Exhaustive Checks everywhere",
    starterCode: [
      "// TODO: BankEvent Discriminated Union",
      "// TODO: applyEvent Reducer",
      "// TODO: replay function",
      "// TODO: formatEvent for account statement",
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
      '    case "deposit": return `${date}: +${event.amount} EUR (Deposit)`;',
      '    case "withdrawal": return `${date}: -${event.amount} EUR (Withdrawal)`;',
      '    case "transfer": return `${date}: -${event.amount} EUR (Transfer to ${event.to})`;',
      '    case "interest": return `${date}: Interest ${(event.rate * 100).toFixed(2)}%`;',
      "  }",
      "}",
    ].join("\n"),
    conceptsBridged: [
      "Discriminated Union as event type",
      "Reducer pattern (applyEvent)",
      "Event replay from event history",
      "Exhaustive Check for new event types",
    ],
    hints: [
      "Each event has a 'type' discriminator and a timestamp.",
      "applyEvent is a reducer: (state, event) => newState — just like in Redux.",
      "replay folds all events with reduce() over the initial state.",
    ],
    difficulty: 5,
  },
];
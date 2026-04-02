// LÖSUNG 02: Exhaustive Error Handling

function assertNever(x: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(x)}`);
}

type FormField = 'email' | 'username' | 'password';

type FormError =
  | { type: 'REQUIRED'; field: FormField }
  | { type: 'TOO_SHORT'; field: FormField; min: number }
  | { type: 'INVALID_FORMAT'; field: FormField; pattern: string }
  | { type: 'TAKEN'; field: FormField };
  // | { type: 'CONTAIN_SPACES'; field: FormField }; // Uncomment to see TS error

function getFormErrorMessage(e: FormError): string {
  switch (e.type) {
    case 'REQUIRED':       return `${e.field} wird benötigt`;
    case 'TOO_SHORT':      return `${e.field} muss mind. ${e.min} Zeichen lang sein`;
    case 'INVALID_FORMAT': return `${e.field} hat ungültiges Format (${e.pattern})`;
    case 'TAKEN':          return `${e.field} ist bereits vergeben`;
    default:               return assertNever(e);
  }
}

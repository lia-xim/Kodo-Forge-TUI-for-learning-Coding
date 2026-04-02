// Exercise 04: Error Konvertierung zwischen Ebenen
// TODO 1: Definiere DbError Union: CONSTRAINT | CONNECTION | TIMEOUT
// TODO 2: Definiere DomainError Union: ALREADY_EXISTS | UNAVAILABLE
// TODO 3: Schreibe mapDbToDomainError(err: DbError, meta: { email?: string }): DomainError
// TODO 4: CONSTRAINT → ALREADY_EXISTS (email als info)
// TODO 5: CONNECTION/TIMEOUT → UNAVAILABLE (mit Nachricht)
// TODO 6: Verwende assertNever im Switch-Default
export {};

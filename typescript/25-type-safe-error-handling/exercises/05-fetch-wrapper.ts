// Exercise 05: Fetch Wrapper mit Result
// TODO 1: Definiere FetchError = NOT_FOUND (id) | DECODE (message) | NETWORK (message)
// TODO 2: Schreibe async fetchUser(id: string): Promise<Result<User, FetchError>>
// TODO 3: Nutze try/catch für fetch() Aufruf → NETWORK Error
// TODO 4: Wenn response.status === 404 → NOT_FOUND Error
// TODO 5: Wenn res.json() fehlschlägt → DECODE Error
// TODO 6: Sonst → ok(user)
export {};

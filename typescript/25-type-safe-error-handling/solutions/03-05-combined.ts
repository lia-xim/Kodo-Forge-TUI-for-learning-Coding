// LÖSUNGEN 03-05 kombiniert

function assertNever(x: never): never { throw new Error(`Unhandled: ${JSON.stringify(x)}`); }

// --- Lösung 03: Option/Maybe ---
type Some<T> = { kind: 'some'; value: T };
type None    = { kind: 'none' };
type Maybe<T> = Some<T> | None;

const some = <T>(v: T): Some<T> => ({ kind: 'some', value: v });
const none: None = { kind: 'none' };

function fromNullable<T>(v: T | null | undefined): Maybe<T> {
  return v != null ? some(v) : none;
}
function filterMaybe<T>(m: Maybe<T>, pred: (v: T) => boolean): Maybe<T> {
  if (m.kind === 'none') return none;
  return pred(m.value) ? m : none;
}
function mapMaybe<T, U>(m: Maybe<T>, fn: (v: T) => U): Maybe<U> {
  return m.kind === 'none' ? none : some(fn(m.value));
}
function getOrElse<T>(m: Maybe<T>, d: T): T {
  return m.kind === 'some' ? m.value : d;
}

// --- Lösung 04: Error Conversion ---
type DbError =
  | { type: 'CONSTRAINT'; col: string }
  | { type: 'CONNECTION'; msg: string }
  | { type: 'TIMEOUT'; ms: number };

type DomainError =
  | { type: 'ALREADY_EXISTS'; email: string }
  | { type: 'UNAVAILABLE'; message: string };

function mapDbToDomainError(err: DbError, meta: { email?: string }): DomainError {
  switch (err.type) {
    case 'CONSTRAINT': return { type: 'ALREADY_EXISTS', email: meta.email ?? '' };
    case 'CONNECTION': return { type: 'UNAVAILABLE', message: 'DB down: ' + err.msg };
    case 'TIMEOUT':    return { type: 'UNAVAILABLE', message: `Timeout nach ${err.ms}ms` };
    default:           return assertNever(err);
  }
}

// --- Lösung 05: Fetch Wrapper ---
type Ok<T> = { ok: true; value: T };
type Err<E> = { ok: false; error: E };
type Result<T, E> = Ok<T> | Err<E>;

type FetchError =
  | { type: 'NOT_FOUND'; id: string }
  | { type: 'DECODE'; message: string }
  | { type: 'NETWORK'; message: string };

type User = { id: string; name: string };

async function fetchUser(id: string): Promise<Result<User, FetchError>> {
  let response: Response;
  try {
    response = await fetch(`/api/users/${id}`);
  } catch (e) {
    return { ok: false, error: { type: 'NETWORK', message: (e as Error).message } };
  }

  if (response.status === 404) {
    return { ok: false, error: { type: 'NOT_FOUND', id } };
  }
  if (!response.ok) {
    return { ok: false, error: { type: 'NETWORK', message: `HTTP ${response.status}` } };
  }

  try {
    const data = await response.json();
    return { ok: true, value: data as User };
  } catch (e) {
    return { ok: false, error: { type: 'DECODE', message: 'Invalid JSON' } };
  }
}

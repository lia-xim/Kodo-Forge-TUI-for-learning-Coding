/**
 * Lektion 19 - Beispiel 05: Praxis-Patterns
 */

// Barrel File Pattern
// In einem echten Projekt: index.ts
// export { UserService } from './user-service.ts';
// export { AuthService } from './auth-service.ts';
// export type { User, AuthToken } from './types.ts';

// Feature-basierte Organisation
interface User { id: string; name: string; email: string; }
interface ApiResponse<T> { data: T; status: number; }

function fetchUser(id: string): Promise<ApiResponse<User>> {
  return Promise.resolve({ data: { id, name: "Max", email: "max@test.de" }, status: 200 });
}

export { fetchUser };
export type { User, ApiResponse };

console.log("Praxis-Patterns Beispiel geladen.");

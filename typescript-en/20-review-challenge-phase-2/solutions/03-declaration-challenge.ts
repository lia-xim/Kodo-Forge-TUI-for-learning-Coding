/**
 * L20 - Loesung 03: Declaration Challenge
 */

// AUFGABE 1
// declare module 'http-client' {
//   export function get<T>(url: string): Promise<T>;
//   export function post<T>(url: string, body: unknown): Promise<T>;
//   export function put<T>(url: string, body: unknown): Promise<T>;
//   export function del(url: string): Promise<void>;
// }

// AUFGABE 2-3
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      DATABASE_URL: string;
    }
  }
}

// AUFGABE 4
// declare module '*.svg' { const src: string; export default src; }
// declare module '*.png' { const src: string; export default src; }
// declare module '*.module.css' { const classes: Record<string, string>; export default classes; }

export {};

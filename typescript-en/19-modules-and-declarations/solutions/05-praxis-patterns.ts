/**
 * Lektion 19 - Loesung 05: Praxis-Patterns
 */

// AUFGABE 1: Barrel File
// features/index.ts:
// export { UserService } from './user/user-service.ts';
// export { ProductService } from './product/product-service.ts';
// export type { User, Product, Order } from './types.ts';

// AUFGABE 2: Typ-Organisation
interface User { id: string; name: string; email: string; }
interface Product { id: string; name: string; price: number; }
interface Order { id: string; userId: string; items: { productId: string; qty: number }[]; }

// AUFGABE 3: SVG Declaration
// declare module '*.svg' {
//   const content: string;
//   export default content;
// }

// AUFGABE 4: env.d.ts — siehe Loesung 04

// AUFGABE 5: Barrel Files vermeiden wenn:
// - Tree-Shaking wichtig ist (Barrel Files importieren ALLES)
// - Zirkulaere Abhaengigkeiten entstehen
// - Die Module selten zusammen verwendet werden

export type { User, Product, Order };

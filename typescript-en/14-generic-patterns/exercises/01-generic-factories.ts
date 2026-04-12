/**
 * Lektion 14 - Exercise 01: Generic Factories
 *
 * Pruefe deine Loesungen mit: npx tsx exercises/01-generic-factories.ts
 *
 * 5 Aufgaben zu Factory Functions, Builder Pattern und Registry.
 * Ersetze alle TODO-Kommentare mit der richtigen Loesung.
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfache Generic Factory
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Schreibe eine generische Funktion "createPair" die zwei Werte
// desselben Typs nimmt und ein Tuple [T, T] zurueckgibt.
// function createPair<T>(a: T, b: T): [T, T] { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Factory mit Defaults
// ═══════════════════════════════════════════════════════════════════════════

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

// TODO: Schreibe eine Funktion "createApiConfig" die Partial<ApiConfig>
// akzeptiert und eine vollstaendige ApiConfig mit sinnvollen Defaults
// zurueckgibt.
// function createApiConfig(overrides?: Partial<ApiConfig>): ApiConfig { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 3: Constructor Factory
// ═══════════════════════════════════════════════════════════════════════════

class EmailService {
  send(to: string, body: string) {
    console.log(`Email an ${to}: ${body}`);
  }
}

class SmsService {
  send(to: string, body: string) {
    console.log(`SMS an ${to}: ${body}`);
  }
}

// TODO: Schreibe eine generische Factory "createService" die eine Klasse
// akzeptiert (Constructor ohne Argumente) und eine Instanz zurueckgibt.
// Der Rueckgabetyp soll automatisch inferiert werden.
// function createService<T>(Ctor: ...): T { ... }

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Builder Pattern
// ═══════════════════════════════════════════════════════════════════════════

// TODO: Implementiere eine Klasse "QueryBuilder<T>" die SQL-artige
// Queries typsicher aufbaut:
//
// interface QueryBuilder<T extends Record<string, unknown> = {}> {
//   select<K extends string>(field: K): QueryBuilder<T & Record<K, true>>;
//   where(condition: string): QueryBuilder<T>;
//   build(): { fields: string[]; conditions: string[] };
// }
//
// Verwendung:
// const query = new QueryBuilder()
//   .select("name")
//   .select("email")
//   .where("age > 18")
//   .build();

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Typed Factory Registry
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationMap {
  email: { to: string; subject: string; body: string };
  sms: { phone: string; message: string };
  push: { token: string; title: string; body: string };
}

// TODO: Schreibe eine Klasse "NotificationFactory" mit:
// - register<K>(type: K, handler: (data: NotificationMap[K]) => void): void
// - send<K>(type: K, data: NotificationMap[K]): void
// K soll auf keyof NotificationMap eingeschraenkt sein.

// ═══════════════════════════════════════════════════════════════════════════
// TESTS — Entkommentiere nach der Implementierung
// ═══════════════════════════════════════════════════════════════════════════

// console.log("--- Tests ---");
// const pair = createPair(1, 2);
// console.log("Pair:", pair); // [1, 2]
//
// const apiCfg = createApiConfig({ timeout: 10000 });
// console.log("ApiConfig:", apiCfg);
//
// const email = createService(EmailService);
// email.send("test@test.de", "Hallo!");
//
// const query = new QueryBuilder()
//   .select("name")
//   .select("email")
//   .where("age > 18")
//   .build();
// console.log("Query:", query);
//
// const nf = new NotificationFactory();
// nf.register("email", (data) => console.log(`Email an ${data.to}: ${data.subject}`));
// nf.register("sms", (data) => console.log(`SMS an ${data.phone}: ${data.message}`));
// nf.send("email", { to: "test@test.de", subject: "Test", body: "Inhalt" });
// nf.send("sms", { phone: "+49123", message: "Hallo" });

console.log("Exercise 01 geladen. Ersetze die TODOs!");

/**
 * Lektion 14 - Solution 01: Generic Factories
 *
 * Ausfuehren mit: npx tsx solutions/01-generic-factories.ts
 */

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 1: Einfache Generic Factory
// ═══════════════════════════════════════════════════════════════════════════

function createPair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 2: Factory mit Defaults
// ═══════════════════════════════════════════════════════════════════════════

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

function createApiConfig(overrides?: Partial<ApiConfig>): ApiConfig {
  return {
    baseUrl: "https://api.example.com",
    timeout: 5000,
    retries: 3,
    headers: { "Content-Type": "application/json" },
    ...overrides,
  };
}

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

function createService<T>(Ctor: new () => T): T {
  return new Ctor();
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 4: Builder Pattern
// ═══════════════════════════════════════════════════════════════════════════

class QueryBuilder<T extends Record<string, unknown> = {}> {
  private fields: string[] = [];
  private conditions: string[] = [];

  select<K extends string>(field: K): QueryBuilder<T & Record<K, true>> {
    this.fields.push(field);
    return this as unknown as QueryBuilder<T & Record<K, true>>;
  }

  where(condition: string): QueryBuilder<T> {
    this.conditions.push(condition);
    return this;
  }

  build(): { fields: string[]; conditions: string[] } {
    return {
      fields: [...this.fields],
      conditions: [...this.conditions],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUFGABE 5: Typed Factory Registry
// ═══════════════════════════════════════════════════════════════════════════

interface NotificationMap {
  email: { to: string; subject: string; body: string };
  sms: { phone: string; message: string };
  push: { token: string; title: string; body: string };
}

class NotificationFactory {
  private handlers = new Map<string, Function>();

  register<K extends keyof NotificationMap>(
    type: K,
    handler: (data: NotificationMap[K]) => void
  ): void {
    this.handlers.set(type as string, handler);
  }

  send<K extends keyof NotificationMap>(
    type: K,
    data: NotificationMap[K]
  ): void {
    const handler = this.handlers.get(type as string);
    if (!handler) throw new Error(`No handler for: ${String(type)}`);
    handler(data);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

console.log("--- Tests ---");

const pair = createPair(1, 2);
console.log("Pair:", pair); // [1, 2]

const pairStr = createPair("hello", "world");
console.log("Pair strings:", pairStr); // ["hello", "world"]

const apiCfg = createApiConfig({ timeout: 10000 });
console.log("ApiConfig:", apiCfg);

const email = createService(EmailService);
email.send("test@test.de", "Hallo!");

const sms = createService(SmsService);
sms.send("+49123", "Test-SMS");

const query = new QueryBuilder()
  .select("name")
  .select("email")
  .where("age > 18")
  .where("active = true")
  .build();
console.log("Query:", query);

const nf = new NotificationFactory();
nf.register("email", (data) => console.log(`Email an ${data.to}: ${data.subject}`));
nf.register("sms", (data) => console.log(`SMS an ${data.phone}: ${data.message}`));
nf.send("email", { to: "test@test.de", subject: "Test", body: "Inhalt" });
nf.send("sms", { phone: "+49123", message: "Hallo" });

console.log("\n--- Alle Tests bestanden! ---");

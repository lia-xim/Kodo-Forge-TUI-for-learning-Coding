/**
 * Lektion 21 — Beispiel 05: Static Members & Patterns
 *
 * Ausfuehren: npx tsx examples/05-static-factory.ts
 */

// ═══ 1. Static Felder und Methoden ═══

class MathHelper {
  static PI: number = 3.14159265358979;

  static circleArea(radius: number): number {
    return MathHelper.PI * radius ** 2;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

console.log(MathHelper.PI);                   // 3.14159...
console.log(MathHelper.circleArea(5));         // 78.539...
console.log(MathHelper.clamp(150, 0, 100));   // 100

// ═══ 2. Parameter Properties ═══

class UserCompact {
  constructor(
    public name: string,
    private email: string,
    readonly id: number
  ) {}

  getInfo(): string {
    return `${this.name} (${this.email}) #${this.id}`;
  }
}

const u = new UserCompact("Anna", "anna@mail.de", 42);
console.log(u.name);                          // "Anna"
console.log(u.id);                            // 42
console.log(u.getInfo());                     // "Anna (anna@mail.de) #42"

// ═══ 3. Singleton-Pattern ═══

class AppConfig {
  private static instance: AppConfig | null = null;

  private constructor(
    public readonly apiUrl: string,
    public readonly debug: boolean
  ) {
    console.log("AppConfig erstellt");
  }

  static getInstance(): AppConfig {
    if (AppConfig.instance === null) {
      AppConfig.instance = new AppConfig("https://api.example.com", false);
    }
    return AppConfig.instance;
  }
}

const config1 = AppConfig.getInstance();     // "AppConfig erstellt"
const config2 = AppConfig.getInstance();     // (nichts — bereits erstellt)
console.log(config1 === config2);            // true

// ═══ 4. Factory-Pattern ═══

class Color {
  private constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number
  ) {}

  static fromRGB(r: number, g: number, b: number): Color {
    return new Color(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );
  }

  static fromHex(hex: string): Color {
    const h = hex.replace("#", "");
    return new Color(
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16)
    );
  }

  static readonly RED = Color.fromRGB(255, 0, 0);
  static readonly GREEN = Color.fromRGB(0, 255, 0);
  static readonly BLUE = Color.fromRGB(0, 0, 255);

  toString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}

console.log(Color.fromHex("#FF8000").toString());  // rgb(255, 128, 0)
console.log(Color.RED.toString());                  // rgb(255, 0, 0)

// ═══ 5. Static Counter ═══

class Entity {
  static nextId: number = 1;
  readonly id: number;

  constructor(public name: string) {
    this.id = Entity.nextId++;
  }
}

const e1 = new Entity("A");
const e2 = new Entity("B");
const e3 = new Entity("C");
console.log(e1.id, e2.id, e3.id);             // 1 2 3

console.log("\n--- Alle Beispiele erfolgreich ausgefuehrt ---");

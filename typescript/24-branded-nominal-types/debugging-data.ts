// debugging-data.ts — L24: Branded/Nominal Types
// 5 Debugging Challenges

export interface DebuggingChallenge {
  id: number;
  title: string;
  description: string;
  buggyCode: string;
  errorMessage: string;
  fix: string;
  explanation: string;
}

export const debuggingChallenges: DebuggingChallenge[] = [
  {
    id: 1,
    title: "Type-Alias gibt keinen Schutz",
    description: "Der Code soll verhindern dass OrderId an getUser() übergeben wird. Aber es kompiliert trotzdem fehlerlos. Finde den Bug.",
    buggyCode: `type UserId  = string;  // Nur ein Alias
type OrderId = string;  // Identisch!

function getUser(id: UserId): string {
  return \`User: \${id}\`;
}

const orderId: OrderId = "order-456";
console.log(getUser(orderId)); // Kein Fehler! Bug!`,
    errorMessage: "Kein Compile-Error obwohl OrderId verwendet wird — der Schutz fehlt komplett.",
    fix: `type UserId  = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function getUser(id: UserId): string {
  return \`User: \${id}\`;
}

function createOrderId(raw: string): OrderId {
  return raw as OrderId;
}

const orderId = createOrderId("order-456");
// getUser(orderId); // ← Jetzt: COMPILE-ERROR ✅`,
    explanation: "Type Aliases sind Umbenennung, keine neuen Typen. Für echten Schutz: Brand-Intersection `& { readonly __brand: '...' }` nötig."
  },
  {
    id: 2,
    title: "as-Cast zu früh, vor Validierung",
    description: "Der Smart Constructor castet vor der Validierung. Finde und fixe das Problem.",
    buggyCode: `type Email = string & { readonly __brand: 'Email' };

function createEmail(raw: string): Email {
  const email = raw as Email; // Cast vor Validierung!
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(raw.trim())) {
    throw new Error(\`Ungültige E-Mail: "\${raw}"\`);
  }
  return email;
}

// BUG: email wurde bereits als 'Email' gecastet,
// obwohl die nachfolgende Validierung noch schlagen könnte.
// Das Email-Objekt existiert als 'Email'-Brand bevor Validierung passiert.`,
    errorMessage: "Der Cast passiert vor der Validierung — konzeptionell falsch (der Typ 'verspricht' Validierung, macht sie aber erst danach).",
    fix: `function createEmail(raw: string): Email {
  const normalized = raw.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new Error(\`Ungültige E-Mail: "\${raw}"\`);
  }
  return normalized as Email; // Cast NACH Validierung — korrekt!
}`,
    explanation: "Der as-Cast sollte immer NACH der Validierung passieren. Der Typ 'Email' verspricht: 'Dieser Wert ist eine valide E-Mail'. Dieses Versprechen muss eingehalten werden."
  },
  {
    id: 3,
    title: "Falsche Richtung: Supertyp als Subtyp",
    description: "Die Funktion akzeptiert `Email` aber `sendCritical` benötigt `VerifiedEmail`. Finde den Typ-Fehler.",
    buggyCode: `type Email         = string & { readonly __brand: 'Email' };
type VerifiedEmail = Email & { readonly __verified: true };

function sendCriticalNotification(to: VerifiedEmail): void {
  console.log(\`Kritisch an: \${to}\`);
}

function processUserEmail(email: Email): void {
  // BUG: Email ist KEIN VerifiedEmail — fehlende Prüfung
  sendCriticalNotification(email as VerifiedEmail); // Unsafe cast!
}`,
    errorMessage: "Der as-Cast umgeht den Brand-Schutz. Ein `Email` ist noch nicht VERIFIZIERT — die kritische Funktion bekommt ggf. unverified Email.",
    fix: `function verifyEmail(email: Email): VerifiedEmail | null {
  // Simuliert E-Mail-Verifikationsprozess:
  // In der DB prüfen ob diese E-Mail verifiziert wurde
  const isVerified = checkEmailVerified(email); // externe Prüfung
  return isVerified ? email as VerifiedEmail : null;
}

function processUserEmail(email: Email): void {
  const verified = verifyEmail(email);
  if (!verified) {
    console.log('E-Mail nicht verifiziert — keine kritischen Nachrichten');
    return;
  }
  sendCriticalNotification(verified); // ✅ Sicher — wirklich verifiziert
}

function checkEmailVerified(_email: Email): boolean { return true; }`,
    explanation: "Brand-Hierarchien sind kein Freifahrtschein für unsafe Casts. Wenn `VerifiedEmail` eine echte Bedeutung hat (verifiziert), muss die Verifikation wirklich stattfinden."
  },
  {
    id: 4,
    title: "Einheitenverwechslung ohne Brand-Schutz",
    description: "Die Funktion berechnet Geschwindigkeit, aber wird mit falschen Einheiten aufgerufen. Der Bug ist nicht sichtbar ohne Brands.",
    buggyCode: `// Ohne Brands — alle plain numbers
function velocity(distanceMeter: number, timeSecond: number): number {
  return distanceMeter / timeSecond;
}

const distanceFoot   = 328; // Fuß (nicht Meter!)
const timeMillisecond = 10000; // Millisekunden (nicht Sekunden!)

// Kein Fehler — falsche Einheiten werden akzeptiert!
const v = velocity(distanceFoot, timeMillisecond);
console.log(\`v = \${v} m/s\`); // Falsch! 0.0328 statt 10`,
    errorMessage: "Keine Compile-Zeit-Überprüfung — falsche Einheiten werden akzeptiert und produzieren silently falsches Ergebnis.",
    fix: `type Brand<T, B extends string> = T & { readonly __brand: B };
type Meter  = Brand<number, 'Meter'>;
type Foot   = Brand<number, 'Foot'>;
type Second = Brand<number, 'Second'>;
type MeterPerSecond = Brand<number, 'MeterPerSecond'>;

function velocity(distance: Meter, time: Second): MeterPerSecond {
  return (distance / time) as MeterPerSecond;
}

function footToMeter(f: Foot): Meter { return (f * 0.3048) as Meter; }

const distanceFoot = 328 as Foot;
const timeSec      = 10 as Second;
const distanceMeter = footToMeter(distanceFoot); // Explizite Konversion!

const v = velocity(distanceMeter, timeSec);
// velocity(distanceFoot, timeSec) → ❌ COMPILE-ERROR`,
    explanation: "Mit Brands werden Einheitenverwechslungen zum Compile-Error. Der Mars-Orbiter-Bug wäre mit diesem Ansatz im Editor sichtbar gewesen."
  },
  {
    id: 5,
    title: "Currency-Bug: Verschiedene Währungen addiert",
    description: "Zwei Währungsbeträge werden addiert — aber sie haben verschiedene Währungen!",
    buggyCode: `type EurCents = number & { readonly __brand: 'EurCents' };
type UsdCents = number & { readonly __brand: 'UsdCents' };

// BUG: Funktion akzeptiert number statt typisierte Beträge
function addAmounts(a: number, b: number): number {
  return a + b;
}

const eurPrice = 1999 as EurCents;
const usdTax   = 150  as UsdCents;

// Kann "versehentlich" addiert werden — Brands werden durch 'number' umgangen!
const total = addAmounts(eurPrice, usdTax); // EUR + USD = ???
console.log(\`Total: \${total}\`); // 2149 — falsch!`,
    errorMessage: "Die addAmounts-Funktion akzeptiert `number` statt typisierte Brands — der Brand-Schutz wird umgangen.",
    fix: `type Currency = 'EUR' | 'USD';
type MoneyAmount<C extends Currency> = number & {
  readonly __currency: C;
  readonly __cents: true;
};
type EurCents = MoneyAmount<'EUR'>;
type UsdCents = MoneyAmount<'USD'>;

// Generische Funktion erzwingt gleiche Währung:
function addMoney<C extends Currency>(a: MoneyAmount<C>, b: MoneyAmount<C>): MoneyAmount<C> {
  return (a + b) as MoneyAmount<C>;
}

const eurPrice = 1999 as EurCents;
const eurTax   = 380  as EurCents;
const usdTax   = 150  as UsdCents;

const total = addMoney(eurPrice, eurTax); // ✅ EUR + EUR
// addMoney(eurPrice, usdTax); // ❌ COMPILE-ERROR — EUR ≠ USD`,
    explanation: "Brand-Schutz funktioniert nur wenn die Funktionen selbst Brands verwenden. `addAmounts(a: number)` umgeht den Schutz. Die Lösung: Generische `addMoney<C extends Currency>`."
  }
];

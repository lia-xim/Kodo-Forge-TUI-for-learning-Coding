// transfer-data.ts — L24: Branded/Nominal Types
// 3 Transfer Tasks in NEUEN Kontexten

export interface TransferTask {
  id: number;
  title: string;
  scenario: string;
  task: string;
  requirements: string[];
  starterCode?: string;
  solution: string;
  reflection: string;
}

export const transferTasks: TransferTask[] = [
  {
    id: 1,
    title: "Bankensystem mit Tiered-Account-Typen",
    scenario: "Du arbeitest an einem Bankensystem. Es gibt verschiedene Kontotypen: BasicAccount, PremiumAccount und VIPAccount. Überweisungen zwischen Konten sollen typsicher sein — ein Premium-Feature (VIP-Transfer) darf nicht mit Basic-Accounts aufgerufen werden.",
    task: "Implementiere ein typsicheres Account-ID-System mit Brands. VIPAccountId ist Subtyp von PremiumAccountId, PremiumAccountId ist Subtyp von BasicAccountId. Überweisungs-Funktionen sollen nur die richtigen Account-Typen akzeptieren.",
    requirements: [
      "BasicAccountId, PremiumAccountId, VIPAccountId als Brand-Hierarchie",
      "transfer(from: BasicAccountId, to: BasicAccountId, amount: number): void",
      "premiumTransfer(from: PremiumAccountId, ...): void — akzeptiert auch VIP",
      "vipTransfer(from: VIPAccountId, ...): void — nur VIP",
      "Smart Constructors createBasicAccountId, createPremiumAccountId, etc.",
      "Demo: VIPAccountId kann premiumTransfer aufrufen; BasicAccountId nicht"
    ],
    starterCode: `// Basis-Struktur:
type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO: BasicAccountId definieren
// TODO: PremiumAccountId = BasicAccountId & { __premium: true }
// TODO: VIPAccountId = PremiumAccountId & { __vip: true }

// TODO: Smart Constructors
// TODO: transfer(), premiumTransfer(), vipTransfer()`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };

// Brand-Hierarchie:
type BasicAccountId   = Brand<string, 'BasicAccount'>;
type PremiumAccountId = BasicAccountId & { readonly __premium: true };
type VIPAccountId     = PremiumAccountId & { readonly __vip: true };

// Smart Constructors:
function createBasicId(raw: string): BasicAccountId {
  if (!raw.startsWith('basic-')) throw new Error(\`Ungültig: \${raw}\`);
  return raw as BasicAccountId;
}

function createPremiumId(raw: string): PremiumAccountId {
  if (!raw.startsWith('prem-')) throw new Error(\`Ungültig: \${raw}\`);
  return raw as PremiumAccountId;
}

function createVipId(raw: string): VIPAccountId {
  if (!raw.startsWith('vip-')) throw new Error(\`Ungültig: \${raw}\`);
  return raw as VIPAccountId;
}

// Überweisungs-Funktionen:
function transfer(from: BasicAccountId, to: BasicAccountId, amount: number): void {
  console.log(\`Überweisung: \${from} → \${to}: \${amount}€\`);
}

function premiumTransfer(from: PremiumAccountId, to: PremiumAccountId, amount: number): void {
  console.log(\`Premium: \${from} → \${to}: \${amount}€\`);
}

function vipTransfer(from: VIPAccountId, to: VIPAccountId, amount: number): void {
  console.log(\`VIP-Transfer: \${from} → \${to}: \${amount}€\`);
}

// Demo:
const basic   = createBasicId('basic-001');
const premium = createPremiumId('prem-001');
const vip     = createVipId('vip-001');

transfer(basic, createBasicId('basic-002'), 100);       // ✅
transfer(premium, basic, 200);                           // ✅ PremiumId ist auch BasicId
premiumTransfer(premium, vip, 500);                      // ✅ VIPId ist auch PremiumId
vipTransfer(vip, createVipId('vip-002'), 1000);         // ✅
// premiumTransfer(basic, premium, 100); // ❌ BasicId ≠ PremiumId
// vipTransfer(premium, vip, 100);       // ❌ PremiumId ≠ VIPId`,
    reflection: "Brand-Hierarchien ermöglichen elegante 'Typen-Upgrades': VIP kann alles, was Premium kann; Premium kann alles, was Basic kann. Das entspricht dem Liskov Substitution Principle in der realen Welt."
  },
  {
    id: 2,
    title: "Multi-Tenant API — Tenant-Isolation durch Brands",
    scenario: "Deine Firma baut eine Multi-Tenant SaaS-Plattform. Jeder Tenant (Firma) hat eigene Daten die nicht mit anderen Tenants vermischt werden dürfen. Das Problem: Alle IDs sind strings — ein Bug könnte Tenant A's Daten an Tenant B zeigen.",
    task: "Entwirf ein Brand-System das Tenant-Isolation auf Typ-Ebene garantiert. Datenbankoperationen sollen nur innerhalb eines Tenants funktionieren. Zeige wie der Compiler verhindert dass Tenant A's UserIds mit Tenant B's UserIds verwechselt werden.",
    requirements: [
      "TenantId als Brand-Typ",
      "TenantScopedUserId<T extends TenantId> — an einen Tenant gebunden",
      "TenantContext-Klasse die nur Operationen für den eigenen Tenant zulässt",
      "Demo: TenantA's User kann nicht von TenantB-Repository abgerufen werden",
      "Hinweis: Phantom Types (Tenant als Typ-Parameter, nicht Laufzeit-Parameter) verwenden"
    ],
    starterCode: `// Phantom Type Ansatz:
type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'Tenant'>;

// TODO: TenantScopedId<Tenant> — User-ID die an einen Tenant-Typ gebunden ist
// type TenantScopedId<T extends TenantId> = ...

// Hinweis: Das ist ein Phantom Type (T wird nur im Typ verwendet, nicht im Wert)`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'Tenant'>;

// Phantom Type: T wird nicht im Wert verwendet, nur im Typ
type TenantScopedUserId<T extends string> = string & {
  readonly __userId: true;
  readonly __tenant: T;   // Phantom: nur Typ, kein Laufzeit-Wert!
};

// Konkrete Tenant-Klassen (Typen, nicht Werte):
declare const TenantA: 'TenantA';
declare const TenantB: 'TenantB';

type TenantAUserId = TenantScopedUserId<typeof TenantA>;
type TenantBUserId = TenantScopedUserId<typeof TenantB>;

// Smart Constructors:
function createTenantAUser(raw: string): TenantAUserId {
  return raw as TenantAUserId;
}

function createTenantBUser(raw: string): TenantBUserId {
  return raw as TenantBUserId;
}

// Tenant-scoped Repositories:
class TenantARepository {
  findUser(id: TenantAUserId): string {
    return \`TenantA User: \${id}\`;
  }
}

class TenantBRepository {
  findUser(id: TenantBUserId): string {
    return \`TenantB User: \${id}\`;
  }
}

// Demo:
const userA = createTenantAUser('user-a-001');
const userB = createTenantBUser('user-b-001');
const repoA = new TenantARepository();
const repoB = new TenantBRepository();

console.log(repoA.findUser(userA));           // ✅
console.log(repoB.findUser(userB));           // ✅
// repoA.findUser(userB); // ❌ COMPILE-ERROR — TenantB-User ≠ TenantA-User
// repoB.findUser(userA); // ❌ COMPILE-ERROR — TenantA-User ≠ TenantB-User`,
    reflection: "Phantom Types (Typ-Parameter die nicht im Wert vorkommen) ermöglichen Tenant-Isolation auf Typ-Ebene ohne Laufzeit-Overhead. Das ist eine fortgeschrittene Anwendung von Brands."
  },
  {
    id: 3,
    title: "Angular HTTP-Interceptor mit typisierten Tokens",
    scenario: "Du baust einen Angular Authentication-Service mit zwei Token-Typen: AccessToken (kurzlebig, 15 Minuten) und RefreshToken (langlebig, 30 Tage). Ein häufiger Security-Bug: RefreshToken wird als AccessToken verwendet oder umgekehrt.",
    task: "Implementiere den Auth-Service mit Brands die verhindern dass die Token-Typen verwechselt werden. Der HTTP-Interceptor soll nur AccessToken in den Authorization-Header setzen können, nicht RefreshToken.",
    requirements: [
      "AccessToken und RefreshToken als Brand-Typen",
      "AuthService mit login(), refreshAccess(), getAccessToken()",
      "Interceptor-Funktion addAuthHeader(token: AccessToken, request: Request): Request",
      "Demo: refreshToken kann nicht als accessToken verwendet werden",
      "Bonus: TokenPair<A extends AccessToken, R extends RefreshToken> für Auth-Responses"
    ],
    starterCode: `type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO: AccessToken als Brand
// TODO: RefreshToken als Brand
// TODO: AuthService-Klasse
// TODO: addAuthHeader(token: AccessToken, ...)`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };

type AccessToken  = Brand<string, 'AccessToken'>;
type RefreshToken = Brand<string, 'RefreshToken'>;

interface TokenPair {
  access:  AccessToken;
  refresh: RefreshToken;
}

// Auth-Service (simuliert — ohne echte HTTP-Calls):
class AuthService {
  private accessToken:  AccessToken  | null = null;
  private refreshToken: RefreshToken | null = null;

  login(email: string, password: string): TokenPair {
    // Simuliert: normaler API-Call würde Tokens zurückliefern
    const pair: TokenPair = {
      access:  \`access.jwt.\${email}.short\`  as AccessToken,
      refresh: \`refresh.jwt.\${email}.long\`  as RefreshToken,
    };
    this.accessToken  = pair.access;
    this.refreshToken = pair.refresh;
    return pair;
  }

  getAccessToken(): AccessToken | null {
    return this.accessToken;
  }

  refreshAccess(): AccessToken | null {
    if (!this.refreshToken) return null;
    const newAccess = \`access.refreshed.\${Date.now()}\` as AccessToken;
    this.accessToken = newAccess;
    return newAccess;
  }
}

// HTTP-Interceptor-Simulation:
interface Request { headers: Record<string, string>; method: string; url: string; }

function addAuthHeader(token: AccessToken, request: Request): Request {
  return {
    ...request,
    headers: {
      ...request.headers,
      'Authorization': \`Bearer \${token}\`,  // token verhält sich wie string!
    }
  };
}

// Demo:
const auth = new AuthService();
const tokens = auth.login('max@example.com', 'secret');

const request: Request = { headers: {}, method: 'GET', url: '/api/data' };

const authRequest = addAuthHeader(tokens.access, request);
console.log('Authorization:', authRequest.headers['Authorization']);

// COMPILE-ERRORS:
// addAuthHeader(tokens.refresh, request); // ❌ RefreshToken ≠ AccessToken
// const t: AccessToken = tokens.refresh;  // ❌ RefreshToken ≠ AccessToken`,
    reflection: "Sicherheitskritische Token sollten IMMER als unterschiedliche Brand-Typen modelliert werden. Der Compiler verhindert die häufigste Security-Verwechslung: RefreshToken als AccessToken verwenden oder in den Header schreiben."
  }
];

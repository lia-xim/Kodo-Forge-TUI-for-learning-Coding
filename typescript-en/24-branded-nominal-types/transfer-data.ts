// transfer-data.ts — L24: Branded/Nominal Types
// 3 Transfer Tasks in NEW Contexts

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
    title: "Banking System with Tiered Account Types",
    scenario: "You are working on a banking system. There are different account types: BasicAccount, PremiumAccount, and VIPAccount. Transfers between accounts should be type-safe — a premium feature (VIP-Transfer) must not be callable with Basic accounts.",
    task: "Implement a type-safe Account ID system using brands. VIPAccountId is a subtype of PremiumAccountId, PremiumAccountId is a subtype of BasicAccountId. Transfer functions should only accept the correct account types.",
    requirements: [
      "BasicAccountId, PremiumAccountId, VIPAccountId as a brand hierarchy",
      "transfer(from: BasicAccountId, to: BasicAccountId, amount: number): void",
      "premiumTransfer(from: PremiumAccountId, ...): void — also accepts VIP",
      "vipTransfer(from: VIPAccountId, ...): void — VIP only",
      "Smart Constructors createBasicAccountId, createPremiumAccountId, etc.",
      "Demo: VIPAccountId can call premiumTransfer; BasicAccountId cannot"
    ],
    starterCode: `// Base structure:
type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO: Define BasicAccountId
// TODO: PremiumAccountId = BasicAccountId & { __premium: true }
// TODO: VIPAccountId = PremiumAccountId & { __vip: true }

// TODO: Smart Constructors
// TODO: transfer(), premiumTransfer(), vipTransfer()`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };

// Brand hierarchy:
type BasicAccountId   = Brand<string, 'BasicAccount'>;
type PremiumAccountId = BasicAccountId & { readonly __premium: true };
type VIPAccountId     = PremiumAccountId & { readonly __vip: true };

// Smart constructors:
function createBasicId(raw: string): BasicAccountId {
  if (!raw.startsWith('basic-')) throw new Error(\`Invalid: \${raw}\`);
  return raw as BasicAccountId;
}

function createPremiumId(raw: string): PremiumAccountId {
  if (!raw.startsWith('prem-')) throw new Error(\`Invalid: \${raw}\`);
  return raw as PremiumAccountId;
}

function createVipId(raw: string): VIPAccountId {
  if (!raw.startsWith('vip-')) throw new Error(\`Invalid: \${raw}\`);
  return raw as VIPAccountId;
}

// Transfer functions:
function transfer(from: BasicAccountId, to: BasicAccountId, amount: number): void {
  console.log(\`Transfer: \${from} → \${to}: \${amount}€\`);
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
transfer(premium, basic, 200);                           // ✅ PremiumId is also BasicId
premiumTransfer(premium, vip, 500);                      // ✅ VIPId is also PremiumId
vipTransfer(vip, createVipId('vip-002'), 1000);         // ✅
// premiumTransfer(basic, premium, 100); // ❌ BasicId ≠ PremiumId
// vipTransfer(premium, vip, 100);       // ❌ PremiumId ≠ VIPId`,
    reflection: "Brand hierarchies enable elegant 'type upgrades': VIP can do everything Premium can; Premium can do everything Basic can. This corresponds to the Liskov Substitution Principle in the real world."
  },
  {
    id: 2,
    title: "Multi-Tenant API — Tenant Isolation via Brands",
    scenario: "Your company is building a multi-tenant SaaS platform. Each tenant (company) has its own data that must not be mixed with other tenants' data. The problem: all IDs are strings — a bug could show Tenant A's data to Tenant B.",
    task: "Design a brand system that guarantees tenant isolation at the type level. Database operations should only work within one tenant. Show how the compiler prevents Tenant A's UserIds from being confused with Tenant B's UserIds.",
    requirements: [
      "TenantId as a brand type",
      "TenantScopedUserId<T extends TenantId> — bound to a single tenant",
      "TenantContext class that only allows operations for its own tenant",
      "Demo: TenantA's user cannot be retrieved from TenantB repository",
      "Hint: Use Phantom Types (Tenant as a type parameter, not a runtime parameter)"
    ],
    starterCode: `// Phantom Type approach:
type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'Tenant'>;

// TODO: TenantScopedId<Tenant> — User ID bound to a tenant type
// type TenantScopedId<T extends TenantId> = ...

// Hint: This is a Phantom Type (T is only used in the type, not the value)`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };
type TenantId = Brand<string, 'Tenant'>;

// Phantom Type: T is not used in the value, only in the type
type TenantScopedUserId<T extends string> = string & {
  readonly __userId: true;
  readonly __tenant: T;   // Phantom: type only, no runtime value!
};

// Concrete tenant classes (types, not values):
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
    reflection: "Phantom Types (type parameters that do not appear in the value) enable tenant isolation at the type level without runtime overhead. This is an advanced application of brands."
  },
  {
    id: 3,
    title: "Angular HTTP Interceptor with Typed Tokens",
    scenario: "You are building an Angular authentication service with two token types: AccessToken (short-lived, 15 minutes) and RefreshToken (long-lived, 30 days). A common security bug: RefreshToken is used as AccessToken or vice versa.",
    task: "Implement the auth service using brands that prevent the token types from being confused. The HTTP interceptor should only be able to set an AccessToken in the Authorization header, not a RefreshToken.",
    requirements: [
      "AccessToken and RefreshToken as brand types",
      "AuthService with login(), refreshAccess(), getAccessToken()",
      "Interceptor function addAuthHeader(token: AccessToken, request: Request): Request",
      "Demo: refreshToken cannot be used as accessToken",
      "Bonus: TokenPair<A extends AccessToken, R extends RefreshToken> for auth responses"
    ],
    starterCode: `type Brand<T, B extends string> = T & { readonly __brand: B };

// TODO: AccessToken as brand
// TODO: RefreshToken as brand
// TODO: AuthService class
// TODO: addAuthHeader(token: AccessToken, ...)`,
    solution: `type Brand<T, B extends string> = T & { readonly __brand: B };

type AccessToken  = Brand<string, 'AccessToken'>;
type RefreshToken = Brand<string, 'RefreshToken'>;

interface TokenPair {
  access:  AccessToken;
  refresh: RefreshToken;
}

// Auth service (simulated — no real HTTP calls):
class AuthService {
  private accessToken:  AccessToken  | null = null;
  private refreshToken: RefreshToken | null = null;

  login(email: string, password: string): TokenPair {
    // Simulated: a normal API call would return tokens
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

// HTTP interceptor simulation:
interface Request { headers: Record<string, string>; method: string; url: string; }

function addAuthHeader(token: AccessToken, request: Request): Request {
  return {
    ...request,
    headers: {
      ...request.headers,
      'Authorization': \`Bearer \${token}\`,  // token behaves like a string!
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
    reflection: "Security-critical tokens should ALWAYS be modeled as distinct brand types. The compiler prevents the most common security mistake: using a RefreshToken as an AccessToken or writing it into the header."
  }
];
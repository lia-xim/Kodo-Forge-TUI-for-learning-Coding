/**
 * Lektion 14 - Example 04: Advanced Constraints
 *
 * Ausfuehren mit: npx tsx examples/04-advanced-constraints.ts
 *
 * Conditional Constraints, Recursive Constraints,
 * const Type Parameters (TS 5.0), Mapped Constraints.
 */

// ─── CONDITIONAL CONSTRAINTS ────────────────────────────────────────────────

type ProcessResult<T> = T extends string ? string : number;

function processValue<T extends string | number>(
  value: T
): ProcessResult<T> {
  if (typeof value === "string") {
    return value.toUpperCase() as ProcessResult<T>;
  }
  return (Number(value) * 2) as ProcessResult<T>;
}

console.log("String:", processValue("hello"));  // "HELLO"
console.log("Number:", processValue(21));        // 42

// ─── BEDINGTE PFLICHTFELDER ─────────────────────────────────────────────────

type WithTimestamps<T, HasTS extends boolean> =
  HasTS extends true
    ? T & { createdAt: Date; updatedAt: Date }
    : T;

function createRecord<T extends object, H extends boolean>(
  data: T,
  addTimestamps: H
): WithTimestamps<T, H> {
  if (addTimestamps) {
    return {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as WithTimestamps<T, H>;
  }
  return data as WithTimestamps<T, H>;
}

const withTs = createRecord({ name: "Alice" }, true);
console.log("\nMit Timestamps:", {
  name: withTs.name,
  createdAt: withTs.createdAt.toISOString(),
});

const withoutTs = createRecord({ name: "Bob" }, false);
console.log("Ohne Timestamps:", withoutTs);
// withoutTs.createdAt -> Error! Property existiert nicht im Typ

// ─── RECURSIVE CONSTRAINTS ──────────────────────────────────────────────────

interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

function findInTree<T>(
  node: TreeNode<T>,
  predicate: (value: T) => boolean
): T | undefined {
  if (predicate(node.value)) return node.value;

  for (const child of node.children) {
    const found = findInTree(child, predicate);
    if (found !== undefined) return found;
  }
  return undefined;
}

function treeDepth<T>(node: TreeNode<T>): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(c => treeDepth(c)));
}

const fileTree: TreeNode<string> = {
  value: "/",
  children: [
    {
      value: "/src",
      children: [
        { value: "/src/index.ts", children: [] },
        { value: "/src/utils.ts", children: [] },
        {
          value: "/src/components",
          children: [
            { value: "/src/components/App.tsx", children: [] },
          ],
        },
      ],
    },
    { value: "/package.json", children: [] },
    { value: "/tsconfig.json", children: [] },
  ],
};

console.log("\nBaumsuche:");
console.log("  Utils:", findInTree(fileTree, v => v.includes("utils")));
console.log("  App:", findInTree(fileTree, v => v.includes("App")));
console.log("  Missing:", findInTree(fileTree, v => v.includes("xyz")));
console.log("  Tiefe:", treeDepth(fileTree));

// ─── DEEP PARTIAL ───────────────────────────────────────────────────────────

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: { enabled: boolean; cert: string };
  };
  database: { url: string; poolSize: number };
  logging: { level: "debug" | "info" | "warn" | "error" };
}

const defaultConfig: AppConfig = {
  server: {
    host: "localhost",
    port: 3000,
    ssl: { enabled: false, cert: "" },
  },
  database: { url: "postgres://localhost/app", poolSize: 10 },
  logging: { level: "info" },
};

function mergeConfig(
  base: AppConfig,
  overrides: DeepPartial<AppConfig>
): AppConfig {
  return JSON.parse(JSON.stringify({
    ...base,
    ...overrides,
    server: { ...base.server, ...overrides.server },
    database: { ...base.database, ...overrides.database },
    logging: { ...base.logging, ...overrides.logging },
  }));
}

const prodConfig = mergeConfig(defaultConfig, {
  server: { ssl: { enabled: true, cert: "/etc/ssl/cert.pem" } },
  logging: { level: "warn" },
});

console.log("\nMerged Config:");
console.log("  SSL:", prodConfig.server.ssl.enabled); // true
console.log("  Port:", prodConfig.server.port);       // 3000 (default)
console.log("  Log:", prodConfig.logging.level);      // "warn"

// ─── CONST TYPE PARAMETERS (TS 5.0) ────────────────────────────────────────

// OHNE const — Werte werden geweitert:
function getRoutesWide<T extends readonly string[]>(routes: T): T {
  return routes;
}

const wide = getRoutesWide(["home", "about", "contact"]);
// ^ Typ: string[] — die konkreten Werte gehen verloren

// MIT const — Literal Types bleiben erhalten:
function getRoutesNarrow<const T extends readonly string[]>(routes: T): T {
  return routes;
}

const narrow = getRoutesNarrow(["home", "about", "contact"]);
// ^ Typ: readonly ["home", "about", "contact"]

console.log("\nconst Type Parameters:");
console.log("  Wide:", wide);   // Typ: string[]
console.log("  Narrow:", narrow); // Typ: readonly ["home", "about", "contact"]

// Praktisch: Config-Definition
function defineConfig<const T extends Record<string, unknown>>(config: T): T {
  return config;
}

const appSettings = defineConfig({
  name: "MyApp",
  version: 3,
  features: ["dark-mode", "i18n"],
});
// ^ Typ: { readonly name: "MyApp"; readonly version: 3; readonly features: readonly ["dark-mode", "i18n"] }

console.log("  App:", appSettings.name, "v" + appSettings.version);

// ─── MAPPED CONSTRAINTS ─────────────────────────────────────────────────────

type EventMap = {
  click: { x: number; y: number };
  keydown: { key: string; code: number };
  resize: { width: number; height: number };
};

function on<K extends keyof EventMap>(
  event: K,
  handler: (data: EventMap[K]) => void
): void {
  console.log(`  Registered handler for '${event}'`);
  // Simulation:
  handler({} as EventMap[K]);
}

console.log("\nMapped Constraints:");
on("click", (data) => {
  // data hat Typ { x: number; y: number }
  console.log(`  Click at (${data.x}, ${data.y})`);
});

on("keydown", (data) => {
  // data hat Typ { key: string; code: number }
  console.log(`  Key: ${data.key}, Code: ${data.code}`);
});

console.log("\n--- Alle Constraint-Beispiele erfolgreich! ---");

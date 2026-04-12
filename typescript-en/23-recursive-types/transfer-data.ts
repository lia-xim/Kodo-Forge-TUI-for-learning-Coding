/**
 * Lesson 23 — Transfer Tasks: Recursive Types
 *
 * These tasks take the concepts from the Recursive Types lesson
 * and apply them in completely new contexts:
 *
 *  1. Type-safe JSON config loader for a CLI tool (DevOps)
 *  2. Recursive diff type that finds differences between objects (State-Management)
 *  3. Nested routing system with type-safe paths (Custom Router)
 *
 * No external dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Type-safe JSON Config Loader ────────────────────────────────
  {
    id: "23-json-config-loader",
    title: "Type-safe JSON Config Loader for a CLI Tool",
    prerequisiteLessons: [23, 15, 17],
    scenario:
      "You are building a CLI tool (e.g. a static site generator) that " +
      "reads a JSON configuration file. The configuration can be " +
      "arbitrarily deeply nested and should be accessible via dot-paths: " +
      "config.get('build.output.dir'). " +
      "Currently the team uses `any` everywhere and typos in " +
      "config paths only surface at runtime.",
    task:
      "Create a type-safe config system:\n\n" +
      "1. Define a `JsonValue` type for raw JSON data\n" +
      "2. Define the concrete `CliConfig` type with build, serve, deploy sections\n" +
      "3. Create `Paths<T>` and `PathValue<T, P>` utility types\n" +
      "4. Create a `ConfigLoader` class with:\n" +
      "   - `load(json: string): CliConfig` (with validation)\n" +
      "   - `get<P extends Paths<CliConfig>>(path: P): PathValue<CliConfig, P>`\n" +
      "   - `merge(overrides: DeepPartial<CliConfig>): CliConfig`\n" +
      "5. Bonus: Implement environment variable overrides " +
      "   (e.g. CLI_BUILD_OUTPUT_DIR overrides build.output.dir)",
    starterCode: `// Your config type
type CliConfig = {
  build: {
    output: { dir: string; clean: boolean };
    minify: boolean;
  };
  serve: { port: number; host: string };
  deploy: {
    target: "s3" | "ftp" | "git";
    credentials: { user: string; key: string };
  };
};

// Your Paths type
type Paths<T> = ???;

// Your PathValue type
type PathValue<T, P extends string> = ???;

// Your DeepPartial type
type DeepPartial<T> = ???;

// Your class
class ConfigLoader {
  private config: CliConfig | null = null;

  load(json: string): CliConfig {
    // TODO: parse and validate JSON
  }

  get<P extends Paths<CliConfig> & string>(path: P): PathValue<CliConfig, P> {
    // TODO: type-safe path access
  }

  merge(overrides: DeepPartial<CliConfig>): CliConfig {
    // TODO: Deep Merge
  }
}`,
    solutionCode: `type Paths<T> = T extends object
  ? { [K in keyof T & string]: K | \`\${K}.\${Paths<T[K]>}\` }[keyof T & string]
  : never;

type PathValue<T, P extends string> =
  P extends \`\${infer H}.\${infer R}\`
    ? H extends keyof T ? PathValue<T[H], R> : never
    : P extends keyof T ? T[P] : never;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (infer U)[]
    ? DeepPartial<U>[] : T[K] extends object
    ? DeepPartial<T[K]> : T[K];
};

type CliConfig = {
  build: { output: { dir: string; clean: boolean }; minify: boolean };
  serve: { port: number; host: string };
  deploy: { target: "s3" | "ftp" | "git"; credentials: { user: string; key: string } };
};

class ConfigLoader {
  private config: CliConfig | null = null;

  load(json: string): CliConfig {
    const raw = JSON.parse(json);
    // Minimal validation:
    if (!raw.build || !raw.serve || !raw.deploy) {
      throw new Error("Invalid configuration");
    }
    this.config = raw as CliConfig;
    return this.config;
  }

  get<P extends Paths<CliConfig> & string>(path: P): PathValue<CliConfig, P> {
    if (!this.config) throw new Error("Config not loaded");
    const keys = path.split(".");
    let current: unknown = this.config;
    for (const key of keys) {
      current = (current as Record<string, unknown>)[key];
    }
    return current as PathValue<CliConfig, P>;
  }

  merge(overrides: DeepPartial<CliConfig>): CliConfig {
    if (!this.config) throw new Error("Config not loaded");
    this.config = this.deepMerge(this.config, overrides) as CliConfig;
    return this.config;
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key]; const tv = result[key];
      if (sv && typeof sv === "object" && !Array.isArray(sv) && tv && typeof tv === "object") {
        result[key] = this.deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>);
      } else if (sv !== undefined) { result[key] = sv; }
    }
    return result;
  }
}`,
    conceptsBridged: [
      "Recursive types (JsonValue, DeepPartial)",
      "Paths and PathValue for type-safe access",
      "Runtime validation vs type assertions",
      "DeepPartial for config overrides",
    ],
    hints: [
      "Start with the JsonValue type as the foundation for parsing.",
      "Paths<T> uses mapped types + template literals + recursion.",
      "The get method only needs path.split('.').reduce() at runtime.",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Recursive Diff Type ─────────────────────────────────────────
  {
    id: "23-recursive-diff",
    title: "Recursive Diff Type for State Management",
    prerequisiteLessons: [23, 16, 17],
    scenario:
      "You are working on a state management system (similar to NgRx " +
      "or Redux). The team wants to see WHICH fields changed on every " +
      "state update — not just whether something changed. Currently " +
      "the entire state is compared, which is inefficient for large " +
      "state trees.",
    task:
      "Create a deep diff system:\n\n" +
      "1. Define a `Diff<T>` type that indicates for each field:\n" +
      "   - 'unchanged' | 'added' | 'removed' | 'modified' | Diff<Sub>\n" +
      "2. Write a `deepDiff<T>(prev: T, next: T): Diff<T>` function\n" +
      "3. Write a `changedPaths<T>(diff: Diff<T>): string[]` function " +
      "   that returns all changed paths as dot-separated strings\n" +
      "4. Bonus: Create a `Patch<T>` type that contains only the changed " +
      "   fields (DeepPartial but only for changes)",
    starterCode: `type DiffResult = "unchanged" | "added" | "removed" | "modified";

type Diff<T> = {
  [K in keyof T]: T[K] extends object
    ? Diff<T[K]> | DiffResult
    : DiffResult;
};

type AppState = {
  user: { name: string; email: string };
  settings: { theme: "light" | "dark"; lang: string };
  counter: number;
};

function deepDiff<T extends Record<string, unknown>>(
  prev: T, next: T
): Diff<T> {
  // TODO: Implement
}

function changedPaths<T>(diff: Diff<T>, prefix?: string): string[] {
  // TODO: Implement
}`,
    solutionCode: `type DiffResult = "unchanged" | "added" | "removed" | "modified";
type Diff<T> = { [K in keyof T]: T[K] extends object ? Diff<T[K]> | DiffResult : DiffResult };

type AppState = {
  user: { name: string; email: string };
  settings: { theme: "light" | "dark"; lang: string };
  counter: number;
};

function deepDiff<T extends Record<string, unknown>>(prev: T, next: T): Diff<T> {
  const result: Record<string, unknown> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of allKeys) {
    const pv = prev[key], nv = next[key];
    if (!(key in prev)) { result[key] = "added"; }
    else if (!(key in next)) { result[key] = "removed"; }
    else if (pv && nv && typeof pv === "object" && typeof nv === "object" && !Array.isArray(pv)) {
      result[key] = deepDiff(pv as Record<string, unknown>, nv as Record<string, unknown>);
    } else if (pv !== nv) { result[key] = "modified"; }
    else { result[key] = "unchanged"; }
  }
  return result as Diff<T>;
}

function changedPaths<T>(diff: Diff<T>, prefix?: string): string[] {
  const paths: string[] = [];
  for (const [key, value] of Object.entries(diff as Record<string, unknown>)) {
    const fullPath = prefix ? \`\${prefix}.\${key}\` : key;
    if (typeof value === "string" && value !== "unchanged") { paths.push(fullPath); }
    else if (typeof value === "object" && value !== null) {
      paths.push(...changedPaths(value as Diff<unknown>, fullPath));
    }
  }
  return paths;
}`,
    conceptsBridged: [
      "Recursive types for diff computation",
      "Deep comparison with conditional types",
      "Path generation through recursive traversal",
    ],
    hints: [
      "Start with the Diff type: each property is either a DiffResult or a nested Diff.",
      "The deepDiff function checks all keys of both objects and compares recursively.",
      "changedPaths collects paths only for fields that are not 'unchanged'.",
    ],
    difficulty: 4,
  },

  // ─── Task 3: Nested Routing System ───────────────────────────────────────
  {
    id: "23-nested-router",
    title: "Nested Routing with Type-safe Paths",
    prerequisiteLessons: [23, 18, 14],
    scenario:
      "You are building a custom router for a terminal-based " +
      "dashboard (not a web app, but a TUI). Routes " +
      "should be definable in a nested way and the router " +
      "should offer type-safe navigate() calls — incorrect paths " +
      "must be caught at compile time.",
    task:
      "Create a type-safe routing system:\n\n" +
      "1. Define a `Route` type with path, handler, and children (recursive)\n" +
      "2. Create an `ExtractPaths<R>` type that computes all possible paths " +
      "   from the route configuration\n" +
      "3. Create a `Router<R>` class with:\n" +
      "   - `navigate(path: ExtractPaths<R>): void`\n" +
      "   - `match(url: string): Route | null` (recursive search)\n" +
      "4. Define an example route configuration with at least 3 levels\n" +
      "5. Bonus: Support parameter routes (:id) and extract " +
      "   the parameter types",
    starterCode: `type Route = {
  path: string;
  handler: () => void;
  children?: Route[];
};

// TODO: ExtractPaths<R> type
type ExtractPaths<R extends Route> = ???;

// TODO: Router class
class Router<R extends Route> {
  constructor(private routes: R) {}

  navigate(path: ExtractPaths<R>): void {
    // TODO
  }

  match(url: string): Route | null {
    // TODO: Recursive search
  }
}

// Example routes:
const routes = {
  path: "",
  handler: () => console.log("Root"),
  children: [
    {
      path: "dashboard",
      handler: () => console.log("Dashboard"),
      children: [
        { path: "stats", handler: () => console.log("Stats") },
        { path: "logs", handler: () => console.log("Logs") },
      ],
    },
    { path: "settings", handler: () => console.log("Settings") },
  ],
} as const;`,
    solutionCode: `type Route = { path: string; handler: () => void; children?: readonly Route[] };

type ExtractPaths<R extends Route> =
  R extends { path: infer P extends string; children?: infer C }
    ? C extends readonly Route[]
      ? P | \`\${P}/\${ExtractPaths<C[number]>}\`
      : P
    : never;

class Router<R extends Route> {
  constructor(private root: R) {}

  navigate(path: ExtractPaths<R> & string): void {
    const route = this.match(path);
    if (route) {
      console.log(\`Navigating to: \${path}\`);
      route.handler();
    } else {
      console.log(\`Route not found: \${path}\`);
    }
  }

  match(url: string): Route | null {
    const segments = url.split("/").filter(Boolean);
    return this.findRoute(this.root, segments, 0);
  }

  private findRoute(route: Route, segments: string[], index: number): Route | null {
    if (index >= segments.length) return route;
    if (!route.children) return null;
    for (const child of route.children) {
      if (child.path === segments[index]) {
        return this.findRoute(child, segments, index + 1);
      }
    }
    return null;
  }
}

const routes = {
  path: "", handler: () => console.log("Root"),
  children: [
    { path: "dashboard", handler: () => console.log("Dashboard"),
      children: [
        { path: "stats", handler: () => console.log("Stats") },
        { path: "logs", handler: () => console.log("Logs") },
      ] },
    { path: "settings", handler: () => console.log("Settings") },
  ],
} as const satisfies Route;

const router = new Router(routes);
router.navigate("dashboard/stats");`,
    conceptsBridged: [
      "Recursive route definitions",
      "ExtractPaths from nested configuration",
      "Template literal types for path concatenation",
      "Recursive search at runtime",
    ],
    hints: [
      "ExtractPaths uses template literal types: `${ParentPath}/${ChildPath}`.",
      "C extends readonly Route[] checks whether children exist; C[number] is the union type of all children.",
      "The match function splits the URL into segments and searches recursively.",
    ],
    difficulty: 5,
  },
];
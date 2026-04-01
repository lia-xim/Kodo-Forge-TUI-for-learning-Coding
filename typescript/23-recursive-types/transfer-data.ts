/**
 * Lektion 23 — Transfer Tasks: Recursive Types
 *
 * Diese Tasks nehmen die Konzepte aus der Recursive-Types-Lektion
 * und wenden sie in komplett neuen Kontexten an:
 *
 *  1. Typsicherer JSON-Config-Loader fuer ein CLI-Tool (DevOps)
 *  2. Rekursiver Diff-Typ der Unterschiede zwischen Objekten findet (State-Management)
 *  3. Verschachteltes Routing-System mit typsicheren Pfaden (Custom Router)
 *
 * Keine externen Dependencies.
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  // ─── Task 1: Typsicherer JSON-Config-Loader ──────────────────────────────
  {
    id: "23-json-config-loader",
    title: "Typsicherer JSON-Config-Loader fuer ein CLI-Tool",
    prerequisiteLessons: [23, 15, 17],
    scenario:
      "Du baust ein CLI-Tool (z.B. einen Static-Site-Generator) das " +
      "eine JSON-Konfigurationsdatei liest. Die Konfiguration kann " +
      "beliebig tief verschachtelt sein und soll per Punkt-Pfaden " +
      "zugaenglich sein: config.get('build.output.dir'). " +
      "Aktuell nutzt das Team `any` ueberall und Tippfehler in " +
      "Config-Pfaden fallen erst zur Laufzeit auf.",
    task:
      "Erstelle ein typsicheres Config-System:\n\n" +
      "1. Definiere einen `JsonValue`-Typ fuer die rohen JSON-Daten\n" +
      "2. Definiere den konkreten `CliConfig`-Typ mit build, serve, deploy Sektionen\n" +
      "3. Erstelle `Paths<T>` und `PathValue<T, P>` Utility-Typen\n" +
      "4. Erstelle eine `ConfigLoader`-Klasse mit:\n" +
      "   - `load(json: string): CliConfig` (mit Validierung)\n" +
      "   - `get<P extends Paths<CliConfig>>(path: P): PathValue<CliConfig, P>`\n" +
      "   - `merge(overrides: DeepPartial<CliConfig>): CliConfig`\n" +
      "5. Bonus: Implementiere Environment-Variable-Overrides " +
      "   (z.B. CLI_BUILD_OUTPUT_DIR ueberschreibt build.output.dir)",
    starterCode: `// Dein Config-Typ
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

// Dein Paths-Typ
type Paths<T> = ???;

// Dein PathValue-Typ
type PathValue<T, P extends string> = ???;

// Dein DeepPartial-Typ
type DeepPartial<T> = ???;

// Deine Klasse
class ConfigLoader {
  private config: CliConfig | null = null;

  load(json: string): CliConfig {
    // TODO: JSON parsen und validieren
  }

  get<P extends Paths<CliConfig> & string>(path: P): PathValue<CliConfig, P> {
    // TODO: Typsicherer Pfad-Zugriff
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
    // Minimale Validierung:
    if (!raw.build || !raw.serve || !raw.deploy) {
      throw new Error("Ungueltige Konfiguration");
    }
    this.config = raw as CliConfig;
    return this.config;
  }

  get<P extends Paths<CliConfig> & string>(path: P): PathValue<CliConfig, P> {
    if (!this.config) throw new Error("Config nicht geladen");
    const keys = path.split(".");
    let current: unknown = this.config;
    for (const key of keys) {
      current = (current as Record<string, unknown>)[key];
    }
    return current as PathValue<CliConfig, P>;
  }

  merge(overrides: DeepPartial<CliConfig>): CliConfig {
    if (!this.config) throw new Error("Config nicht geladen");
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
      "Rekursive Typen (JsonValue, DeepPartial)",
      "Paths und PathValue fuer typsicheren Zugriff",
      "Laufzeit-Validierung vs Type Assertions",
      "DeepPartial fuer Config-Overrides",
    ],
    hints: [
      "Beginne mit dem JsonValue-Typ als Grundlage fuer das Parsen.",
      "Paths<T> nutzt Mapped Types + Template Literals + Rekursion.",
      "Der get-Methode reicht path.split('.').reduce() zur Laufzeit.",
    ],
    difficulty: 4,
  },

  // ─── Task 2: Rekursiver Diff-Typ ─────────────────────────────────────────
  {
    id: "23-recursive-diff",
    title: "Rekursiver Diff-Typ fuer State-Management",
    prerequisiteLessons: [23, 16, 17],
    scenario:
      "Du arbeitest an einem State-Management-System (aehnlich zu NgRx " +
      "oder Redux). Das Team moechte bei jedem State-Update sehen, " +
      "WELCHE Felder sich geaendert haben — nicht nur ob sich etwas " +
      "geaendert hat. Aktuell wird der gesamte State verglichen, " +
      "was bei grossen State-Trees ineffizient ist.",
    task:
      "Erstelle ein Deep-Diff-System:\n\n" +
      "1. Definiere einen `Diff<T>`-Typ der fuer jedes Feld angibt:\n" +
      "   - 'unchanged' | 'added' | 'removed' | 'modified' | Diff<Sub>\n" +
      "2. Schreibe eine `deepDiff<T>(prev: T, next: T): Diff<T>` Funktion\n" +
      "3. Schreibe eine `changedPaths<T>(diff: Diff<T>): string[]` Funktion " +
      "   die alle geaenderten Pfade als Punkt-getrennte Strings zurueckgibt\n" +
      "4. Bonus: Erstelle einen `Patch<T>`-Typ der nur die geaenderten " +
      "   Felder enthaelt (DeepPartial aber nur fuer Aenderungen)",
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
  // TODO: Implementiere
}

function changedPaths<T>(diff: Diff<T>, prefix?: string): string[] {
  // TODO: Implementiere
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
      "Rekursive Typen fuer Diff-Berechnung",
      "Deep-Vergleich mit Conditional Types",
      "Pfad-Generierung durch rekursive Traversierung",
    ],
    hints: [
      "Beginne mit dem Diff-Typ: Jede Property ist entweder ein DiffResult oder ein verschachtelter Diff.",
      "Die deepDiff-Funktion prueft alle Schluessel beider Objekte und vergleicht rekursiv.",
      "changedPaths sammelt Pfade nur fuer Felder die nicht 'unchanged' sind.",
    ],
    difficulty: 4,
  },

  // ─── Task 3: Verschachteltes Routing-System ──────────────────────────────
  {
    id: "23-nested-router",
    title: "Verschachteltes Routing mit typsicheren Pfaden",
    prerequisiteLessons: [23, 18, 14],
    scenario:
      "Du baust einen eigenen Router fuer ein Terminal-basiertes " +
      "Dashboard (keine Web-App, sondern eine TUI). Die Routen " +
      "sollen verschachtelt definiert werden koennen und der Router " +
      "soll typsichere navigate()-Aufrufe bieten — falsche Pfade " +
      "muessen zur Compilezeit erkannt werden.",
    task:
      "Erstelle ein typsicheres Routing-System:\n\n" +
      "1. Definiere einen `Route`-Typ mit path, handler und children (rekursiv)\n" +
      "2. Erstelle einen `ExtractPaths<R>`-Typ der alle moeglichen Pfade " +
      "   aus der Route-Konfiguration berechnet\n" +
      "3. Erstelle eine `Router<R>` Klasse mit:\n" +
      "   - `navigate(path: ExtractPaths<R>): void`\n" +
      "   - `match(url: string): Route | null` (rekursive Suche)\n" +
      "4. Definiere eine Beispiel-Route-Konfiguration mit mind. 3 Ebenen\n" +
      "5. Bonus: Unterstuetze Parameter-Routen (:id) und extrahiere " +
      "   die Parameter-Typen",
    starterCode: `type Route = {
  path: string;
  handler: () => void;
  children?: Route[];
};

// TODO: ExtractPaths<R> Typ
type ExtractPaths<R extends Route> = ???;

// TODO: Router Klasse
class Router<R extends Route> {
  constructor(private routes: R) {}

  navigate(path: ExtractPaths<R>): void {
    // TODO
  }

  match(url: string): Route | null {
    // TODO: Rekursive Suche
  }
}

// Beispiel-Routen:
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
      console.log(\`Navigiere zu: \${path}\`);
      route.handler();
    } else {
      console.log(\`Route nicht gefunden: \${path}\`);
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
      "Rekursive Route-Definitionen",
      "ExtractPaths aus verschachtelter Konfiguration",
      "Template Literal Types fuer Pfad-Konkatenation",
      "Rekursive Suche zur Laufzeit",
    ],
    hints: [
      "ExtractPaths nutzt Template Literal Types: `${ParentPath}/${ChildPath}`.",
      "C extends readonly Route[] prueft ob Kinder existieren; C[number] ist der Union-Typ aller Kinder.",
      "Die match-Funktion teilt den URL in Segmente und sucht rekursiv.",
    ],
    difficulty: 5,
  },
];

/**
 * Lektion 08 — Transfer Tasks: Type Aliases vs Interfaces
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "08-plugin-system",
    title: "Typsicheres Plugin-System mit Declaration Merging",
    prerequisiteLessons: [8],
    scenario:
      "Du baust ein Plugin-System fuer eine App. Plugins sollen " +
      "die App-Konfiguration erweitern koennen, ohne den Core-Code " +
      "zu aendern. Aktuell fuegt jedes Plugin seine Config-Properties " +
      "per 'any' hinzu — keine Typsicherheit.",
    task:
      "Erstelle ein Plugin-System mit Declaration Merging:\n\n" +
      "1. Definiere ein Core-AppConfig Interface\n" +
      "2. Erstelle 2 Plugins die AppConfig per Declaration Merging erweitern\n" +
      "3. Zeige dass die erweiterte Config typsicher ist\n" +
      "4. Erklaere warum hier interface (nicht type) die einzige Option ist",
    starterCode: [
      "// Core-Config",
      "interface AppConfig {",
      "  appName: string;",
      "  version: string;",
      "}",
      "",
      "// TODO: Plugin 1 erweitert AppConfig",
      "// TODO: Plugin 2 erweitert AppConfig",
      "// TODO: Typsichere Verwendung",
    ].join("\n"),
    solutionCode: [
      "// ═══ Core-Config ═══",
      "interface AppConfig {",
      "  appName: string;",
      "  version: string;",
      "}",
      "",
      "// ═══ Plugin 1: Analytics ═══",
      "interface AppConfig {",
      "  analytics: {",
      "    trackingId: string;",
      "    enabled: boolean;",
      "  };",
      "}",
      "",
      "// ═══ Plugin 2: Theme ═══",
      "interface AppConfig {",
      "  theme: {",
      "    primaryColor: string;",
      "    darkMode: boolean;",
      "  };",
      "}",
      "",
      "// ═══ Verwendung: Alles zusammengefuehrt! ═══",
      "const config: AppConfig = {",
      "  appName: 'MyApp',",
      "  version: '1.0.0',",
      "  analytics: { trackingId: 'UA-123', enabled: true },",
      "  theme: { primaryColor: '#007bff', darkMode: false },",
      "};",
      "",
      "// TypeScript kennt ALLE Properties — volle Typsicherheit!",
      "console.log(config.analytics.trackingId);",
      "console.log(config.theme.primaryColor);",
      "",
      "// Warum interface? type-Aliases koennen nicht gemerged werden.",
      "// Jede Datei deklariert interface AppConfig und fuegt Properties hinzu.",
      "// Das ist nur mit Interfaces moeglich (Declaration Merging).",
    ].join("\n"),
    conceptsBridged: [
      "Declaration Merging (interface-only)",
      "Plugin-Architektur ohne Code-Aenderung",
      "type vs interface Entscheidung (hier: interface Pflicht)",
    ],
    hints: [
      "Declaration Merging funktioniert nur mit interface — drei Deklarationen mit gleichem Namen.",
      "Jedes Plugin deklariert interface AppConfig { ... } und fuegt seine Properties hinzu.",
      "Am Ende hat AppConfig ALLE Properties aus allen Deklarationen zusammengefuehrt.",
    ],
    difficulty: 3,
  },

  {
    id: "08-domain-model",
    title: "Domain-Modell mit interface-extends und type-Utilities",
    prerequisiteLessons: [8],
    scenario:
      "Du modellierst ein E-Commerce-Domain-Modell. Es gibt " +
      "eine Vererbungshierarchie fuer Entities und verschiedene " +
      "Utility-Types fuer API-DTOs (CreateDto, UpdateDto).",
    task:
      "Erstelle ein Domain-Modell das interface UND type kombiniert:\n\n" +
      "1. Interface-Hierarchie: BaseEntity → Product → DigitalProduct\n" +
      "2. type CreateProductDto = Omit<Product, 'id' | 'createdAt'>\n" +
      "3. type UpdateProductDto = Partial<Omit<Product, 'id'>>\n" +
      "4. Erklaere warum du interface fuer die Hierarchie und type fuer die DTOs verwendest",
    starterCode: [
      "// TODO: BaseEntity Interface",
      "// TODO: Product extends BaseEntity",
      "// TODO: DigitalProduct extends Product",
      "// TODO: CreateDto und UpdateDto mit Utility Types",
    ].join("\n"),
    solutionCode: [
      "// ═══ Interface-Hierarchie (extends fuer Vererbung) ═══",
      "interface BaseEntity {",
      "  id: string;",
      "  createdAt: Date;",
      "  updatedAt: Date;",
      "}",
      "",
      "interface Product extends BaseEntity {",
      "  name: string;",
      "  price: number;",
      "  category: string;",
      "}",
      "",
      "interface DigitalProduct extends Product {",
      "  downloadUrl: string;",
      "  fileSize: number;",
      "}",
      "",
      "// ═══ Type-Utilities fuer DTOs (Mapped Types → nur type) ═══",
      "type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;",
      "// { name: string; price: number; category: string }",
      "",
      "type UpdateProductDto = Partial<Omit<Product, 'id' | 'createdAt'>>;",
      "// { name?: string; price?: number; category?: string; updatedAt?: Date }",
      "",
      "// ═══ Warum diese Kombination? ═══",
      "// interface fuer Hierarchie: extends ist schneller, meldet Konflikte,",
      "//   und die Objekt-Form ist klar (Angular/Enterprise-Style).",
      "// type fuer DTOs: Omit, Partial, Pick sind Mapped Types —",
      "//   die gehen NUR mit type.",
    ].join("\n"),
    conceptsBridged: [
      "Interface extends fuer Vererbungshierarchie",
      "Type fuer Mapped/Utility Types (Omit, Partial)",
      "Kombinierter Einsatz beider Konstrukte",
      "Entscheidungsmatrix in der Praxis",
    ],
    hints: [
      "Die Entity-Hierarchie ist ideal fuer interface extends — klare Vererbung, Konflikterkennung.",
      "DTOs brauchen Utility Types (Omit, Partial) — die funktionieren nur mit type.",
      "Das ist das Muster fuer die Praxis: Interfaces fuer Objekt-Formen, Types fuer Transformationen.",
    ],
    difficulty: 3,
  },
];
